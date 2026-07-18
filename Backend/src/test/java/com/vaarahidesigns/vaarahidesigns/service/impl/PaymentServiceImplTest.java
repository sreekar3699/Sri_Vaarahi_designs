package com.vaarahidesigns.vaarahidesigns.service.impl;

import com.vaarahidesigns.vaarahidesigns.entity.Payment;
import com.vaarahidesigns.vaarahidesigns.repository.PaymentRepository;
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
class PaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private Payment payment;

    @BeforeEach
    void setUp() {
        payment = new Payment();
        payment.setId(1);
        payment.setAmount(5000.0);
        payment.setPaymentMethod("UPI");
    }

    @Test
    void savePayment_shouldReturnSaved() {
        when(paymentRepository.save(payment)).thenReturn(payment);
        assertThat(paymentService.savePayment(payment)).isEqualTo(payment);
    }

    @Test
    void getPaymentById_shouldReturnPayment_whenFound() {
        when(paymentRepository.findById(1)).thenReturn(Optional.of(payment));
        assertThat(paymentService.getPaymentById(1)).isPresent().contains(payment);
    }

    @Test
    void getPaymentById_shouldReturnEmpty_whenNotFound() {
        when(paymentRepository.findById(99)).thenReturn(Optional.empty());
        assertThat(paymentService.getPaymentById(99)).isEmpty();
    }

    @Test
    void getPaymentsByMethod_shouldReturnList() {
        when(paymentRepository.findByPaymentMethod("UPI")).thenReturn(List.of(payment));
        assertThat(paymentService.getPaymentsByMethod("UPI")).hasSize(1);
    }

    @Test
    void getAllPayments_shouldReturnList() {
        when(paymentRepository.findAll()).thenReturn(List.of(payment));
        assertThat(paymentService.getAllPayments()).hasSize(1);
    }

    @Test
    void updatePayment_shouldUpdateAndReturn() {
        Payment updated = new Payment();
        updated.setAmount(7500.0);
        updated.setPaymentMethod("Net Banking");

        when(paymentRepository.findById(1)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> i.getArguments()[0]);

        Payment result = paymentService.updatePayment(1, updated);
        assertThat(result.getAmount()).isEqualTo(7500.0);
        assertThat(result.getPaymentMethod()).isEqualTo("Net Banking");
    }

    @Test
    void updatePayment_shouldThrow_whenNotFound() {
        when(paymentRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> paymentService.updatePayment(99, payment))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Payment not found");
    }

    @Test
    void deletePayment_shouldCallDeleteById() {
        doNothing().when(paymentRepository).deleteById(1);
        paymentService.deletePayment(1);
        verify(paymentRepository).deleteById(1);
    }
}
