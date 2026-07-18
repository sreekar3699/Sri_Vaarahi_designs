package com.vaarahidesigns.vaarahidesigns.controller;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.vaarahidesigns.vaarahidesigns.entity.Address;
import com.vaarahidesigns.vaarahidesigns.entity.Order;
import com.vaarahidesigns.vaarahidesigns.entity.Payment;
import com.vaarahidesigns.vaarahidesigns.entity.Product;
import com.vaarahidesigns.vaarahidesigns.entity.User;
import com.vaarahidesigns.vaarahidesigns.repository.AddressRepository;
import com.vaarahidesigns.vaarahidesigns.repository.OrderRepository;
import com.vaarahidesigns.vaarahidesigns.repository.PaymentRepository;
import com.vaarahidesigns.vaarahidesigns.repository.ProductRepository;
import com.vaarahidesigns.vaarahidesigns.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/razorpay")
@RequiredArgsConstructor
public class RazorpayController {

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;

    // ─── DTOs — amount is NEVER accepted from the client ───

    public record CreateOrderRequest(
        int userId,
        int addressId,
        List<Integer> productIds,
        List<Integer> quantities
    ) {}

    public record VerifyPaymentRequest(
        String razorpayOrderId,
        String razorpayPaymentId,
        String razorpaySignature,
        int userId,
        int addressId,
        List<Integer> productIds,
        List<Integer> quantities
    ) {}

    public record CodOrderRequest(
        int userId,
        int addressId,
        List<Integer> productIds,
        List<Integer> quantities
    ) {}

    // ─── Internal: calculate server-side total from DB prices ───
    /**
     * Fetch products from DB, apply discount, multiply by qty, add flat shipping.
     * Never trusts any price sent from the frontend.
     */
    private double calculateServerTotal(List<Integer> productIds, List<Integer> quantities) {
        double subtotal = 0.0;
        for (int i = 0; i < productIds.size(); i++) {
            int qty = quantities.size() > i ? quantities.get(i) : 1;
            Product p = productRepository.findById(productIds.get(i)).orElse(null);
            if (p == null) continue;
            double basePrice = p.getPrice() != null ? p.getPrice().doubleValue() : 0.0;
            int discount = p.getDiscount() != null ? p.getDiscount() : 0;
            double effectivePrice = basePrice * (1.0 - discount / 100.0);
            subtotal += effectivePrice * qty;
        }
        double shipping = subtotal > 2000 ? 0 : 99;
        return subtotal + shipping;
    }

    /**
     * Step 1 — Create a Razorpay order.
     * Amount is computed from the DB; nothing from the client is trusted for pricing.
     */
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest req) {
        // Validate product IDs exist
        if (req.productIds() == null || req.productIds().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No products provided"));
        }

        // ✅ Price comes from the database, not the request body
        double serverTotal = calculateServerTotal(req.productIds(), req.quantities());
        int amountInPaise = (int) Math.round(serverTotal * 100);

        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);   // paise, from DB
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "rcpt_" + System.currentTimeMillis());

            com.razorpay.Order razorpayOrder = client.orders.create(orderRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", razorpayOrder.get("id"));
            response.put("amount", razorpayOrder.get("amount"));   // paise confirmed by Razorpay
            response.put("currency", razorpayOrder.get("currency"));
            response.put("keyId", keyId);
            response.put("serverTotal", serverTotal);   // INR, informational only

            return ResponseEntity.ok(response);
        } catch (RazorpayException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Step 2 — Verify Razorpay HMAC signature, persist Payment + Orders.
     * Amount is re-computed from the DB; the frontend amount field is ignored.
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody VerifyPaymentRequest req) {
        // ✅ Re-calculate amount from DB — never use any amount from the request
        double serverTotal = calculateServerTotal(req.productIds(), req.quantities());

        // Verify HMAC SHA256 signature
        boolean signatureValid = false;
        try {
            String payload = req.razorpayOrderId() + "|" + req.razorpayPaymentId();
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                String h = Integer.toHexString(0xff & b);
                if (h.length() == 1) hex.append('0');
                hex.append(h);
            }
            signatureValid = hex.toString().equals(req.razorpaySignature());
        } catch (Exception ignored) {}

        String paymentStatus = signatureValid ? "SUCCESS" : "FAILED";

        // Persist Payment record with the authoritative server-calculated amount
        Payment payment = new Payment();
        payment.setAmount(serverTotal);          // ✅ from DB, not client
        payment.setPaymentMethod("RAZORPAY");
        payment.setStatus(paymentStatus);
        payment.setRazorpayOrderId(req.razorpayOrderId());
        payment.setRazorpayPaymentId(req.razorpayPaymentId());
        payment.setRazorpaySignature(req.razorpaySignature());
        Payment savedPayment = paymentRepository.save(payment);

        // Persist Orders
        User user = userRepository.findById(req.userId()).orElse(null);
        Address address = addressRepository.findById(req.addressId()).orElse(null);
        List<Order> savedOrders = new ArrayList<>();

        for (int i = 0; i < req.productIds().size(); i++) {
            int qty = req.quantities().size() > i ? req.quantities().get(i) : 1;
            Product product = productRepository.findById(req.productIds().get(i)).orElse(null);
            if (product == null) continue;

            Order order = new Order();
            order.setUser(user);
            order.setProduct(product);
            order.setAddress(address);
            order.setPaymentMethod("RAZORPAY");
            order.setStatus(signatureValid ? "CONFIRMED" : "PAYMENT_FAILED");
            order.setPayment(savedPayment);
            order.setQuantity(qty);
            savedOrders.add(orderRepository.save(order));
        }

        return ResponseEntity.ok(Map.of(
            "status", paymentStatus,
            "paymentId", savedPayment.getId(),
            "orderCount", savedOrders.size(),
            "message", signatureValid ? "Payment verified and order confirmed!" : "Payment failed — record saved."
        ));
    }

    /**
     * COD — Persist Payment (PENDING) + Orders directly.
     * Amount comes from DB, not the client.
     */
    @PostMapping("/cod")
    public ResponseEntity<?> placeCodOrder(@RequestBody CodOrderRequest req) {
        // ✅ Price from DB
        double serverTotal = calculateServerTotal(req.productIds(), req.quantities());

        Payment payment = new Payment();
        payment.setAmount(serverTotal);          // ✅ from DB, not client
        payment.setPaymentMethod("COD");
        payment.setStatus("PENDING");
        Payment savedPayment = paymentRepository.save(payment);

        User user = userRepository.findById(req.userId()).orElse(null);
        Address address = addressRepository.findById(req.addressId()).orElse(null);
        List<Order> savedOrders = new ArrayList<>();

        for (int i = 0; i < req.productIds().size(); i++) {
            int qty = req.quantities().size() > i ? req.quantities().get(i) : 1;
            Product product = productRepository.findById(req.productIds().get(i)).orElse(null);
            if (product == null) continue;

            Order order = new Order();
            order.setUser(user);
            order.setProduct(product);
            order.setAddress(address);
            order.setPaymentMethod("COD");
            order.setStatus("PENDING");
            order.setPayment(savedPayment);
            order.setQuantity(qty);
            savedOrders.add(orderRepository.save(order));
        }

        return ResponseEntity.ok(Map.of(
            "status", "PENDING",
            "paymentId", savedPayment.getId(),
            "orderCount", savedOrders.size(),
            "message", "Order placed! Pay on delivery."
        ));
    }
}
