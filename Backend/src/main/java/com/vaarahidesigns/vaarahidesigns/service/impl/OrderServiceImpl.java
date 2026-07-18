package com.vaarahidesigns.vaarahidesigns.service.impl;

import com.vaarahidesigns.vaarahidesigns.entity.Order;
import com.vaarahidesigns.vaarahidesigns.repository.OrderRepository;
import com.vaarahidesigns.vaarahidesigns.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;

    @Override
    public Order saveOrder(Order order) {
        return orderRepository.save(order);
    }

    @Override
    public Optional<Order> getOrderById(Integer id) {
        return orderRepository.findById(id);
    }

    @Override
    public Optional<Order> getOrderByTrackingId(String trackingId) {
        return orderRepository.findByTrackingId(trackingId);
    }

    @Override
    public List<Order> getOrdersByUserId(Integer userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public Order updateOrder(Integer id, Order updated) {
        return orderRepository.findById(id).map(existing -> {
            existing.setPaymentMethod(updated.getPaymentMethod());
            existing.setTrackingId(updated.getTrackingId());
            existing.setAddress(updated.getAddress());
            existing.setProduct(updated.getProduct());
            return orderRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    @Override
    public void deleteOrder(Integer id) {
        orderRepository.deleteById(id);
    }
}
