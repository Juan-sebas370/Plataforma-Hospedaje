package com.hotelsebasitian.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String email, String resetToken) {
        String resetLink = "http://localhost:4200/reset-password?token=" + resetToken;
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Recuperación de Contraseña - Hospedaje Sebastian");
        message.setText(
            "Hola,\n\n" +
            "Hemos recibido una solicitud para recuperar tu contraseña.\n" +
            "Si no fuiste tú, ignora este correo.\n\n" +
            "Para resetear tu contraseña, haz clic en el siguiente enlace:\n" +
            resetLink + "\n\n" +
            "Este enlace es válido por 24 horas.\n\n" +
            "Saludos,\n" +
            "Equipo de Hospedaje Sebastian"
        );
        message.setFrom("noreply@hospedajesebastian.com");
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar correo: " + e.getMessage());
        }
    }

    public void sendPasswordResetSuccessEmail(String email) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Contraseña Actualizada - Hospedaje Sebastian");
        message.setText(
            "Hola,\n\n" +
            "Tu contraseña ha sido actualizada exitosamente.\n" +
            "Si no realizaste este cambio, contacta a nuestro equipo de soporte inmediatamente.\n\n" +
            "Saludos,\n" +
            "Equipo de Hospedaje Sebastian"
        );
        message.setFrom("noreply@hospedajesebastian.com");
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Error al enviar correo: " + e.getMessage());
        }
    }
}
