package com.vaarahidesigns.vaarahidesigns.service.impl;

import com.vaarahidesigns.vaarahidesigns.entity.Address;
import com.vaarahidesigns.vaarahidesigns.entity.User;
import com.vaarahidesigns.vaarahidesigns.repository.AddressRepository;
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
class AddressServiceImplTest {

    @Mock
    private AddressRepository addressRepository;

    @InjectMocks
    private AddressServiceImpl addressService;

    private Address address;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setId(1);

        address = new Address();
        address.setId(1);
        address.setUser(user);
        address.setAddressLine("123 Main St");
        address.setCity("Chennai");
        address.setState("Tamil Nadu");
        address.setCountry("India");
        address.setPincode("600001");
    }

    @Test
    void saveAddress_shouldReturnSaved() {
        when(addressRepository.save(address)).thenReturn(address);
        assertThat(addressService.saveAddress(address)).isEqualTo(address);
        verify(addressRepository).save(address);
    }

    @Test
    void getAddressById_shouldReturnAddress_whenFound() {
        when(addressRepository.findById(1)).thenReturn(Optional.of(address));
        assertThat(addressService.getAddressById(1)).isPresent().contains(address);
    }

    @Test
    void getAddressById_shouldReturnEmpty_whenNotFound() {
        when(addressRepository.findById(99)).thenReturn(Optional.empty());
        assertThat(addressService.getAddressById(99)).isEmpty();
    }

    @Test
    void getAddressesByUserId_shouldReturnList() {
        when(addressRepository.findByUserId(1)).thenReturn(List.of(address));
        assertThat(addressService.getAddressesByUserId(1)).hasSize(1);
    }

    @Test
    void getAllAddresses_shouldReturnList() {
        when(addressRepository.findAll()).thenReturn(List.of(address));
        assertThat(addressService.getAllAddresses()).hasSize(1);
    }

    @Test
    void updateAddress_shouldUpdateAndReturn() {
        Address updated = new Address();
        updated.setAddressLine("456 New St");
        updated.setCity("Bangalore");
        updated.setState("Karnataka");
        updated.setCountry("India");
        updated.setPincode("560001");

        when(addressRepository.findById(1)).thenReturn(Optional.of(address));
        when(addressRepository.save(any(Address.class))).thenAnswer(i -> i.getArguments()[0]);

        Address result = addressService.updateAddress(1, updated);
        assertThat(result.getCity()).isEqualTo("Bangalore");
    }

    @Test
    void updateAddress_shouldThrow_whenNotFound() {
        when(addressRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> addressService.updateAddress(99, address))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Address not found");
    }

    @Test
    void deleteAddress_shouldCallDeleteById() {
        doNothing().when(addressRepository).deleteById(1);
        addressService.deleteAddress(1);
        verify(addressRepository).deleteById(1);
    }
}
