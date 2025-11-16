package io.bootify.pet_shop.services;

import io.bootify.pet_shop.dto.CartItemDTO;
import io.bootify.pet_shop.dto.CartResponseDTO;
import io.bootify.pet_shop.models.Cart;
import io.bootify.pet_shop.models.CartItem;
import io.bootify.pet_shop.models.Product;
import io.bootify.pet_shop.models.User;
import io.bootify.pet_shop.repositories.CartRepository;
import io.bootify.pet_shop.repositories.CartItemRepository;
import io.bootify.pet_shop.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final SecurityService securityService;

    @Transactional
    public CartResponseDTO getCart() {
        User customer = getCurrentCustomer();
        Cart cart = getOrCreateCart(customer);
        return convertToDTO(cart);
    }

    @Transactional
    public CartResponseDTO addToCart(Long productId, Integer quantity) {
        User customer = getCurrentCustomer();
        Cart cart = getOrCreateCart(customer);
        Product product = getAvailableProduct(productId);

        validateQuantity(quantity, product.getStock());

        CartItem existingItem = cartItemRepository.findByCartAndProduct(cart, product).orElse(null);
        
        if (existingItem != null) {
            // Actualizar cantidad existente
            int newQuantity = existingItem.getQuantity() + quantity;
            validateQuantity(newQuantity, product.getStock());
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            // Crear nuevo item
            CartItem newItem = new CartItem(cart, product, quantity);
            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }

        cartRepository.save(cart);
        log.info("🛒 Customer {} agregó {} unidades de {} al carrito", 
                customer.getEmail(), quantity, product.getName());

        return convertToDTO(cart);
    }

    @Transactional
    public CartResponseDTO updateCartItem(Long productId, Integer quantity) {
        User customer = getCurrentCustomer();
        Cart cart = getCartForCustomer(customer);
        Product product = getAvailableProduct(productId);

        if (quantity <= 0) {
            return removeFromCart(productId);
        }

        validateQuantity(quantity, product.getStock());

        CartItem item = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado en el carrito"));

        item.setQuantity(quantity);
        cartItemRepository.save(item);
        cartRepository.save(cart);

        log.info("✏️ Customer {} actualizó {} a {} unidades", 
                customer.getEmail(), product.getName(), quantity);

        return convertToDTO(cart);
    }

    @Transactional
    public CartResponseDTO removeFromCart(Long productId) {
        User customer = getCurrentCustomer();
        Cart cart = getCartForCustomer(customer);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        CartItem item = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado en el carrito"));

        cartItemRepository.delete(item);
        cartRepository.save(cart);

        log.info("🗑️ Customer {} removió {} del carrito", customer.getEmail(), product.getName());

        return convertToDTO(cart);
    }

    @Transactional
    public void clearCart() {
        User customer = getCurrentCustomer();
        Cart cart = getCartForCustomer(customer);
        
        cartItemRepository.deleteByCartId(cart.getId());
        cartRepository.save(cart);
        
        log.info("🧹 Customer {} vació su carrito", customer.getEmail());
    }

    @Transactional
    public Integer getCartItemCount() {
        User customer = getCurrentCustomer();
        Cart cart = cartRepository.findByUserId(customer.getId()).orElse(null);
        
        if (cart == null) {
            return 0;
        }
        
        return cartItemRepository.countItemsByCartId(cart.getId());
    }

    // Métodos privados de ayuda
    private User getCurrentCustomer() {
        User user = securityService.getCurrentUser();
        if (user.getRole() != io.bootify.pet_shop.models.Role.CUSTOMER) {
            throw new RuntimeException("Acceso denegado: Solo los clientes pueden acceder a esta funcionalidad");
        }
        return user;
    }

    private Cart getOrCreateCart(User customer) {
        return cartRepository.findByUser(customer)
                .orElseGet(() -> {
                    Cart newCart = new Cart(customer);
                    return cartRepository.save(newCart);
                });
    }

    private Cart getCartForCustomer(User customer) {
        return cartRepository.findByUser(customer)
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));
    }

    private Product getAvailableProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        if (!product.getActive()) {
            throw new RuntimeException("El producto no está disponible");
        }
        
        if (product.getStock() <= 0) {
            throw new RuntimeException("El producto está agotado");
        }
        
        return product;
    }

    private void validateQuantity(Integer quantity, Integer availableStock) {
        if (quantity <= 0) {
            throw new RuntimeException("La cantidad debe ser mayor a 0");
        }
        
        if (quantity > availableStock) {
            throw new RuntimeException("Cantidad solicitada (" + quantity + ") excede el stock disponible (" + availableStock + ")");
        }
    }

    private CartResponseDTO convertToDTO(Cart cart) {
        CartResponseDTO dto = new CartResponseDTO();
        dto.setId(cart.getId());
        dto.setUserId(cart.getUser().getId());
        
        List<CartItemDTO> itemDTOs = cartItemRepository.findByCartIdWithProduct(cart.getId())
                .stream()
                .map(this::convertItemToDTO)
                .collect(Collectors.toList());
        dto.setItems(itemDTOs);
        
        dto.setTotalItems(calculateTotalItems(itemDTOs));
        dto.setTotalAmount(calculateTotalAmount(itemDTOs));
        dto.setUpdatedAt(cart.getUpdatedAt());
        
        return dto;
    }

    private CartItemDTO convertItemToDTO(CartItem item) {
        CartItemDTO dto = new CartItemDTO();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());
        dto.setProductImage(item.getProduct().getDisplayImage());
        dto.setProductPrice(item.getProduct().getPrice());
        dto.setQuantity(item.getQuantity());
        dto.setSubtotal(item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        return dto;
    }

    private Integer calculateTotalItems(List<CartItemDTO> items) {
        return items.stream()
                .mapToInt(CartItemDTO::getQuantity)
                .sum();
    }

    private BigDecimal calculateTotalAmount(List<CartItemDTO> items) {
        return items.stream()
                .map(CartItemDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}