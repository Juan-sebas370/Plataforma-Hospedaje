package com.hotelsebasitian.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Integración con la pasarela de pagos Wompi (Colombia): firma de integridad
 * para el Widget de Checkout y verificación del checksum de eventos/webhooks.
 * Referencia: https://docs.wompi.co/docs/colombia/widget-checkout-web
 */
@Slf4j
@Service
public class WompiService {

    private static final Pattern TRANSACCION_ID_PATTERN = Pattern.compile("^[A-Za-z0-9-]{1,64}$");
    private static final int MAX_INTENTOS_CONSULTA = 3;

    private final RestClient restClient = RestClient.create();

    @Value("${wompi.public-key:}")
    private String publicKey;

    @Value("${wompi.integrity-secret:}")
    private String integritySecret;

    @Value("${wompi.events-secret:}")
    private String eventsSecret;

    /** Solo para pruebas: dirección alternativa de la API de Wompi. Vacío = según la llave pública. */
    @Value("${wompi.api-url:}")
    private String apiUrl;

    public String getPublicKey() {
        return publicKey;
    }

    public boolean estaConfigurado() {
        return !esVacio(publicKey) && !esVacio(integritySecret) && !esVacio(eventsSecret);
    }

    /**
     * Firma de integridad que exige el Widget de Wompi para evitar que se
     * manipulen el monto/moneda/referencia desde el navegador:
     * SHA-256(reference + amountInCents + currency + integritySecret).
     */
    public String firmarIntegridad(String reference, long amountInCents, String currency) {
        String cadena = reference + amountInCents + currency + integritySecret;
        return sha256Hex(cadena);
    }

    /**
     * Verifica el checksum de un evento/webhook de Wompi. El evento indica en
     * signature.properties qué campos de "data" hay que concatenar (en ese
     * orden) — nunca hay que asumir una lista fija, Wompi puede cambiarla.
     * Si el secreto de eventos no está configurado, se rechaza siempre: de lo
     * contrario cualquiera podría calcular un checksum válido contra un
     * secreto vacío.
     */
    @SuppressWarnings("unchecked")
    public boolean verificarChecksumEvento(Map<String, Object> payload) {
        if (esVacio(eventsSecret)) {
            return false;
        }
        Object signatureObj = payload.get("signature");
        Object dataObj = payload.get("data");
        Object timestampObj = payload.get("timestamp");
        if (!(signatureObj instanceof Map) || !(dataObj instanceof Map) || timestampObj == null) {
            return false;
        }

        Map<String, Object> signature = (Map<String, Object>) signatureObj;
        Map<String, Object> data = (Map<String, Object>) dataObj;
        Object propertiesObj = signature.get("properties");
        Object checksumRecibido = signature.get("checksum");
        if (!(propertiesObj instanceof List) || checksumRecibido == null) {
            return false;
        }

        StringBuilder cadena = new StringBuilder();
        for (Object propiedad : (List<Object>) propertiesObj) {
            Object valor = extraerValorAnidado(data, String.valueOf(propiedad));
            cadena.append(valor == null ? "" : valor);
        }
        cadena.append(timestampObj).append(eventsSecret);

        String checksumCalculado = sha256Hex(cadena.toString());
        return checksumCalculado.equalsIgnoreCase(String.valueOf(checksumRecibido));
    }

    /**
     * Consulta una transacción directamente en la API de Wompi. Este endpoint
     * es público (no requiere llave privada), y como la respuesta viene del
     * servidor de Wompi — no del navegador — es fuente confiable del estado.
     * Usa sandbox o producción según el prefijo de la llave pública.
     *
     * @return el objeto "data" de la transacción (id, status, reference, amount_in_cents...)
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> consultarTransaccion(String transaccionId) {
        if (transaccionId == null || !TRANSACCION_ID_PATTERN.matcher(transaccionId).matches()) {
            throw new RuntimeException("Identificador de transacción inválido");
        }
        String baseUrl = !esVacio(apiUrl) ? apiUrl : publicKey != null && publicKey.startsWith("pub_prod_")
                ? "https://production.wompi.co/v1"
                : "https://sandbox.wompi.co/v1";
        // Fallos de red o DNS pasajeros son comunes justo después de cerrar el
        // widget: se reintenta antes de rendirse, porque el cobro ya se hizo.
        for (int intento = 1; ; intento++) {
            try {
                Map<String, Object> respuesta = restClient.get()
                        .uri(baseUrl + "/transactions/{id}", transaccionId)
                        .retrieve()
                        .body(Map.class);
                Object data = respuesta == null ? null : respuesta.get("data");
                if (!(data instanceof Map)) {
                    throw new RuntimeException("Wompi no devolvió la transacción");
                }
                return (Map<String, Object>) data;
            } catch (HttpClientErrorException.NotFound e) {
                log.warn("Wompi ({}) no encontró la transacción {}", baseUrl, transaccionId);
                throw new RuntimeException("Wompi no encontró la transacción " + transaccionId);
            } catch (RestClientException e) {
                if (intento >= MAX_INTENTOS_CONSULTA) {
                    log.error("Error consultando la transacción {} en Wompi ({})", transaccionId, baseUrl, e);
                    throw new RuntimeException("No se pudo consultar la transacción en Wompi");
                }
                log.warn("Intento {} de consultar la transacción {} en Wompi falló: {}", intento, transaccionId, e.getMessage());
                esperar(intento * 1000L);
            }
        }
    }

    private void esperar(long milisegundos) {
        try {
            Thread.sleep(milisegundos);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("No se pudo consultar la transacción en Wompi");
        }
    }

    @SuppressWarnings("unchecked")
    private Object extraerValorAnidado(Map<String, Object> data, String pathPuntos) {
        Object actual = data;
        for (String parte : pathPuntos.split("\\.")) {
            if (!(actual instanceof Map)) return null;
            actual = ((Map<String, Object>) actual).get(parte);
        }
        return actual;
    }

    private boolean esVacio(String valor) {
        return valor == null || valor.isBlank();
    }

    private String sha256Hex(String input) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(digest.length * 2);
            for (byte b : digest) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Hashing algorithm unavailable", e);
        }
    }
}
