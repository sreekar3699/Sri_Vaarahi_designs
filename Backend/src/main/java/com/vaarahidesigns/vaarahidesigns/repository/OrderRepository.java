package com.vaarahidesigns.vaarahidesigns.repository;

import com.vaarahidesigns.vaarahidesigns.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUserId(Integer userId);
    Optional<Order> findByTrackingId(String trackingId);
    Optional<Order> findById(Integer id);
}
