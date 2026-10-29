package com.hotelsebasitian.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Firmas de Wompi")
class WompiServiceTest {

    private WompiService wompi;

    @BeforeEach
    void setUp() {
        wompi = new WompiService();
        ReflectionTestUtils.setField(wompi, "publicKey", "pub_test_x");
        ReflectionTestUtils.setField(wompi, "integritySecret", "test_integrity_abc");
        ReflectionTestUtils.setField(wompi, "eventsSecret", "test_events_xyz");
    }

    private static String sha256(String s) throws Exception {
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(s.getBytes(StandardCharsets.UTF_8)));
    }

    /** Evento como lo envía Wompi, con el checksum calculado con el secreto indicado. */
    private static Map<String, Object> evento(String secreto, String estado) throws Exception {
        Map<String, Object> transaccion = new HashMap<>(Map.of("id", "1234-1610641025-49201", "status", estado, "amount_in_cents", 4490000));
        String checksum = sha256("1234-1610641025-49201" + estado + 4490000 + 1530291411L + secreto);
        Map<String, Object> payload = new HashMap<>();
        payload.put("data", Map.of("transaction", transaccion));
        payload.put("signature", Map.of(
                "properties", List.of("transaction.id", "transaction.status", "transaction.amount_in_cents"),
                "checksum", checksum));
        payload.put("timestamp", 1530291411L);
        return payload;
    }

    @Test
    @DisplayName("la firma de integridad es SHA-256(referencia + monto + moneda + secreto)")
    void firmaIntegridad() throws Exception {
        assertThat(wompi.firmarIntegridad("HS-42-abcd", 55000000, "COP"))
                .isEqualTo(sha256("HS-42-abcd55000000COPtest_integrity_abc"));
    }

    @Test
    @DisplayName("acepta un evento firmado con el secreto correcto")
    void eventoValido() throws Exception {
        assertThat(wompi.verificarChecksumEvento(evento("test_events_xyz", "APPROVED"))).isTrue();
    }

    @Test
    @DisplayName("rechaza un evento firmado con otro secreto (falsificado)")
    void eventoFalsificado() throws Exception {
        assertThat(wompi.verificarChecksumEvento(evento("secreto_de_un_atacante", "APPROVED"))).isFalse();
    }

    @Test
    @DisplayName("rechaza un evento al que le cambiaron el estado después de firmarlo")
    @SuppressWarnings("unchecked")
    void eventoManipulado() throws Exception {
        Map<String, Object> payload = evento("test_events_xyz", "DECLINED");
        ((Map<String, Object>) ((Map<String, Object>) payload.get("data")).get("transaction")).put("status", "APPROVED");

        assertThat(wompi.verificarChecksumEvento(payload)).isFalse();
    }

    @Test
    @DisplayName("sin secreto de eventos configurado rechaza todo")
    void sinSecretoRechaza() throws Exception {
        ReflectionTestUtils.setField(wompi, "eventsSecret", "");

        assertThat(wompi.verificarChecksumEvento(evento("", "APPROVED"))).isFalse();
        assertThat(wompi.estaConfigurado()).isFalse();
    }

    @Test
    @DisplayName("rechaza un evento sin firma")
    void eventoSinFirma() {
        assertThat(wompi.verificarChecksumEvento(Map.of("data", Map.of(), "timestamp", 1L))).isFalse();
    }
}
