package com.vaarahidesigns.vaarahidesigns.repository;

import com.vaarahidesigns.vaarahidesigns.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByPaymentMethod(String paymentMethod);
    Optional<Payment> findById(Integer id);
    Optional<Payment> findByOrderId(Integer orderId);
}
