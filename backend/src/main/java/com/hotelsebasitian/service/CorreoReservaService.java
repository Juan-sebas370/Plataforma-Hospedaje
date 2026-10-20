package com.hotelsebasitian.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.hotelsebasitian.entity.Habitacion;
import com.hotelsebasitian.entity.Reserva;
import com.hotelsebasitian.repository.HabitacionRepository;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.task.TaskExecutor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Correos al huésped sobre su reserva:
 *  - "Recibimos tu reserva" al crearla (todavía falta el pago), con el botón para pagar.
 *  - "Reserva confirmada" cuando se aprueba el pago, con el código, el QR y los datos de llegada.
 *
 * El contenido se arma en el hilo de la petición (allí se pueden leer las
 * colecciones de la reserva) y el envío se hace en segundo plano: si el
 * servidor de correo tarda o falla, la reserva y el pago no se afectan; el
 * error queda en el log.
 */
@Slf4j
@Service
public class CorreoReservaService {

    /** Datos de contacto del hospedaje (los mismos de la página web). */
    static final String CORREO_HOTEL = "hospedajesebastianfilandia@gmail.com";
    static final String TELEFONOS = "+57 314 755 6717 · +57 311 340 8867";
    static final String WHATSAPP = "https://wa.me/573147556717";
    static final String DIRECCION = "Carrera 3ra #5-65, Filandia, Quindío";

    private static final Locale ES = Locale.forLanguageTag("es-CO");
    private static final DateTimeFormatter FECHA = DateTimeFormatter.ofPattern("EEEE d 'de' MMMM 'de' yyyy", ES);
    private static final Map<String, String> TIPOS = Map.of(
            "individual", "Hospedaje", "familiar", "Familia o grupo", "pasadia", "Pasadía", "grupal", "Grupo de trabajo");
    private static final Map<String, String> HORARIOS = Map.of(
            "pasadia", "10:00 a.m. a 8:00 p.m.", "grupal", "8:00 a.m. a 6:00 p.m.");

    private final JavaMailSender mailSender;
    private final HabitacionRepository habitacionRepository;
    private final TaskExecutor executor;

