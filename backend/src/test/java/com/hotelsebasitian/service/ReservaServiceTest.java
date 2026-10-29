package com.hotelsebasitian.service;

import com.hotelsebasitian.entity.Habitacion;
import com.hotelsebasitian.entity.Reserva;
import com.hotelsebasitian.repository.HabitacionRepository;
import com.hotelsebasitian.repository.PagoRepository;
import com.hotelsebasitian.repository.ReservaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@DisplayName("Creación de reservas desde la web")
class ReservaServiceTest {

    private static final LocalDate HOY = LocalDate.now(ZoneId.of("America/Bogota"));

    private ReservaRepository reservas;
    private HabitacionRepository habitaciones;
    private TarifaService tarifas;
    private CorreoReservaService correo;
    private ReservaService servicio;

    private final Habitacion h101 = Habitacion.builder().id(1L).numero("101").piso(1).build();
    private final Habitacion h201 = Habitacion.builder().id(4L).numero("201").piso(2).build();

    @BeforeEach
    void setUp() {
        reservas = mock(ReservaRepository.class);
        habitaciones = mock(HabitacionRepository.class);
        tarifas = mock(TarifaService.class);
        correo = mock(CorreoReservaService.class);
        servicio = new ReservaService(reservas, habitaciones, mock(PagoRepository.class), correo, mock(WompiService.class), tarifas);

        when(habitaciones.findAll()).thenReturn(List.of(h101, h201));
        when(habitaciones.findAllById(any())).thenAnswer(inv -> {
            Iterable<Long> ids = inv.getArgument(0);
            return List.of(h101, h201).stream().filter(h -> ids.toString().contains(String.valueOf(h.getId()))).toList();
        });
        when(reservas.findReservasEnRango(any(), any())).thenReturn(List.of());
        when(reservas.save(any())).thenAnswer(inv -> {
            Reserva r = inv.getArgument(0);
            r.setId(99L);
            return r;
        });
    }

    /** Reserva válida de hospedaje en la habitación 101 por 2 noches. */
    private static Reserva valida() {
        Reserva r = new Reserva();
        r.setTipoReserva("individual");
        r.setModoEspacio("habitaciones");
        r.setHabitacionesIds(List.of(1L));
        r.setFechaIngreso(HOY.plusDays(10));
        r.setFechaSalida(HOY.plusDays(12));
        r.setHuespedes(2);
        r.setNombreHuesped("  Ana ");
        r.setApellidoHuesped("Gómez");
        r.setEmailContacto("ana@example.com");
        r.setTelefonoContacto("+57 314 755 6717");
        r.setAceptaPoliticas(true);
        r.setAutorizaDatos(true);
        return r;
    }

    @Test
    @DisplayName("una reserva válida queda PENDIENTE, con código de acceso y noches calculadas por el servidor")
    void reservaValida() {
        Reserva r = valida();
        r.setNoches(1);                 // el navegador dice 1 noche...
        r.setEstado("CONFIRMADA");      // ...y que ya está confirmada
        r.setId(5L);

        Reserva guardada = servicio.crear(r, null);

        assertThat(guardada.getId()).isEqualTo(99L);
        assertThat(guardada.getEstado()).isEqualTo("PENDIENTE");
        assertThat(guardada.getNoches()).isEqualTo(2);
        assertThat(guardada.getCodigoAcceso()).hasSizeGreaterThan(20);
        assertThat(guardada.getNombreHuesped()).isEqualTo("Ana");
        assertThat(guardada.getEspacio()).isEqualTo("piso1");
        assertThat(guardada.getVersionPoliticas()).isEqualTo(ReservaService.VERSION_POLITICAS);
        verify(tarifas).aplicarPrecio(guardada);
        verify(correo).reservaRecibida(guardada);
    }

