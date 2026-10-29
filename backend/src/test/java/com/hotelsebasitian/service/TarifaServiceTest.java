package com.hotelsebasitian.service;

import com.hotelsebasitian.entity.Reserva;
import com.hotelsebasitian.entity.TarifaReserva;
import com.hotelsebasitian.repository.TarifaReservaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DisplayName("Cálculo de precio de la reserva")
class TarifaServiceTest {

    private static final LocalDate MIERCOLES = LocalDate.of(2026, 10, 28);

    private TarifaReservaRepository tarifas;
    private CalendarioTemporadas calendario;
    private TarifaService servicio;

    @BeforeEach
    void setUp() {
        tarifas = mock(TarifaReservaRepository.class);
        calendario = mock(CalendarioTemporadas.class);
        servicio = new TarifaService(tarifas, calendario);
        when(calendario.temporada(any())).thenReturn("baja");
        when(tarifas.findByTipoReserva(anyString())).thenReturn(Optional.empty());
        when(tarifas.findByTipoReserva("individual")).thenReturn(Optional.of(tarifa("individual", 35000, 45000, 60000)));
        when(tarifas.findByTipoReserva("pasadia")).thenReturn(Optional.of(tarifa("pasadia", 35000, 45000, 60000)));
    }

    private static TarifaReserva tarifa(String tipo, double baja, double media, double alta) {
        return new TarifaReserva(null, tipo, tipo, baja, media, alta, null);
    }

    private static Reserva reserva(String tipo, int adultos, int ninos11, int ninos10, int noches) {
        Reserva r = new Reserva();
        r.setTipoReserva(tipo);
        r.setFechaIngreso(MIERCOLES);
        r.setHuespedes(adultos);
        r.setNinos11(ninos11);
        r.setNinos10(ninos10);
        r.setNoches(noches);
        return r;
    }

    @Test
    @DisplayName("adultos × tarifa × noches en temporada baja")
    void adultosTemporadaBaja() {
        Reserva r = reserva("individual", 2, 0, 0, 3);
        servicio.aplicarPrecio(r);

        assertThat(r.getTemporada()).isEqualTo("baja");
        assertThat(r.getPrecioNoche()).isEqualTo(70000.0);
        assertThat(r.getPrecioTotal()).isEqualTo(210000.0);
    }

    @Test
    @DisplayName("niños de 11+ pagan completo y de 4 a 10 años pagan el 60 %")
    void tarifaDeNinos() {
        Reserva r = reserva("individual", 1, 1, 1, 1);
        servicio.aplicarPrecio(r);

        // 2 × 35.000 + 0,6 × 35.000 = 91.000
        assertThat(r.getPrecioNoche()).isEqualTo(91000.0);
    }

    @Test
    @DisplayName("usa el precio de la temporada de llegada")
    void temporadaAlta() {
        when(calendario.temporada(MIERCOLES)).thenReturn("alta");
        Reserva r = reserva("individual", 1, 0, 0, 2);
        servicio.aplicarPrecio(r);

        assertThat(r.getTemporada()).isEqualTo("alta");
        assertThat(r.getPrecioTotal()).isEqualTo(120000.0);
    }

    @Test
    @DisplayName("la pasadía se cobra como un solo día aunque digan más noches")
    void pasadiaUnDia() {
        Reserva r = reserva("pasadia", 2, 0, 0, 5);
        servicio.aplicarPrecio(r);

        assertThat(r.getNoches()).isEqualTo(1);
        assertThat(r.getPrecioTotal()).isEqualTo(70000.0);
    }

    @Test
    @DisplayName("ignora el precio que manda el navegador")
    void ignoraPrecioDelNavegador() {
        Reserva r = reserva("individual", 1, 0, 0, 1);
        r.setPrecioTotal(1.0);
        r.setPrecioNoche(1.0);
        servicio.aplicarPrecio(r);

        assertThat(r.getPrecioTotal()).isEqualTo(35000.0);
    }

    @Test
    @DisplayName("rechaza una reserva sin adultos")
    void sinAdultos() {
        assertThatThrownBy(() -> servicio.aplicarPrecio(reserva("individual", 0, 2, 0, 1)))
                .hasMessageContaining("al menos un adulto");
    }

    @Test
    @DisplayName("rechaza un tipo de reserva sin tarifa configurada")
    void tipoSinTarifa() {
        assertThatThrownBy(() -> servicio.aplicarPrecio(reserva("vip", 1, 0, 0, 1)))
                .hasMessageContaining("No hay tarifa configurada");
    }
}
