package io.bootify.pet_shop.services;

import io.bootify.pet_shop.models.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendVerificationEmail(User user) {
        try {
            // DEBUG DETALLADO
            System.out.println("🚀 === EMAIL DEBUG INICIADO ===");
            System.out.println("📧 Base URL: " + baseUrl);
            System.out.println("📨 From Email: " + fromEmail);
            System.out.println("👤 User Email: " + user.getEmail());
            System.out.println("🔑 Verification Token: " + user.getVerificationToken());

            String verificationUrl = baseUrl + "/auth/verify-email?token=" + user.getVerificationToken();
            System.out.println("🔗 Full URL: " + verificationUrl);

            String subject = "Verifica tu cuenta de PetShop";
            String htmlContent = createSimpleVerificationEmail(user, verificationUrl);
            String textContent = createVerificationEmailText(user, verificationUrl);

            System.out.println("📤 Attempting to send email to: " + user.getEmail());

            sendEmail(user.getEmail(), subject, htmlContent, textContent);

            System.out.println("✅ Email sent successfully to: " + user.getEmail());

        } catch (Exception e) {
            System.err.println("❌ ERROR sending email: " + e.getMessage());
            System.err.println("🔍 Error type: " + e.getClass().getName());
            e.printStackTrace();

            // Log adicional para problemas de conexión
            if (e.getMessage().contains("connect") || e.getMessage().contains("timeout")) {
                System.err.println("🌐 Problema de conexión de red detectado");
            }
        }
    }

    private String createSimpleVerificationEmail(User user, String verificationUrl) {
        // Cambia la ruta a la web (sin /api/)
        String webVerificationUrl = baseUrl + "/auth/verify-email?token=" + user.getVerificationToken();

        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #667eea; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; background: #f9f9f9; }
                        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
                        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>¡Bienvenido a PetLuz!</h1>
                        </div>
                        <div class="content">
                            <h2>Verifica tu dirección de email</h2>
                            <p>Hola <strong>%s</strong>,</p>
                            <p>Gracias por registrarte en PetShop. Para activar tu cuenta, haz clic en el botón de abajo:</p>
                            <div style="text-align: center;">
                                <a href="%s" class="button">Verificar Email</a>
                            </div>
                            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                            <p><code>%s</code></p>
                            <p>Este enlace expirará en 24 horas.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2024 PetShop. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(user.getFirstName(), webVerificationUrl, webVerificationUrl);
    }

    private String createVerificationEmailText(User user, String verificationUrl) {
        return """
                ¡Bienvenido a PetLuz!

                Verifica tu dirección de email

                Hola %s,

                Gracias por registrarte en PetShop. Para activar tu cuenta, visita el siguiente enlace:

                %s

                Este enlace expirará en 24 horas.

                Si no creaste una cuenta con PetShop, por favor ignora este email.

                © 2024 PetShop. Todos los derechos reservados.
                """.formatted(user.getFirstName(), verificationUrl);
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