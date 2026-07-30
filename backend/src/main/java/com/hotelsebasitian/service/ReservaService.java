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

    public List<Reserva> obtenerTodas() {
        return reservaRepository.findAll();
    }

    public Reserva obtenerPorId(Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
    }

    public List<Reserva> obtenerPorUsuario(Long usuarioId) {
        return reservaRepository.findByUsuarioId(usuarioId);
    }

    public Reserva crear(Reserva reserva) {
        // Validar que la habitación existe
        Habitacion habitacion = habitacionRepository.findById(reserva.getHabitacionId())
                .orElseThrow(() -> new RuntimeException("Habitación no encontrada"));

        // Calcular noches y precio total
        reserva.calcularNoches();
        reserva.setPrecioNoche(habitacion.getPrecioNoche());
        reserva.calcularPrecioTotal();

        reserva.setEstado("PENDIENTE");
        reserva.setFechaCreacion(LocalDateTime.now());
        reserva.setFechaModificacion(LocalDateTime.now());

        // Cambiar estado de la habitación a ocupada
        habitacion.setEstado("OCUPADA");
        habitacionRepository.save(habitacion);

        return reservaRepository.save(reserva);
    }

    public Reserva actualizar(Long id, Reserva reserva) {
        Reserva existente = obtenerPorId(id);

        if (reserva.getFechaIngreso() != null) {
            existente.setFechaIngreso(reserva.getFechaIngreso());
        }
        if (reserva.getFechaSalida() != null) {
            existente.setFechaSalida(reserva.getFechaSalida());
        }
        if (reserva.getHuespedes() != null) {
            existente.setHuespedes(reserva.getHuespedes());
        }
        if (reserva.getNombreHuesped() != null) {
            existente.setNombreHuesped(reserva.getNombreHuesped());
        }
        if (reserva.getTelefonoContacto() != null) {
            existente.setTelefonoContacto(reserva.getTelefonoContacto());
        }
        if (reserva.getObservaciones() != null) {
            existente.setObservaciones(reserva.getObservaciones());
        }

        existente.calcularNoches();
        existente.calcularPrecioTotal();
        existente.setFechaModificacion(LocalDateTime.now());

        return reservaRepository.save(existente);
    }

    public void eliminar(Long id) {
        Reserva reserva = obtenerPorId(id);
        
        // Cambiar estado de la habitación a disponible
        Habitacion habitacion = habitacionRepository.findById(reserva.getHabitacionId()).orElse(null);
        if (habitacion != null) {
            habitacion.setEstado("DISPONIBLE");
            habitacionRepository.save(habitacion);
        }

        reservaRepository.deleteById(id);
    }

    public Reserva cancelar(Long id) {
        Reserva reserva = obtenerPorId(id);
        reserva.setEstado("CANCELADA");
        reserva.setFechaModificacion(LocalDateTime.now());

        // Cambiar estado de la habitación a disponible
        Habitacion habitacion = habitacionRepository.findById(reserva.getHabitacionId()).orElse(null);
        if (habitacion != null) {
            habitacion.setEstado("DISPONIBLE");
            habitacionRepository.save(habitacion);
        }

        return reservaRepository.save(reserva);
    }

}
