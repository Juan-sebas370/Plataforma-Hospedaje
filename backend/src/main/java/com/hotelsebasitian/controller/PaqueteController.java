package com.hotelsebasitian.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotelsebasitian.entity.Paquete;
import com.hotelsebasitian.repository.PaqueteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Paquetes: lectura pública; crear, editar y borrar solo administración (ver SecurityConfig). */
@RestController
@RequestMapping("/paquetes")
@RequiredArgsConstructor
public class PaqueteController {

    private final PaqueteRepository paqueteRepository;
    private final ObjectMapper json;

    @GetMapping
    public List<Paquete> obtenerPaquetesDisponibles() {
        return paqueteRepository.findByDisponibleTrue();
    }

    @GetMapping("/{id}")
    public Paquete obtenerPaqueteById(@PathVariable Long id) {
        return buscar(id);
    }

    @GetMapping("/tipo/{tipo}")
    public List<Paquete> obtenerPaquetesPorTipo(@PathVariable String tipo) {
        return paqueteRepository.findByTipo(tipo);
    }

    @PostMapping
    public ResponseEntity<Paquete> crearPaquete(@RequestBody Paquete paquete) {
        paquete.setId(null);   // nunca se sobrescribe un paquete existente
        paquete.setFechaCreacion(LocalDateTime.now());
        validar(paquete);
        return ResponseEntity.status(HttpStatus.CREATED).body(paqueteRepository.save(paquete));
    }

    /** Actualización parcial: solo cambian los campos que vienen en el cuerpo. */
    @PutMapping("/{id}")
    public Paquete actualizarPaquete(@PathVariable Long id, @RequestBody JsonNode cambios) throws IOException {
        Paquete paquete = buscar(id);
        LocalDateTime creado = paquete.getFechaCreacion();
        json.readerForUpdating(paquete).readValue(cambios);
        paquete.setId(id);
        paquete.setFechaCreacion(creado);
        paquete.setFechaModificacion(LocalDateTime.now());
        validar(paquete);
        return paqueteRepository.save(paquete);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPaquete(@PathVariable Long id) {
        paqueteRepository.delete(buscar(id));
        return ResponseEntity.noContent().build();
    }

    private Paquete buscar(Long id) {
        return paqueteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paquete no encontrado"));
    }

    private static void validar(Paquete p) {
        if (p.getNombre() == null || p.getNombre().isBlank()) throw new RuntimeException("Escribe el nombre del paquete");
        if (p.getNombre().length() > 150) throw new RuntimeException("El nombre puede tener máximo 150 caracteres");
        p.setNombre(p.getNombre().trim());
        if (p.getPrecioTotal() == null || p.getPrecioTotal().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("El precio total es obligatorio y no puede ser negativo");
        }
        if (p.getPrecioPorNoche() != null && p.getPrecioPorNoche().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("El precio por noche no puede ser negativo");
        }
        if (p.getDescuentoPorcentaje() != null && (p.getDescuentoPorcentaje() < 0 || p.getDescuentoPorcentaje() > 100)) {
            throw new RuntimeException("El descuento debe estar entre 0 y 100 %");
        }
        if (p.getNochesMinimas() != null && p.getNochesMinimas() < 1) throw new RuntimeException("Las noches mínimas deben ser al menos 1");
        if (p.getCapacidadMaxima() != null && p.getCapacidadMaxima() < 1) throw new RuntimeException("La capacidad debe ser al menos 1 persona");
        if (p.getFechaInicio() != null && p.getFechaFin() != null && p.getFechaFin().isBefore(p.getFechaInicio())) {
            throw new RuntimeException("La fecha de fin no puede ser anterior a la de inicio");
        }
    }
}
