package io.bootify.pet_shop.config;

import io.bootify.pet_shop.models.Role;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collection;

@Component
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                      Authentication authentication) throws IOException, ServletException {
        
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        
        String redirectUrl = determineTargetUrl(authorities);
        response.sendRedirect(redirectUrl);
    }

    private String determineTargetUrl(Collection<? extends GrantedAuthority> authorities) {
        // Verificar roles en orden de prioridad
        if (hasRole(authorities, Role.SYSTEM_ADMIN)) {
            return "/system-admin/dashboard"; 
        } else if (hasRole(authorities, Role.SUPER_ADMIN)) {
            return "/super-admin/dashboard"; 
        } else if (hasRole(authorities, Role.MANAGER)) {
            return "/manager/dashboard"; 
        } else if (hasRole(authorities, Role.CUSTOMER)) {
            return "/user/dashboard";
        }
        
        // Por defecto, redirigir al dashboard del usuario
        return "/user/dashboard";
    }

    private boolean hasRole(Collection<? extends GrantedAuthority> authorities, Role role) {
        return authorities.stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role.name()));
    }
}