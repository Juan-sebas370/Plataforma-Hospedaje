package com.hotelsebasitian.controller;

import com.hotelsebasitian.entity.Reserva;
import com.hotelsebasitian.service.PagoWompiService;
import com.hotelsebasitian.service.ReservaService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@DisplayName("Reservas habilitadas / sitio en preparación")
class ReservaControllerTest {

    private final ReservaService servicio = mock(ReservaService.class);
    private final ReservaController controlador = new ReservaController(servicio, mock(PagoWompiService.class));

    @Test
    @DisplayName("con RESERVAS_HABILITADAS=false no se crean reservas (503)")
    void crearDeshabilitado() {
        ReflectionTestUtils.setField(controlador, "reservasHabilitadas", false);

        assertThatThrownBy(() -> controlador.crear(new Reserva()))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));
        verify(servicio, never()).crear(any(), any());
    }

    @Test
    @DisplayName("con RESERVAS_HABILITADAS=false no se genera el pago de Wompi (503)")
    void checkoutDeshabilitado() {
        ReflectionTestUtils.setField(controlador, "reservasHabilitadas", false);

        assertThatThrownBy(() -> controlador.generarCheckoutWompi(1L, "codigo"))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));
        verify(servicio, never()).generarCheckoutWompi(any());
    }

    @Test
    @DisplayName("con las reservas habilitadas crea la reserva (201)")
    void crearHabilitado() {
        ReflectionTestUtils.setField(controlador, "reservasHabilitadas", true);
        Reserva creada = new Reserva();
        when(servicio.crear(any(), any())).thenReturn(creada);

        var respuesta = controlador.crear(new Reserva());

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(respuesta.getBody()).isSameAs(creada);
    }
}
