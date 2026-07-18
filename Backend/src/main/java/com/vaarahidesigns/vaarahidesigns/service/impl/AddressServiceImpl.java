package com.vaarahidesigns.vaarahidesigns.service.impl;

import com.vaarahidesigns.vaarahidesigns.entity.Address;
import com.vaarahidesigns.vaarahidesigns.repository.AddressRepository;
import com.vaarahidesigns.vaarahidesigns.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;

    @Override
    public Address saveAddress(Address address) {
        return addressRepository.save(address);
    }

    @Override
    public Optional<Address> getAddressById(Integer id) {
        return addressRepository.findById(id);
    }

    @Override
    public List<Address> getAddressesByUserId(Integer userId) {
        return addressRepository.findByUserId(userId);
    }

    @Override
    public List<Address> getAllAddresses() {
        return addressRepository.findAll();
    }

    @Override
    public Address updateAddress(Integer id, Address updated) {
        return addressRepository.findById(id).map(existing -> {
            existing.setAddressLine(updated.getAddressLine());
            existing.setContactNumber(updated.getContactNumber());
            existing.setDistrict(updated.getDistrict());
            existing.setState(updated.getState());
            existing.setCity(updated.getCity());
            existing.setCountry(updated.getCountry());
            existing.setPincode(updated.getPincode());
            existing.setLandmark(updated.getLandmark());
            return addressRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Address not found with id: " + id));
    }

    @Override
    public void deleteAddress(Integer id) {
        addressRepository.deleteById(id);
    }
}
