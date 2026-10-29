package com.hotelsebasitian.config;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.MimeMessageHelper;

import java.util.Base64;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Conversión de correos al formato de Resend")
class ResendMailSenderTest {

    private final ResendMailSender sender = new ResendMailSender("re_prueba", "reservas@hospedajesebastianfilandia.com");

    @Test
    @DisplayName("correo de reserva: HTML, texto, reply-to y QR incrustado")
    @SuppressWarnings("unchecked")
    void correoConQr() throws Exception {
        MimeMessage m = sender.createMimeMessage();
        MimeMessageHelper h = new MimeMessageHelper(m, true, "UTF-8");
        h.setFrom(new InternetAddress("otra@gmail.com", "Hospedaje Sebastián", "UTF-8"));
        h.setReplyTo("hospedajesebastianfilandia@gmail.com");
        h.setTo("cliente@example.com");
        h.setSubject("Reserva confirmada");
        h.setText("texto plano", "<p>Hola <img src='cid:qr'></p>");
        h.addInline("qr", new ByteArrayResource(new byte[]{1, 2, 3}), "image/png");

        Map<String, Object> cuerpo = sender.cuerpo(m);

        // El remitente siempre es el del dominio verificado, con el nombre visible del mensaje
        assertThat((String) cuerpo.get("from")).contains("Hospedaje Sebastián").contains("<reservas@hospedajesebastianfilandia.com>");
        assertThat(cuerpo.get("to")).isEqualTo(List.of("cliente@example.com"));
        assertThat(cuerpo.get("reply_to")).isEqualTo(List.of("hospedajesebastianfilandia@gmail.com"));
        assertThat(cuerpo.get("subject")).isEqualTo("Reserva confirmada");
        assertThat(cuerpo.get("html")).isEqualTo("<p>Hola <img src='cid:qr'></p>");
        assertThat(cuerpo.get("text")).isEqualTo("texto plano");

        List<Map<String, String>> adjuntos = (List<Map<String, String>>) cuerpo.get("attachments");
        assertThat(adjuntos).hasSize(1);
        assertThat(adjuntos.get(0))
                .containsEntry("content_id", "qr")
                .containsEntry("content_type", "image/png")
                .containsEntry("filename", "qr.png")
                .containsEntry("content", Base64.getEncoder().encodeToString(new byte[]{1, 2, 3}));
    }

    @Test
    @DisplayName("correo de solo texto (recuperar contraseña) sin reply-to ni adjuntos")
    void correoSoloTexto() throws Exception {
        MimeMessage m = sender.createMimeMessage();
        MimeMessageHelper h = new MimeMessageHelper(m, false, "UTF-8");
        h.setFrom("reservas@hospedajesebastianfilandia.com");
        h.setTo("cliente@example.com");
        h.setSubject("Recuperación de Contraseña");
        h.setText("Hola, usa este enlace");

        Map<String, Object> cuerpo = sender.cuerpo(m);

        assertThat(cuerpo.get("from")).isEqualTo("reservas@hospedajesebastianfilandia.com");
        assertThat(cuerpo.get("text")).isEqualTo("Hola, usa este enlace");
        assertThat(cuerpo).doesNotContainKeys("html", "reply_to", "attachments");
    }
}
