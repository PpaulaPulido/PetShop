package io.bootify.pet_shop.repositories;

import io.bootify.pet_shop.models.Address;
import io.bootify.pet_shop.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUser(User user);
    List<Address> findByUserAndIsActiveTrue(User user);
    Optional<Address> findByUserAndIsPrimaryTrue(User user);
    List<Address> findByCity(String city);
    List<Address> findByDepartment(String department);
    
    List<Address> findByUserId(Long userId);
    List<Address> findByUserIdAndIsActiveTrue(Long userId);
    Optional<Address> findByIdAndUserId(Long id, Long userId);
    
    @Query("SELECT a FROM Address a WHERE a.user.id = :userId AND a.isActive = true")
    List<Address> findActiveAddressesByUserId(@Param("userId") Long userId);
    
    @Query("SELECT a FROM Address a WHERE a.user.id = :userId AND a.isPrimary = true")
    Optional<Address> findPrimaryByUserId(@Param("userId") Long userId);
    
    @Modifying
    @Query("UPDATE Address a SET a.isPrimary = false WHERE a.user.id = :userId")
    void unsetAllPrimaryAddresses(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(a) FROM Address a WHERE a.user.id = :userId AND a.isActive = true")
    Long countActiveAddressesByUser(@Param("userId") Long userId);
}