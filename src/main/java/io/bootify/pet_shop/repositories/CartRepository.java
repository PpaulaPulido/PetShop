package io.bootify.pet_shop.repositories;

import io.bootify.pet_shop.models.Cart;
import io.bootify.pet_shop.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);

    Optional<Cart> findByUserId(Long userId);
}