    @Test
    @DisplayName("rechaza la reserva si no acepta las políticas")
    void sinPoliticas() {
        Reserva r = valida();
        r.setAceptaPoliticas(false);

        assertThatThrownBy(() -> servicio.crear(r, null)).hasMessageContaining("aceptar la Política");
        verify(reservas, never()).save(any());
    }

    @Test
    @DisplayName("rechaza la reserva si no autoriza el tratamiento de datos")
    void sinAutorizacionDatos() {
        Reserva r = valida();
        r.setAutorizaDatos(null);

        assertThatThrownBy(() -> servicio.crear(r, null)).hasMessageContaining("tratamiento de tus datos");
    }

    @Test
    @DisplayName("rechaza fechas de ingreso en el pasado")
    void fechaPasada() {
        Reserva r = valida();
        r.setFechaIngreso(HOY.minusDays(1));

        assertThatThrownBy(() -> servicio.crear(r, null)).hasMessageContaining("pasado");
    }

    @Test
    @DisplayName("rechaza una salida anterior o igual al ingreso")
    void salidaAntesDelIngreso() {
        Reserva r = valida();
        r.setFechaSalida(r.getFechaIngreso());

        assertThatThrownBy(() -> servicio.crear(r, null)).hasMessageContaining("posterior");
    }

    @Test
    @DisplayName("rechaza estadías de más de 60 noches")
    void estadiaMuyLarga() {
        Reserva r = valida();
        r.setFechaSalida(r.getFechaIngreso().plusDays(61));

        assertThatThrownBy(() -> servicio.crear(r, null)).hasMessageContaining("60 noches");
    }

    @Test
    @DisplayName("rechaza correo y teléfono inválidos")
    void contactoInvalido() {
        Reserva correoMalo = valida();
        correoMalo.setEmailContacto("ana@");
        assertThatThrownBy(() -> servicio.crear(correoMalo, null)).hasMessageContaining("correo");

        Reserva telefonoMalo = valida();
        telefonoMalo.setTelefonoContacto("123");
        assertThatThrownBy(() -> servicio.crear(telefonoMalo, null)).hasMessageContaining("teléfono");
    }

    @Test
    @DisplayName("rechaza habitaciones que no existen")
    void habitacionInexistente() {
        Reserva r = valida();
        r.setHabitacionesIds(List.of(777L));

        assertThatThrownBy(() -> servicio.crear(r, null)).hasMessageContaining("no existe");
    }

    @Test
    @DisplayName("habitaciones de los dos pisos reservan el alcance 'completo'")
    void dosPisos() {
        Reserva r = valida();
        r.setHabitacionesIds(List.of(1L, 4L));

        assertThat(servicio.crear(r, null).getEspacio()).isEqualTo("completo");
    }

    @Test
    @DisplayName("rechaza con 409 si la habitación ya está reservada en esas fechas")
    void habitacionOcupada() {
        Reserva existente = valida();
        existente.setId(1L);
        existente.setEspacio("piso1");
        existente.setHabitacionesIds(List.of(1L));
        when(reservas.findReservasEnRango(any(), any())).thenReturn(List.of(existente));

        assertThatThrownBy(() -> servicio.crear(valida(), null))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("409")
                .hasMessageContaining("101");
        verify(reservas, never()).save(any());
    }

    @Test
    @DisplayName("la pasadía no guarda fecha de salida ni habitaciones")
    void pasadia() {
        Reserva r = valida();
        r.setTipoReserva("pasadia");

        Reserva guardada = servicio.crear(r, null);

        assertThat(guardada.getFechaSalida()).isNull();
        assertThat(guardada.getHabitacionesIds()).isNull();
    }

    @Test
    @DisplayName("si falla el correo, la reserva igual se guarda")
    void falloDeCorreoNoAfecta() {
        doThrow(new RuntimeException("SMTP caído")).when(correo).reservaRecibida(any());

        assertThat(servicio.crear(valida(), null).getId()).isEqualTo(99L);
    }
}
