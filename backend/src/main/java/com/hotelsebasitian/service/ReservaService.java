package com.hotelsebasitian.service;

import com.hotelsebasitian.entity.Habitacion;
import com.hotelsebasitian.entity.Reserva;
import com.hotelsebasitian.repository.HabitacionRepository;
import com.hotelsebasitian.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final HabitacionRepository habitacionRepository;

    // ── Consultas ─────────────────────────────────────────

    public List<Reserva> obtenerTodas() {
        return reservaRepository.findAll();
    }

    public Reserva obtenerPorId(Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada con id: " + id));
    }

    public List<Reserva> obtenerPorUsuario(Long usuarioId) {
        return reservaRepository.findByUsuarioId(usuarioId);
    }

    // ── Crear ─────────────────────────────────────────────

    public Reserva crear(Reserva reserva) {
        reserva.calcularNoches();

        // Precio según espacio seleccionado (piso / casa) o habitación individual
        if (reserva.getPrecioNoche() == null || reserva.getPrecioNoche() == 0) {
            double precio = calcularPrecioEspacio(reserva);
            reserva.setPrecioNoche(precio);
        }

        reserva.calcularPrecioTotal();
        reserva.setEstado("PENDIENTE");
        reserva.setFechaCreacion(LocalDateTime.now());
        reserva.setFechaModificacion(LocalDateTime.now());

        // Para pasadía y grupal no se marca ninguna habitación como ocupada
        boolean esNocturna = esReservaNocturna(reserva.getTipoReserva());

        if (esNocturna) {
            marcarHabitacionesOcupadas(reserva);
        }

        return reservaRepository.save(reserva);
    }

    // ── Actualizar ────────────────────────────────────────

    public Reserva actualizar(Long id, Reserva reserva) {
        Reserva existente = obtenerPorId(id);

        if (reserva.getFechaIngreso()     != null) existente.setFechaIngreso(reserva.getFechaIngreso());
        if (reserva.getFechaSalida()      != null) existente.setFechaSalida(reserva.getFechaSalida());
        if (reserva.getHuespedes()        != null) existente.setHuespedes(reserva.getHuespedes());
        if (reserva.getNombreHuesped()    != null) existente.setNombreHuesped(reserva.getNombreHuesped());
        if (reserva.getApellidoHuesped()  != null) existente.setApellidoHuesped(reserva.getApellidoHuesped());
        if (reserva.getEmailContacto()    != null) existente.setEmailContacto(reserva.getEmailContacto());
        if (reserva.getTelefonoContacto() != null) existente.setTelefonoContacto(reserva.getTelefonoContacto());
        if (reserva.getObservaciones()    != null) existente.setObservaciones(reserva.getObservaciones());
        if (reserva.getEstado()           != null) existente.setEstado(reserva.getEstado());

        existente.calcularNoches();
        existente.calcularPrecioTotal();
        existente.setFechaModificacion(LocalDateTime.now());

        return reservaRepository.save(existente);
    }

    // ── Cancelar / Eliminar ───────────────────────────────

    public Reserva cancelar(Long id) {
        Reserva reserva = obtenerPorId(id);
        reserva.setEstado("CANCELADA");
        reserva.setFechaModificacion(LocalDateTime.now());
        liberarHabitaciones(reserva);
        return reservaRepository.save(reserva);
    }

    public void eliminar(Long id) {
        Reserva reserva = obtenerPorId(id);
        liberarHabitaciones(reserva);
        reservaRepository.deleteById(id);
    }

    // ── Helpers privados ──────────────────────────────────

    /** Tarifa base por espacio (temporada baja como referencia inicial) */
    private double calcularPrecioEspacio(Reserva reserva) {
        // Si hay habitación individual seleccionada, usa su precio
        if (reserva.getHabitacionId() != null) {
            return habitacionRepository.findById(reserva.getHabitacionId())
                    .map(Habitacion::getPrecioNoche)
                    .orElse(0.0);
        }

        // Para modo piso o casa, precio total del espacio
        String espacio = reserva.getEspacio();
        if (espacio == null) return 0.0;

        switch (espacio) {
            case "piso1":    return 550000.0;
            case "piso2":    return 550000.0;
            case "completo": return 1200000.0;
            default:         return 0.0;
        }
    }

    private boolean esReservaNocturna(String tipoReserva) {
        if (tipoReserva == null) return true;
        return !tipoReserva.equals("pasadia") && !tipoReserva.equals("grupal");
    }

    private void marcarHabitacionesOcupadas(Reserva reserva) {
        // Habitaciones individuales seleccionadas
        if (reserva.getHabitacionesIds() != null) {
            reserva.getHabitacionesIds().forEach(habId ->
                habitacionRepository.findById(habId).ifPresent(h -> {
                    h.setEstado("OCUPADA");
                    habitacionRepository.save(h);
                })
            );
        } else if (reserva.getHabitacionId() != null) {
            habitacionRepository.findById(reserva.getHabitacionId()).ifPresent(h -> {
                h.setEstado("OCUPADA");
                habitacionRepository.save(h);
            });
        }
    }

    private void liberarHabitaciones(Reserva reserva) {
        if (reserva.getHabitacionesIds() != null) {
            reserva.getHabitacionesIds().forEach(habId ->
                habitacionRepository.findById(habId).ifPresent(h -> {
                    h.setEstado("DISPONIBLE");
                    habitacionRepository.save(h);
                })
            );
        } else if (reserva.getHabitacionId() != null) {
            habitacionRepository.findById(reserva.getHabitacionId()).ifPresent(h -> {
                h.setEstado("DISPONIBLE");
                habitacionRepository.save(h);
            });
        }
    }
}
