package io.bootify.pet_shop.services;

import io.bootify.pet_shop.models.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendVerificationEmail(User user) {
        try {
            String subject = "Verifica tu cuenta de PetShop";
            String verificationUrl = baseUrl + "/api/auth/verify-email?token=" + user.getVerificationToken();

            // Crear contenido del email
            String htmlContent = createVerificationEmailHtml(user, verificationUrl);
            String textContent = createVerificationEmailText(user, verificationUrl);

            // Enviar email
            sendEmail(user.getEmail(), subject, htmlContent, textContent);
            System.out.println("✅ Email de verificación enviado a: " + user.getEmail());

        } catch (Exception e) {
            System.err.println("❌ Error enviando email de verificación: " + e.getMessage());
            e.printStackTrace();
            // No lanzar excepción para no bloquear el registro
        }
    }

    private String createVerificationEmailHtml(User user, String verificationUrl) {
        Context context = new Context();
        context.setVariable("user", user);
        context.setVariable("verificationUrl", verificationUrl);
        context.setVariable("appName", "PetShop");
        
        return templateEngine.process("email/verification-email", context);
    }

    private String createVerificationEmailText(User user, String verificationUrl) {
        return String.format("""
            ¡Bienvenido a PetShop!
            
            Verifica tu dirección de email
            
            Hola %s,
            
            Gracias por registrarte en PetShop. Para completar tu registro y comenzar a usar nuestra plataforma, por favor verifica tu dirección de email visitando el siguiente enlace:
            
            %s
            
            Este enlace de verificación expirará en 24 horas.
            
            Si no creaste una cuenta con PetShop, por favor ignora este email.
            
            © 2024 PetShop. Todos los derechos reservados.
            """, user.getFirstName(), verificationUrl);
    }

    private void sendEmail(String to, String subject, String htmlContent, String textContent) 
            throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(textContent, htmlContent);

        mailSender.send(message);
    }
}