package com.hotelsebasitian.service;

import com.hotelsebasitian.entity.Habitacion;
import com.hotelsebasitian.repository.HabitacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HabitacionService {

    private final HabitacionRepository habitacionRepository;

    public List<Habitacion> obtenerTodas() {
        return habitacionRepository.findAll();
    }

    public Habitacion obtenerPorId(Long id) {
        return habitacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Habitación no encontrada"));
    }

    public List<Habitacion> obtenerDisponibles() {
        return habitacionRepository.findByEstado("DISPONIBLE");
    }

    public Habitacion crear(Habitacion habitacion) {
        habitacion.setEstado("DISPONIBLE");
        return habitacionRepository.save(habitacion);
    }

    public Habitacion actualizar(Long id, Habitacion habitacion) {
        Habitacion existente = obtenerPorId(id);
        
        if (habitacion.getNumero() != null) {
            existente.setNumero(habitacion.getNumero());
        }
        if (habitacion.getTipo() != null) {
            existente.setTipo(habitacion.getTipo());
        }
        if (habitacion.getCapacidad() != null) {
            existente.setCapacidad(habitacion.getCapacidad());
        }
        if (habitacion.getPrecioNoche() != null) {
            existente.setPrecioNoche(habitacion.getPrecioNoche());
        }
        if (habitacion.getDescripcion() != null) {
            existente.setDescripcion(habitacion.getDescripcion());
        }
        if (habitacion.getServicios() != null) {
            existente.setServicios(habitacion.getServicios());
        }
        if (habitacion.getImagenes() != null) {
            existente.setImagenes(habitacion.getImagenes());
        }
        if (habitacion.getEstado() != null) {
            existente.setEstado(habitacion.getEstado());
        }

        return habitacionRepository.save(existente);
    }

    public void eliminar(Long id) {
        habitacionRepository.deleteById(id);
    }

}
