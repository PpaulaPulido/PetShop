package io.bootify.pet_shop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories("io.bootify.pet_shop.repositories")
@EntityScan("io.bootify.pet_shop.models")
public class PetShopApplication {

    public static void main(final String[] args) {
        SpringApplication.run(PetShopApplication.class, args);
    }
}