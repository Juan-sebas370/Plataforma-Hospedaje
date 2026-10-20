package com.hotelsebasitian.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

/**
 * Calendario de temporadas que se gestiona en SOGO (Alojamiento › Tarifas y temporadas) y se guarda
 * en `configuracion`, clave 'temporadas'. Si aún no se ha guardado, se usan las reglas de fábrica:
 * alta del 15 dic al 15 ene, del 15 jun al 15 jul y Semana Santa; media fines de semana y festivos.
 * La misma regla está en SOGO (rates.model.ts) y en la web (reserva.catalogo.ts).
 */
@Component
public class CalendarioTemporadas {

    private static final String FABRICA = """
        {"alta":[{"nombre":"Fin y comienzo de año","desde":"12-15","hasta":"01-15"},{"nombre":"Vacaciones de mitad de año","desde":"06-15","hasta":"07-15"}],
         "media":[],"semanaSanta":true,"finesDeSemana":true,"festivosMedia":true,"festivos":[],"especiales":[]}""";
    private static final List<String> FESTIVOS_FIJOS = List.of("01-01", "05-01", "07-20", "08-07", "12-08", "12-25");

    private final JdbcTemplate jdbc;
    private final ObjectMapper json;

    public CalendarioTemporadas(JdbcTemplate jdbc, ObjectMapper json) {
        this.jdbc = jdbc;
        this.json = json;
    }

    /** El calendario guardado (o el de fábrica si no hay). */
    public JsonNode actual() {
        ObjectNode calendario;
        try { calendario = (ObjectNode) json.readTree(FABRICA); } catch (Exception e) { throw new IllegalStateException(e); }
        try {
            List<String> v = jdbc.queryForList("SELECT CAST(valor AS CHAR) FROM configuracion WHERE clave = 'temporadas'", String.class);
            if (!v.isEmpty() && v.get(0) != null) {
                JsonNode guardado = json.readTree(v.get(0));
                // Lo que falte en el calendario guardado se toma de fábrica, igual
                // que hace la web ({ ...CALENDARIO_FABRICA, ...guardado }); si no,
                // la web mostraría una temporada y aquí se cobraría otra.
                if (guardado instanceof ObjectNode o) calendario.setAll(o);
            }
        } catch (Exception ignored) {
            // Sin la tabla, sin la clave o con JSON dañado: reglas de fábrica
        }
        return calendario;
    }

    /** baja | media | alta del día. */
    public String temporada(LocalDate d) {
        JsonNode c = actual();
        String iso = d.toString(), md = iso.substring(5);
        for (JsonNode e : c.path("especiales")) {
            if (iso.compareTo(e.path("desde").asText()) >= 0 && iso.compareTo(e.path("hasta").asText()) <= 0) return e.path("temporada").asText("baja");
        }
        for (JsonNode r : c.path("alta")) if (enPeriodo(md, r)) return "alta";
        if (c.path("semanaSanta").asBoolean(true)) {
            LocalDate pascua = pascua(d.getYear());
            if (!d.isBefore(pascua.minusDays(8)) && !d.isAfter(pascua)) return "alta";
        }
        for (JsonNode r : c.path("media")) if (enPeriodo(md, r)) return "media";
        if (c.path("festivosMedia").asBoolean(true)) {
            boolean lista = c.path("festivos").size() > 0;
            if (lista) { for (JsonNode f : c.path("festivos")) if (iso.equals(f.asText())) return "media"; }
            else if (FESTIVOS_FIJOS.contains(md)) return "media";   // sin calendario guardado: los de antes
        }
        if (c.path("finesDeSemana").asBoolean(true) && (d.getDayOfWeek() == DayOfWeek.SATURDAY || d.getDayOfWeek() == DayOfWeek.SUNDAY)) return "media";
        return "baja";
    }

    private static boolean enPeriodo(String md, JsonNode r) {
        String desde = r.path("desde").asText(), hasta = r.path("hasta").asText();
        return desde.compareTo(hasta) <= 0 ? md.compareTo(desde) >= 0 && md.compareTo(hasta) <= 0
                                           : md.compareTo(desde) >= 0 || md.compareTo(hasta) <= 0;
    }

    /** Domingo de Pascua (algoritmo de Meeus/Butcher). */
    static LocalDate pascua(int y) {
        int a = y % 19, b = y / 100, c = y % 100, d = b / 4, e = b % 4,
            f = (b + 8) / 25, g = (b - f + 1) / 3,
            h = (19 * a + b - d - g + 15) % 30, i = c / 4, k = c % 4,
            l = (32 + 2 * e + 2 * i - h - k) % 7, m = (a + 11 * h + 22 * l) / 451,
            mes = (h + l - 7 * m + 114) / 31, dia = ((h + l - 7 * m + 114) % 31) + 1;
        return LocalDate.of(y, mes, dia);
    }
}
