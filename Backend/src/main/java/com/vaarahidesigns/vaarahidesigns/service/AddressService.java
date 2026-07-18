package com.vaarahidesigns.vaarahidesigns.service;

import com.vaarahidesigns.vaarahidesigns.entity.Address;
import java.util.List;
import java.util.Optional;

public interface AddressService {
    Address saveAddress(Address address);
    Optional<Address> getAddressById(Integer id);
    List<Address> getAddressesByUserId(Integer userId);
    List<Address> getAllAddresses();
    Address updateAddress(Integer id, Address address);
    void deleteAddress(Integer id);
}
