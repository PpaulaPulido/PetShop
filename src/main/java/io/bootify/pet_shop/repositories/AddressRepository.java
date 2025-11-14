package io.bootify.pet_shop.repositories;

import io.bootify.pet_shop.models.Address;
import io.bootify.pet_shop.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUser(User user);
    List<Address> findByUserAndIsActiveTrue(User user);
    Optional<Address> findByUserAndIsPrimaryTrue(User user);
    List<Address> findByCity(String city);
    List<Address> findByDepartment(String department);
    
    @Query("SELECT a FROM Address a WHERE a.user.id = :userId AND a.isActive = true")
    List<Address> findActiveAddressesByUserId(@Param("userId") Long userId);
}