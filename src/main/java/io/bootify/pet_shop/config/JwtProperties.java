package io.bootify.pet_shop.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "jwt")
@Getter
@Setter
public class JwtProperties {
    private String secret = "5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437";
    private Long expiration = 86400000L;
}