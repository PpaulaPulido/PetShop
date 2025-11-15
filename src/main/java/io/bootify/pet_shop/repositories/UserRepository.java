package io.bootify.pet_shop.repositories;

import io.bootify.pet_shop.models.Role;
import io.bootify.pet_shop.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    Optional<User> findByVerificationToken(String verificationToken);
    Optional<User> findByResetToken(String resetToken);
    
    List<User> findByRole(Role role);
    List<User> findByIsActive(Boolean isActive);
    
    @Query("SELECT u FROM User u WHERE u.role IN :roles")
    List<User> findByRoles(@Param("roles") List<Role> roles);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.isActive = true")
    Long countActiveUsersByRole(@Param("role") Role role);
    
    List<User> findByAccountLockedTrue();

    Optional<User> findByPhone(String phone);
    Boolean existsByPhone(String phone);

    @Query("SELECT u FROM User u WHERE u.role != 'SYSTEM_ADMIN'")
    List<User> findAllExceptSystemAdmin();

    @Query("SELECT u FROM User u WHERE u.role != 'SYSTEM_ADMIN' AND u.isActive = :isActive")
    List<User> findByIsActiveExceptSystemAdmin(@Param("isActive") Boolean isActive);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    long countByRole(@Param("role") Role role);

}