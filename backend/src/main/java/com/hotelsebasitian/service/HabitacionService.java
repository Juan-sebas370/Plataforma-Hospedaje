package com.hotelsebasitian.service;

import com.hotelsebasitian.entity.Habitacion;
import com.hotelsebasitian.entity.Reserva;
import com.hotelsebasitian.repository.HabitacionRepository;
import com.hotelsebasitian.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HabitacionService {

    private final HabitacionRepository habitacionRepository;
    private final ReservaRepository reservaRepository;

    public List<Habitacion> obtenerTodas() {
        return habitacionRepository.findAll();
    }

    public Habitacion obtenerPorId(Long id) {
        return habitacionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Habitación no encontrada con id: " + id));
    }

    public List<Habitacion> obtenerDisponibles() {
        return habitacionRepository.findByEstado("DISPONIBLE");
    }

    public List<Habitacion> obtenerPorPiso(Integer piso) {
        return habitacionRepository.findByPiso(piso);
    }

    public Habitacion crear(Habitacion habitacion) {
        // El id lo asigna la base: si viniera en el cuerpo, save() sobrescribiría otra habitación.
        habitacion.setId(null);
        if (habitacion.getEstado() == null) {
            habitacion.setEstado("DISPONIBLE");
        }
        validar(habitacion);
        return habitacionRepository.save(habitacion);
    }

    public Habitacion actualizar(Long id, Habitacion habitacion) {
        Habitacion existente = obtenerPorId(id);
        if (habitacion.getNumero()        != null) existente.setNumero(habitacion.getNumero());
        if (habitacion.getTipo()          != null) existente.setTipo(habitacion.getTipo());
        if (habitacion.getPiso()          != null) existente.setPiso(habitacion.getPiso());
        if (habitacion.getCapacidad()     != null) existente.setCapacidad(habitacion.getCapacidad());
        if (habitacion.getPrecioNoche()   != null) existente.setPrecioNoche(habitacion.getPrecioNoche());
        if (habitacion.getPrecioMedia()   != null) existente.setPrecioMedia(habitacion.getPrecioMedia());
        if (habitacion.getPrecioAlta()    != null) existente.setPrecioAlta(habitacion.getPrecioAlta());
        if (habitacion.getDescripcion()   != null) existente.setDescripcion(habitacion.getDescripcion());
        if (habitacion.getServicios()     != null) existente.setServicios(habitacion.getServicios());
        if (habitacion.getImagenes()      != null) existente.setImagenes(habitacion.getImagenes());
        if (habitacion.getEstado()        != null) existente.setEstado(habitacion.getEstado());
        if (habitacion.getClimatizacion() != null) existente.setClimatizacion(habitacion.getClimatizacion());
        if (habitacion.getTelevision()    != null) existente.setTelevision(habitacion.getTelevision());
        if (habitacion.getWifi()          != null) existente.setWifi(habitacion.getWifi());
        if (habitacion.getBano()          != null) existente.setBano(habitacion.getBano());
        if (habitacion.getMinibar()       != null) existente.setMinibar(habitacion.getMinibar());
        validar(existente);
        return habitacionRepository.save(existente);
    }

    public void eliminar(Long id) {
        Habitacion habitacion = obtenerPorId(id);
        boolean tieneReservas = reservaRepository.findReservasEnRango(LocalDate.now(), LocalDate.now().plusYears(5))
                .stream()
                .anyMatch(r -> usaHabitacion(r, id));
        if (tieneReservas) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La habitación " + habitacion.getNumero() + " tiene reservas vigentes. Cámbiala a MANTENIMIENTO en lugar de borrarla");
        }
        habitacionRepository.delete(habitacion);
    }

    private static boolean usaHabitacion(Reserva r, Long id) {
        return id.equals(r.getHabitacionId()) || (r.getHabitacionesIds() != null && r.getHabitacionesIds().contains(id));
    }

    private static void validar(Habitacion h) {
        if (h.getCapacidad() != null && h.getCapacidad() < 1) {
            throw new RuntimeException("La capacidad debe ser al menos 1 persona");
        }
        if (h.getPiso() != null && h.getPiso() < 1) {
            throw new RuntimeException("El piso debe ser 1 o mayor");
        }
        for (Double precio : new Double[]{h.getPrecioNoche(), h.getPrecioMedia(), h.getPrecioAlta()}) {
            if (precio != null && precio < 0) {
                throw new RuntimeException("Los precios no pueden ser negativos");
            }
        }
    }
}
