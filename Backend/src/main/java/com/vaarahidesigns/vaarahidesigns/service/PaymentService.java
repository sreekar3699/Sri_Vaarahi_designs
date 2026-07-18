package com.vaarahidesigns.vaarahidesigns.service;

import com.vaarahidesigns.vaarahidesigns.entity.Payment;
import java.util.List;
import java.util.Optional;

public interface PaymentService {
    Payment savePayment(Payment payment);
    Optional<Payment> getPaymentById(Integer id);
    List<Payment> getPaymentsByMethod(String paymentMethod);
    List<Payment> getAllPayments();
    Payment updatePayment(Integer id, Payment payment);
    void deletePayment(Integer id);
}
