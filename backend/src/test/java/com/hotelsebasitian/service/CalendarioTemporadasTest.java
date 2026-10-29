package com.hotelsebasitian.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DisplayName("Calendario de temporadas")
class CalendarioTemporadasTest {

    private JdbcTemplate jdbc;
    private CalendarioTemporadas calendario;

    @BeforeEach
    void setUp() {
        jdbc = mock(JdbcTemplate.class);
        // Sin calendario guardado en `configuracion`: reglas de fábrica
        when(jdbc.queryForList(anyString(), eq(String.class))).thenReturn(List.of());
        calendario = new CalendarioTemporadas(jdbc, new ObjectMapper());
    }

    @ParameterizedTest(name = "Pascua {0} = {1}")
    @CsvSource({"2024, 2024-03-31", "2025, 2025-04-20", "2026, 2026-04-05", "2027, 2027-03-28"})
    @DisplayName("calcula el domingo de Pascua")
    void pascua(int anio, LocalDate esperado) {
        assertThat(CalendarioTemporadas.pascua(anio)).isEqualTo(esperado);
    }

    @ParameterizedTest(name = "{0} → {1} ({2})")
    @CsvSource({
            "2026-12-20, alta,  vacaciones de fin de año",
            "2027-01-10, alta,  periodo que cruza el cambio de año",
            "2026-06-20, alta,  vacaciones de mitad de año",
            "2026-04-01, alta,  Semana Santa",
            "2026-10-31, media, sábado",
            "2026-07-20, media, festivo fijo (lunes)",
            "2026-10-28, baja,  miércoles normal",
            "2026-07-16, baja,  día siguiente al fin de temporada alta (jueves)"
    })
    @DisplayName("asigna la temporada con las reglas de fábrica")
    void temporadaDeFabrica(LocalDate dia, String esperada, String caso) {
        assertThat(calendario.temporada(dia)).as(caso).isEqualTo(esperada);
    }

    @Test
    @DisplayName("una fecha especial guardada en SOGO tiene prioridad sobre las reglas")
    void fechaEspecialTienePrioridad() {
        when(jdbc.queryForList(anyString(), eq(String.class))).thenReturn(List.of(
                "{\"especiales\":[{\"desde\":\"2026-10-28\",\"hasta\":\"2026-10-29\",\"temporada\":\"alta\"}]}"));

        assertThat(calendario.temporada(LocalDate.of(2026, 10, 28))).isEqualTo("alta");
        assertThat(calendario.temporada(LocalDate.of(2026, 10, 27))).isEqualTo("baja");
    }

    @Test
    @DisplayName("con JSON dañado en la base usa las reglas de fábrica")
    void jsonDaniadoUsaFabrica() {
        when(jdbc.queryForList(anyString(), eq(String.class))).thenReturn(List.of("{no es json"));

        assertThat(calendario.temporada(LocalDate.of(2026, 12, 20))).isEqualTo("alta");
    }
}
