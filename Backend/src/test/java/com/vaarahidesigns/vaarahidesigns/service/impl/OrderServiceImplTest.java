package com.vaarahidesigns.vaarahidesigns.service.impl;

import com.vaarahidesigns.vaarahidesigns.entity.*;
import com.vaarahidesigns.vaarahidesigns.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    private Order order;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setId(1);

        Product product = new Product();
        product.setId(1);

        Address address = new Address();
        address.setId(1);

        order = new Order();
        order.setId(1);
        order.setUser(user);
        order.setProduct(product);
        order.setAddress(address);
        order.setPaymentMethod("UPI");
        order.setTrackingId("TRK123456");
    }

    @Test
    void saveOrder_shouldReturnSaved() {
        when(orderRepository.save(order)).thenReturn(order);
        assertThat(orderService.saveOrder(order)).isEqualTo(order);
    }

    @Test
    void getOrderById_shouldReturnOrder_whenFound() {
        when(orderRepository.findById(1)).thenReturn(Optional.of(order));
        assertThat(orderService.getOrderById(1)).isPresent().contains(order);
    }

    @Test
    void getOrderById_shouldReturnEmpty_whenNotFound() {
        when(orderRepository.findById(99)).thenReturn(Optional.empty());
        assertThat(orderService.getOrderById(99)).isEmpty();
    }

    @Test
    void getOrderByTrackingId_shouldReturnOrder() {
        when(orderRepository.findByTrackingId("TRK123456")).thenReturn(Optional.of(order));
        assertThat(orderService.getOrderByTrackingId("TRK123456")).isPresent().contains(order);
    }

    @Test
    void getOrdersByUserId_shouldReturnList() {
        when(orderRepository.findByUserId(1)).thenReturn(List.of(order));
        assertThat(orderService.getOrdersByUserId(1)).hasSize(1);
    }

    @Test
    void getAllOrders_shouldReturnList() {
        when(orderRepository.findAll()).thenReturn(List.of(order));
        assertThat(orderService.getAllOrders()).hasSize(1);
    }

    @Test
    void updateOrder_shouldUpdateAndReturn() {
        Order updated = new Order();
        updated.setPaymentMethod("COD");
        updated.setTrackingId("TRK999");
        updated.setAddress(order.getAddress());
        updated.setProduct(order.getProduct());

        when(orderRepository.findById(1)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArguments()[0]);

        Order result = orderService.updateOrder(1, updated);
        assertThat(result.getPaymentMethod()).isEqualTo("COD");
        assertThat(result.getTrackingId()).isEqualTo("TRK999");
    }

    @Test
    void updateOrder_shouldThrow_whenNotFound() {
        when(orderRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> orderService.updateOrder(99, order))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Order not found");
    }

    @Test
    void deleteOrder_shouldCallDeleteById() {
        doNothing().when(orderRepository).deleteById(1);
        orderService.deleteOrder(1);
        verify(orderRepository).deleteById(1);
    }
}