    @Value("${app.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    /** Cuenta de Gmail que envía (MAIL_USERNAME). Sin ella no se envían correos. */
    @Value("${spring.mail.username:}")
    private String remitente;

    public CorreoReservaService(JavaMailSender mailSender, HabitacionRepository habitacionRepository, TaskExecutor executor) {
        this.mailSender = mailSender;
        this.habitacionRepository = habitacionRepository;
        this.executor = executor;
    }

    // ── Correos ───────────────────────────────────────────

    public void reservaRecibida(Reserva r) {
        Datos d = datos(r);
        String asunto = "Recibimos tu reserva " + d.codigo + " · Hospedaje Sebastián";
        String html = plantilla(
                "Recibimos tu reserva",
                "Hola " + d.nombreHtml + ", ya tenemos tu solicitud. <strong>Falta el pago</strong> para confirmarla.",
                "#B87A1F",
                d.resumenHtml("Total a pagar"),
                boton(d.enlacePago, "Pagar mi reserva")
                        + "<p style=\"margin:14px 0 0;font-size:13px;color:#5F5A54\">Si ya pagaste, en unos minutos te llegará el correo de confirmación.</p>",
                null);
        String texto = "Hola " + d.nombre + ",\n\nRecibimos tu reserva " + d.codigo + ". Falta el pago para confirmarla.\n\n"
                + d.resumenTexto("Total a pagar") + "\nPaga aquí: " + d.enlacePago + "\n\n" + pie();
        enviar(d.email, asunto, html, texto, null, d.codigo);
    }

    public void reservaConfirmada(Reserva r) {
        Datos d = datos(r);
        String asunto = "¡Reserva confirmada! " + d.codigo + " · Hospedaje Sebastián";
        byte[] qr = qrPng(d.enlaceReserva);
        String bloqueQr = qr == null ? "" :
                "<table role=\"presentation\" width=\"100%\" style=\"margin:0 0 18px\"><tr><td align=\"center\">"
                + "<img src=\"cid:qr\" width=\"180\" height=\"180\" alt=\"Código QR de la reserva " + d.codigo + "\" style=\"display:block;border:1px solid #E8DCCB;border-radius:12px;padding:6px;background:#fff\">"
                + "<p style=\"margin:8px 0 0;font-size:13px;color:#5F5A54\">Muéstralo al llegar o escanéalo para ver tu reserva.</p>"
                + "</td></tr></table>";
        String llegada = d.deDia
                ? "Te esperamos de " + HORARIOS.getOrDefault(r.getTipoReserva(), "10:00 a.m. a 8:00 p.m.") + "."
                : "Check-in de 3:00 p.m. a 10:00 p.m. · Salida hasta las 12:00 m.";
        String html = plantilla(
                "¡Reserva confirmada!",
                "Hola " + d.nombreHtml + ", recibimos tu pago. Te esperamos el <strong>" + d.llegada + "</strong>.",
                "#1B7340",
                bloqueQr + d.resumenHtml("Total pagado"),
                boton(d.enlaceReserva, "Ver mi reserva"),
                "<p style=\"margin:0 0 6px\"><strong>Antes de llegar</strong></p>"
                        + "<ul style=\"margin:0;padding-left:18px;color:#2B2B2B\">"
                        + "<li>" + llegada + "</li>"
                        + "<li>Lleva el documento de identidad de cada huésped adulto.</li>"
                        + "<li>Dirección: " + DIRECCION + " · <a href=\"" + mapa() + "\" style=\"color:#0E5A9C\">Cómo llegar</a></li>"
                        + "<li>¿Cambios o cancelación? Escríbenos con tu código <strong>" + d.codigo + "</strong>. Hasta 72 horas antes de la llegada el reembolso es total.</li>"
                        + "<li>Silencio de 10:00 p.m. a 7:00 a.m.; no se fuma dentro de la casa y solo ingresan las personas de la reserva. "
                        + "<a href=\"" + d.enlacePoliticas + "\" style=\"color:#0E5A9C\">Política de reservas y Reglamento interno</a></li>"
                        + "</ul>");
        String texto = "Hola " + d.nombre + ",\n\n¡Tu reserva " + d.codigo + " está confirmada! Recibimos tu pago.\n\n"
                + d.resumenTexto("Total pagado") + "\n" + llegada + "\nLleva el documento de identidad de cada huésped adulto.\n"
                + "Dirección: " + DIRECCION + "\nVer tu reserva y su código QR: " + d.enlaceReserva
                + "\nPolítica de reservas y Reglamento interno: " + d.enlacePoliticas + "\n\n" + pie();
        enviar(d.email, asunto, html, texto, qr, d.codigo);
    }

    // ── Envío ─────────────────────────────────────────────

    private void enviar(String para, String asunto, String html, String texto, byte[] qr, String codigo) {
        if (para == null || para.isBlank()) return;
        if (remitente == null || remitente.isBlank()) {
            log.warn("Correo de la reserva {} sin enviar: falta configurar MAIL_USERNAME", codigo);
            return;
        }
        executor.execute(() -> {
            try {
                MimeMessage mensaje = mailSender.createMimeMessage();
                MimeMessageHelper m = new MimeMessageHelper(mensaje, true, StandardCharsets.UTF_8.name());
                m.setFrom(new InternetAddress(remitente, "Hospedaje Sebastián", StandardCharsets.UTF_8.name()));
                m.setReplyTo(CORREO_HOTEL);
                m.setTo(para);
                m.setSubject(asunto);
                m.setText(texto, html);
                if (qr != null) m.addInline("qr", new ByteArrayResource(qr), "image/png");
                mailSender.send(mensaje);
                log.info("Correo \"{}\" enviado", asunto);
            } catch (Exception e) {
                log.error("No se pudo enviar el correo de la reserva {}", codigo, e);
            }
        });
    }

    // ── Contenido ─────────────────────────────────────────

    private Datos datos(Reserva r) {
        Datos d = new Datos();
        d.codigo = r.getCodigo() != null && !r.getCodigo().isBlank() ? r.getCodigo() : "RSV-" + r.getId();
        d.nombre = Optional.ofNullable(r.getNombreHuesped()).map(String::trim).filter(s -> !s.isEmpty())
                .map(s -> s.split("\\s+")[0]).orElse("");
        d.nombreHtml = HtmlUtils.htmlEscape(d.nombre, "UTF-8");
        d.email = r.getEmailContacto();
        d.deDia = "pasadia".equals(r.getTipoReserva()) || "grupal".equals(r.getTipoReserva());
        d.llegada = fecha(r.getFechaIngreso());
        String base = frontendUrl.endsWith("/") ? frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;
        String params = "reservaId=" + r.getId() + "&codigo=" + URLEncoder.encode(Objects.toString(r.getCodigoAcceso(), ""), StandardCharsets.UTF_8);
        d.enlacePago = base + "/pagos?" + params;
        d.enlaceReserva = base + "/confirmacion?" + params;
        d.enlacePoliticas = base + "/politicas";

        d.filas.put("Código", d.codigo);
        if (d.deDia) {
            d.filas.put("Fecha", d.llegada);
        } else {
            d.filas.put("Llegada", d.llegada);
            d.filas.put("Salida", fecha(r.getFechaSalida()));
            int n = r.getNoches() == null ? 0 : r.getNoches();
            d.filas.put("Noches", n + (n == 1 ? " noche" : " noches"));
        }
        d.filas.put("Espacio", espacio(r));
        d.filas.put("Huéspedes", personas(r));
        d.filas.put("Tipo", TIPOS.getOrDefault(r.getTipoReserva(), Objects.toString(r.getTipoReserva(), "")));
        d.total = NumberFormat.getCurrencyInstance(ES).format(r.getPrecioTotal() == null ? 0 : r.getPrecioTotal())
                .replace(",00", "");
        return d;
    }

    private String espacio(Reserva r) {
        if ("pasadia".equals(r.getTipoReserva())) return "Zonas comunes";
        if ("grupal".equals(r.getTipoReserva())) return "Salón y zonas comunes";
        String alcance = ReservaService.alcance(r);
        if ("completo".equals(alcance)) return "Casa completa";
        if ("piso1".equals(alcance)) return "Piso 1 completo";
        if ("piso2".equals(alcance)) return "Piso 2 completo";
        Set<Long> ids = new LinkedHashSet<>();
        if (r.getHabitacionesIds() != null) ids.addAll(r.getHabitacionesIds());
        if (r.getHabitacionId() != null) ids.add(r.getHabitacionId());
        List<String> nums = habitacionRepository.findAllById(ids).stream()
                .map(Habitacion::getNumero).filter(Objects::nonNull).sorted().collect(Collectors.toList());
        if (nums.isEmpty()) return ids.size() == 1 ? "1 habitación" : ids.size() + " habitaciones";
        if (nums.size() == 1) return "Habitación " + nums.get(0);
        return "Habitaciones " + String.join(", ", nums.subList(0, nums.size() - 1)) + " y " + nums.get(nums.size() - 1);
    }

    private static String personas(Reserva r) {
        List<String> partes = new ArrayList<>();
        partes.add(plural(r.getHuespedes(), "adulto", "adultos"));
        if (n(r.getNinos11()) > 0) partes.add(plural(r.getNinos11(), "joven", "jóvenes") + " (11+)");
        if (n(r.getNinos10()) > 0) partes.add(plural(r.getNinos10(), "niño", "niños") + " (4–10)");
        if (n(r.getNinos3()) > 0) partes.add(plural(r.getNinos3(), "bebé", "bebés") + " (0–3)");
        return String.join(" · ", partes);
    }

    private static int n(Integer v) { return v == null ? 0 : v; }

    private static String plural(Integer v, String uno, String varios) {
        int x = n(v);
        return x + " " + (x == 1 ? uno : varios);
    }

    private static String fecha(LocalDate d) {
        if (d == null) return "";
        return d.format(FECHA);   // "martes 1 de junio de 2027" (en español va en minúscula)
    }

    private static String mapa() {
        return "https://www.google.com/maps/search/?api=1&query="
                + URLEncoder.encode("Hospedaje Sebastián, " + DIRECCION, StandardCharsets.UTF_8);
    }

    private static String boton(String enlace, String texto) {
        return "<table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin:22px auto 0\"><tr>"
                + "<td style=\"border-radius:999px;background:#0E5A9C\">"
                + "<a href=\"" + HtmlUtils.htmlEscape(enlace, "UTF-8") + "\" style=\"display:inline-block;padding:13px 28px;font-weight:700;font-size:15px;color:#ffffff;text-decoration:none;border-radius:999px\">"
                + texto + "</a></td></tr></table>";
    }

    /** Correo con estilos en línea y tablas: así se ve bien en Gmail, Outlook y el celular. */
    private static String plantilla(String titulo, String saludo, String colorTitulo, String cuerpo, String accion, String extra) {
        return "<!doctype html><html lang=\"es\"><body style=\"margin:0;padding:0;background:#F8F4EE\">"
                + "<table role=\"presentation\" width=\"100%\" style=\"background:#F8F4EE;padding:24px 12px\"><tr><td align=\"center\">"
                + "<table role=\"presentation\" width=\"100%\" style=\"max-width:560px;background:#ffffff;border:1px solid #E8DCCB;border-radius:18px;overflow:hidden;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#2B2B2B\">"
                + "<tr><td style=\"background:#0A3D6D;padding:20px 28px;color:#ffffff\">"
                + "<div style=\"font-family:Georgia,serif;font-size:22px;font-weight:700\">Hospedaje Sebastián</div>"
                + "<div style=\"font-size:13px;opacity:.85\">Filandia, Quindío</div></td></tr>"
                + "<tr><td style=\"padding:26px 28px 8px\">"
                + "<h1 style=\"margin:0 0 8px;font-family:Georgia,serif;font-size:24px;color:" + colorTitulo + "\">" + titulo + "</h1>"
                + "<p style=\"margin:0 0 20px;font-size:15px;line-height:1.55\">" + saludo + "</p>"
                + cuerpo + accion
                + (extra == null ? "" : "<div style=\"margin-top:24px;padding-top:18px;border-top:1px solid #F0E8DC;font-size:14px;line-height:1.6\">" + extra + "</div>")
                + "</td></tr>"
                + "<tr><td style=\"padding:20px 28px 24px;font-size:12px;line-height:1.6;color:#7A7A7A\">"
                + "¿Preguntas? Escríbenos por <a href=\"" + WHATSAPP + "\" style=\"color:#0E5A9C\">WhatsApp</a>, llámanos al " + TELEFONOS
                + " o responde este correo.<br>" + DIRECCION
                + "</td></tr></table></td></tr></table></body></html>";
    }

    private static String pie() {
        return "¿Preguntas? WhatsApp " + WHATSAPP + " · " + TELEFONOS + " · " + CORREO_HOTEL + "\n" + DIRECCION + "\n\nHospedaje Sebastián";
    }

    /** QR (PNG) con el enlace a la reserva. */
    static byte[] qrPng(String contenido) {
        try {
            BitMatrix m = new QRCodeWriter().encode(contenido, BarcodeFormat.QR_CODE, 360, 360,
                    Map.of(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M, EncodeHintType.MARGIN, 1));
            BufferedImage img = new BufferedImage(m.getWidth(), m.getHeight(), BufferedImage.TYPE_INT_RGB);
            for (int x = 0; x < m.getWidth(); x++)
                for (int y = 0; y < m.getHeight(); y++)
                    img.setRGB(x, y, m.get(x, y) ? 0x0A3D6D : 0xFFFFFF);
            ByteArrayOutputStream salida = new ByteArrayOutputStream();
            ImageIO.write(img, "png", salida);
            return salida.toByteArray();
        } catch (WriterException | IOException e) {
            log.warn("No se pudo generar el QR de la reserva", e);
            return null;
        }
    }

    /** Lo que se muestra de la reserva, ya escapado para HTML. */
    private static class Datos {
        String codigo, nombre, nombreHtml, email, llegada, total, enlacePago, enlaceReserva, enlacePoliticas;
        boolean deDia;
        final Map<String, String> filas = new LinkedHashMap<>();

        String resumenHtml(String etiquetaTotal) {
            StringBuilder t = new StringBuilder("<table role=\"presentation\" width=\"100%\" style=\"border-collapse:collapse;font-size:14px\">");
            filas.forEach((k, v) -> t.append("<tr><td style=\"padding:7px 0;color:#5F5A54;border-bottom:1px solid #F0E8DC\">").append(k)
                    .append("</td><td align=\"right\" style=\"padding:7px 0;font-weight:600;border-bottom:1px solid #F0E8DC\">")
                    .append(HtmlUtils.htmlEscape(v, "UTF-8")).append("</td></tr>"));
            t.append("<tr><td style=\"padding:12px 0 0;font-size:15px\">").append(etiquetaTotal)
                    .append("</td><td align=\"right\" style=\"padding:12px 0 0;font-size:20px;font-weight:700;color:#0A3D6D\">")
                    .append(HtmlUtils.htmlEscape(total, "UTF-8")).append("</td></tr></table>");
            return t.toString();
        }

        String resumenTexto(String etiquetaTotal) {
            StringBuilder t = new StringBuilder();
            filas.forEach((k, v) -> t.append(k).append(": ").append(v).append('\n'));
            return t.append(etiquetaTotal).append(": ").append(total).append('\n').toString();
        }
    }
}
