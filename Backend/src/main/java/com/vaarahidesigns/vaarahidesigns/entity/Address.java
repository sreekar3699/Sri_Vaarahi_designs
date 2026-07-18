package com.vaarahidesigns.vaarahidesigns.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import java.util.ArrayList;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "addresses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "address_line")
    private String addressLine;

    @Column(name = "contact_number")
    private Long contactNumber;

    private String district;

    private String state;

    private String city;

    private String country;

    private String pincode;

    private String landmark;

    @JsonIgnore
    @OneToMany(mappedBy = "address", cascade = CascadeType.ALL)
    private List<Order> orders = new ArrayList<>();
}
