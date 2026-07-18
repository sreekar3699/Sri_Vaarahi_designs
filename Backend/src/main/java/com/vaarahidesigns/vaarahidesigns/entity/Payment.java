package com.vaarahidesigns.vaarahidesigns.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Double amount;

    @Column(name = "payment_method")
    private String paymentMethod; // "RAZORPAY" or "COD"

    /** PENDING / SUCCESS / FAILED */
    @Column(name = "status")
    private String status;

    /** Razorpay Order ID returned on create-order */
    @Column(name = "razorpay_order_id")
    private String razorpayOrderId;

    /** Razorpay Payment ID returned after successful payment */
    @Column(name = "razorpay_payment_id")
    private String razorpayPaymentId;

    /** Razorpay signature for verification */
    @Column(name = "razorpay_signature")
    private String razorpaySignature;

    @JsonIgnore
    @OneToOne(mappedBy = "payment")
    private Order order;
}
