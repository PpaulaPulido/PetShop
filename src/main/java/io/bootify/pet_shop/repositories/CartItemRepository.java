package io.bootify.pet_shop.repositories;

import io.bootify.pet_shop.models.Cart;
import io.bootify.pet_shop.models.CartItem;
import io.bootify.pet_shop.models.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
    List<CartItem> findByCart(Cart cart);
    
    @Query("SELECT ci FROM CartItem ci LEFT JOIN FETCH ci.product WHERE ci.cart.id = :cartId")
    List<CartItem> findByCartIdWithProduct(@Param("cartId") Long cartId);
    
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.product.id = :productId")
    void deleteByCartIdAndProductId(@Param("cartId") Long cartId, @Param("productId") Long productId);
    
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId")
    void deleteByCartId(@Param("cartId") Long cartId);
    
    @Query("SELECT COUNT(ci) FROM CartItem ci WHERE ci.cart.id = :cartId")
    Integer countItemsByCartId(@Param("cartId") Long cartId);
    
    @Query("SELECT SUM(ci.quantity) FROM CartItem ci WHERE ci.cart.id = :cartId")
    Integer sumQuantityByCartId(@Param("cartId") Long cartId);
}