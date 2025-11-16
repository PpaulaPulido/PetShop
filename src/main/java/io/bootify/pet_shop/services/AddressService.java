package io.bootify.pet_shop.services;

import io.bootify.pet_shop.dto.AddressResponseDTO;
import io.bootify.pet_shop.models.Address;
import io.bootify.pet_shop.models.User;
import io.bootify.pet_shop.repositories.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final SecurityService securityService;

    public List<AddressResponseDTO> getCustomerAddresses() {
        User customer = getCurrentCustomer();
        return addressRepository.findByUserIdAndIsActiveTrue(customer.getId())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public AddressResponseDTO getAddressById(Long addressId) {
        User customer = getCurrentCustomer();
        Address address = addressRepository.findByIdAndUserId(addressId, customer.getId())
                .orElseThrow(() -> new RuntimeException("Dirección no encontrada"));
        return convertToDTO(address);
    }

    @Transactional
    public AddressResponseDTO createAddress(Address address) {
        User customer = getCurrentCustomer();
        address.setUser(customer);
        address.setIsActive(true);
        
        // Si es la primera dirección, marcarla como primaria
        if (addressRepository.countActiveAddressesByUser(customer.getId()) == 0) {
            address.setIsPrimary(true);
        }
        
        Address savedAddress = addressRepository.save(address);
        return convertToDTO(savedAddress);
    }

    @Transactional
    public AddressResponseDTO updateAddress(Long addressId, Address addressDetails) {
        User customer = getCurrentCustomer();
        Address address = addressRepository.findByIdAndUserId(addressId, customer.getId())
                .orElseThrow(() -> new RuntimeException("Dirección no encontrada"));

        address.setAddressLine1(addressDetails.getAddressLine1());
        address.setAddressLine2(addressDetails.getAddressLine2());
        address.setLandmark(addressDetails.getLandmark());
        address.setCity(addressDetails.getCity());
        address.setDepartment(addressDetails.getDepartment());
        address.setZipCode(addressDetails.getZipCode());
        address.setAddressType(addressDetails.getAddressType());
        address.setContactName(addressDetails.getContactName());
        address.setContactPhone(addressDetails.getContactPhone());
        address.setDeliveryInstructions(addressDetails.getDeliveryInstructions());

        Address updatedAddress = addressRepository.save(address);
        return convertToDTO(updatedAddress);
    }

    @Transactional
    public void deleteAddress(Long addressId) {
        User customer = getCurrentCustomer();
        Address address = addressRepository.findByIdAndUserId(addressId, customer.getId())
                .orElseThrow(() -> new RuntimeException("Dirección no encontrada"));

        address.setIsActive(false);
        addressRepository.save(address);
    }

    @Transactional
    public AddressResponseDTO setPrimaryAddress(Long addressId) {
        User customer = getCurrentCustomer();
        Address address = addressRepository.findByIdAndUserId(addressId, customer.getId())
                .orElseThrow(() -> new RuntimeException("Dirección no encontrada"));

        // Desmarcar todas como primarias
        addressRepository.unsetAllPrimaryAddresses(customer.getId());
        
        // Marcar esta como primaria
        address.setIsPrimary(true);
        Address updatedAddress = addressRepository.save(address);
        
        return convertToDTO(updatedAddress);
    }

    private User getCurrentCustomer() {
        User user = securityService.getCurrentUser();
        if (user.getRole() != io.bootify.pet_shop.models.Role.CUSTOMER) {
            throw new RuntimeException("Acceso denegado: Solo los clientes pueden acceder a esta funcionalidad");
        }
        return user;
    }

    private AddressResponseDTO convertToDTO(Address address) {
        AddressResponseDTO dto = new AddressResponseDTO();
        dto.setId(address.getId());
        dto.setAddressLine1(address.getAddressLine1());
        dto.setAddressLine2(address.getAddressLine2());
        dto.setLandmark(address.getLandmark());
        dto.setCity(address.getCity());
        dto.setDepartment(address.getDepartment());
        dto.setCountry(address.getCountry());
        dto.setZipCode(address.getZipCode());
        dto.setAddressType(address.getAddressType().name());
        dto.setIsPrimary(address.getIsPrimary());
        dto.setContactName(address.getContactName());
        dto.setContactPhone(address.getContactPhone());
        dto.setDeliveryInstructions(address.getDeliveryInstructions());
        dto.setFullAddress(address.getFullAddress());
        return dto;
    }
}