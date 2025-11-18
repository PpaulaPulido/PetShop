package io.bootify.pet_shop.controller;

import io.bootify.pet_shop.models.User;
import io.bootify.pet_shop.services.CartService;
import io.bootify.pet_shop.services.OrderService;
import io.bootify.pet_shop.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/user")
@PreAuthorize("hasAnyRole('CUSTOMER', 'MANAGER', 'SUPER_ADMIN', 'SYSTEM_ADMIN')")
@RequiredArgsConstructor
public class UserController {

    private final CartService cartService;
    private final UserService userService;
    private final OrderService orderService;

    @GetMapping("/dashboard")
    public String userDashboard(Model model,
            @AuthenticationPrincipal UserDetails userDetails) {
        model.addAttribute("pageTitle", "Mi Cuenta - PetLuz");
        model.addAttribute("userRole", "CUSTOMER");
        model.addAttribute("cartItemCount", cartService.getCartItemCount());
        model.addAttribute("cart", cartService.getCart());

        // Obtener datos reales del usuario para el dashboard
        if (userDetails != null) {
            User user = userService.findByEmail(userDetails.getUsername());
            model.addAttribute("user", user);
        }

        return "customer/dashboard";
    }

    @GetMapping("/profile")
    public String userProfile(Model model,
            @AuthenticationPrincipal UserDetails userDetails) {
        model.addAttribute("pageTitle", "Mi Perfil - PetLuz");
        model.addAttribute("cartItemCount", cartService.getCartItemCount());

        if (userDetails == null) {
            return "redirect:/login";
        }

        // Obtener datos reales del usuario
        User user = userService.findByEmail(userDetails.getUsername());
        model.addAttribute("user", user);

        // Calcular porcentaje de completitud del perfil
        int completion = calculateProfileCompletion(user);
        model.addAttribute("profileCompletion", completion);

        // Obtener estadísticas de pedidos
        model.addAttribute("orderStats", orderService.getOrderStats(user.getId()));

        return "customer/profile";
    }

    private int calculateProfileCompletion(User user) {
        int totalFields = 8; // Campos importantes
        int completedFields = 0;

        if (user.getFirstName() != null && !user.getFirstName().isEmpty())
            completedFields++;
        if (user.getLastName() != null && !user.getLastName().isEmpty())
            completedFields++;
        if (user.getEmail() != null && !user.getEmail().isEmpty())
            completedFields++;
        if (user.getPhone() != null && !user.getPhone().isEmpty())
            completedFields++;
        if (user.getDateOfBirth() != null)
            completedFields++;
        if (user.getGender() != null)
            completedFields++;
        if (user.getEmailVerified() != null && user.getEmailVerified())
            completedFields++;
        if (user.getPhoneVerified() != null && user.getPhoneVerified())
            completedFields++;

        return (int) Math.round((completedFields * 100.0) / totalFields);
    }

    @GetMapping("/orders")
    public String userOrders(Model model,
            @AuthenticationPrincipal UserDetails userDetails) {
        model.addAttribute("pageTitle", "Mis Pedidos - PetLuz");
        model.addAttribute("cartItemCount", cartService.getCartItemCount());

        if (userDetails != null) {
            User user = userService.findByEmail(userDetails.getUsername());
            model.addAttribute("user", user);
            // Aquí puedes agregar la lógica para obtener los pedidos del usuario
        }

        return "customer/orders";
    }

    @GetMapping("/cart")
    public String userCart(Model model,
            @AuthenticationPrincipal UserDetails userDetails) {
        model.addAttribute("pageTitle", "Mi Carrito - PetLuz");
        model.addAttribute("cartItemCount", cartService.getCartItemCount());
        model.addAttribute("cart", cartService.getCart());

        if (userDetails != null) {
            User user = userService.findByEmail(userDetails.getUsername());
            model.addAttribute("user", user);
        }

        return "customer/cart";
    }

    @GetMapping("/checkout")
    public String checkout(Model model,
            @AuthenticationPrincipal UserDetails userDetails) {
        model.addAttribute("pageTitle", "Finalizar Compra - PetLuz");
        model.addAttribute("cartItemCount", cartService.getCartItemCount());
        model.addAttribute("cart", cartService.getCart());

        if (userDetails != null) {
            User user = userService.findByEmail(userDetails.getUsername());
            model.addAttribute("user", user);
        }

        return "customer/checkout";
    }

    @GetMapping("/order-confirmation")
    public String orderConfirmation(Model model,
            @AuthenticationPrincipal UserDetails userDetails) {
        model.addAttribute("pageTitle", "Confirmación de Pedido - PetLuz");
        model.addAttribute("cartItemCount", cartService.getCartItemCount());

        if (userDetails != null) {
            User user = userService.findByEmail(userDetails.getUsername());
            model.addAttribute("user", user);
        }

        return "customer/order-confirmation";
    }

    @GetMapping("/order-details/{id}")
    public String orderDetails(@PathVariable Long id,
            Model model,
            @AuthenticationPrincipal UserDetails userDetails) {
        model.addAttribute("pageTitle", "Detalles del Pedido - PetLuz");
        model.addAttribute("orderId", id);
        model.addAttribute("cartItemCount", cartService.getCartItemCount());

        if (userDetails != null) {
            User user = userService.findByEmail(userDetails.getUsername());
            model.addAttribute("user", user);
        }

        return "customer/order-details";
    }
}