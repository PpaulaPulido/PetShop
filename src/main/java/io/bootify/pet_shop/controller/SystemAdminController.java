package io.bootify.pet_shop.controller;

import io.bootify.pet_shop.dto.CreateUserRequestDTO;
import io.bootify.pet_shop.dto.UpdateUserRequestDTO;
import io.bootify.pet_shop.dto.UserResponseDTO;
import io.bootify.pet_shop.models.Role;
import io.bootify.pet_shop.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/system-admin")
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
@RequiredArgsConstructor
public class SystemAdminController {

    private final UserService userService;

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("pageTitle", "Panel de Sistema - PetShop");
        return "system-admin/dashboard";
    }

    @GetMapping("/users")
    public String manageUsers(Model model) {
        model.addAttribute("pageTitle", "Gestión de Usuarios - PetShop");
        return "system-admin/users";
    }

    // NUEVO: Página para crear usuario
    @GetMapping("/users/create")
    public String createUserForm(Model model) {
        model.addAttribute("pageTitle", "Crear Usuario - PetShop");
        model.addAttribute("user", new CreateUserRequestDTO());
        return "system-admin/user-create";
    }

    // NUEVO: Página para editar usuario
    @GetMapping("/users/edit/{id}")
    public String editUserForm(@PathVariable Long id, Model model) {
        try {
            UserResponseDTO user = userService.getUserById(id);
            model.addAttribute("pageTitle", "Editar Usuario - PetShop");
            model.addAttribute("user", user);
            return "system-admin/user-edit";
        } catch (RuntimeException e) {
            return "redirect:/system-admin/users?error=user_not_found";
        }
    }

    // API endpoints para usuarios
    @GetMapping("/api/users")
    @ResponseBody
    public List<UserResponseDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/api/users/{id}")
    @ResponseBody
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        try {
            UserResponseDTO user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/api/users")
    @ResponseBody
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequestDTO request) {
        try {
            UserResponseDTO user = userService.createUser(request);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/api/users/{id}")
    @ResponseBody
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequestDTO request) {
        try {
            UserResponseDTO user = userService.updateUser(id, request);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/api/users/{id}/toggle-status")
    @ResponseBody
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        try {
            UserResponseDTO user = userService.toggleUserStatus(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/api/users/{id}/role")
    @ResponseBody
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestParam Role newRole) {
        try {
            UserResponseDTO user = userService.updateUserRole(id, newRole);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/api/users/role/{role}")
    @ResponseBody
    public ResponseEntity<?> getUsersByRole(@PathVariable Role role) {
        try {
            List<UserResponseDTO> users = userService.getUsersByRole(role);
            return ResponseEntity.ok(users);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}