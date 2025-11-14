package io.bootify.pet_shop.models;

public enum Role {
    SYSTEM_ADMIN,    // Administrador del sistema - gestiona usuarios y roles
    SUPER_ADMIN,     // Administrador general - gestiona productos, stock, etc.
    MANAGER,         // Gerente - puede ver reportes y gestionar pedidos
    CUSTOMER         // Cliente final - comprar y consultar
}