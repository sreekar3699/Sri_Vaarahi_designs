package com.vaarahidesigns.vaarahidesigns.service;

import com.vaarahidesigns.vaarahidesigns.entity.Order;
import java.util.List;
import java.util.Optional;

public interface OrderService {
    Order saveOrder(Order order);
    Optional<Order> getOrderById(Integer id);
    Optional<Order> getOrderByTrackingId(String trackingId);
    List<Order> getOrdersByUserId(Integer userId);
    List<Order> getAllOrders();
    Order updateOrder(Integer id, Order order);
    void deleteOrder(Integer id);
}
