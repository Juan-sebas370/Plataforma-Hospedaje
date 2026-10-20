package com.hotelsebasitian.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * GET /api/hospedaje — datos públicos del hospedaje (nombre, razón social,
 * NIT, RNT y contacto). Los edita SOGO en Configuración › Datos del hospedaje
 * (tabla `configuracion`, clave 'hospedaje'). La web los usa en las políticas:
 * la Ley 1581 exige identificar al responsable del tratamiento de datos.
 * Solo se exponen estos campos, nunca el resto de la configuración.
 */
@RestController
@RequestMapping("/hospedaje")
@RequiredArgsConstructor
public class HospedajeController {

    private static final List<String> CAMPOS = List.of(
            "commercialName", "legalName", "nit", "rnt", "address", "municipality", "phone", "mobile", "email", "website");

    private final JdbcTemplate jdbc;
    private final ObjectMapper json;

    @GetMapping
    public Map<String, String> datos() {
        Map<String, String> datos = new LinkedHashMap<>();
        CAMPOS.forEach(c -> datos.put(c, ""));
        try {
            List<String> v = jdbc.queryForList("SELECT CAST(valor AS CHAR) FROM configuracion WHERE clave = 'hospedaje'", String.class);
            if (!v.isEmpty() && v.get(0) != null) {
                JsonNode guardado = json.readTree(v.get(0));
                CAMPOS.forEach(c -> datos.put(c, guardado.path(c).asText("").trim()));
            }
        } catch (Exception ignored) {
            // Sin la tabla o sin la clave: la web usa sus datos por defecto
        }
        return datos;
    }
}
