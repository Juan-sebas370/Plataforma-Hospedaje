package com.hotelsebasitian.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DisplayName("Monitoreo: /health/db")
class HealthControllerTest {

    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final HealthController controlador = new HealthController(jdbc);

    @Test
    @DisplayName("con la base disponible responde 200 y database=UP")
    void baseDisponible() {
        when(jdbc.queryForObject("SELECT 1", Integer.class)).thenReturn(1);

        var r = controlador.healthDb();

        assertThat(r.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(r.getBody()).containsEntry("database", "UP");
    }

    @Test
    @DisplayName("con la base caída responde 503 y database=DOWN (el monitor avisa)")
    void baseCaida() {
        when(jdbc.queryForObject("SELECT 1", Integer.class))
                .thenThrow(new DataAccessResourceFailureException("Communications link failure"));

        var r = controlador.healthDb();

        assertThat(r.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(r.getBody()).containsEntry("database", "DOWN");
    }
}
