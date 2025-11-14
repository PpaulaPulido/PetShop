package io.bootify.pet_shop.repositories;

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

    @Query("SELECT u FROM User u WHERE u.role = 'SUPER_ADMIN'")
    List<User> findAllSuperAdmins();

    @Query("SELECT u FROM User u WHERE u.emailVerified = :verified")
    List<User> findByEmailVerified(@Param("verified") Boolean verified);
}