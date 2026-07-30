package com.hotelsebasitian.controller;

import com.hotelsebasitian.entity.Promocion;
import com.hotelsebasitian.repository.PromocionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/promociones")
@CrossOrigin(origins = "http://localhost:4200")
public class PromocionController {
    
    @Autowired
    private PromocionRepository promocionRepository;
    
    /**
     * Obtener todas las promociones activas
     */
    @GetMapping
    public ResponseEntity<?> obtenerPromocionesActivas() {
        try {
            List<Promocion> promociones = promocionRepository.findByActivoTrue();
            return ResponseEntity.ok(promociones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al obtener promociones: " + e.getMessage());
        }
    }
    
    /**
     * Obtener promoción por código
     */
    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<?> obtenerPromocionPorCodigo(@PathVariable String codigo) {
        try {
            Optional<Promocion> promocion = promocionRepository.findByCodigo(codigo);
            if (promocion.isPresent()) {
                return ResponseEntity.ok(promocion.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al obtener promoción: " + e.getMessage());
        }
    }
    
    /**
     * Crear nueva promoción
     */
    @PostMapping
    public ResponseEntity<?> crearPromocion(@RequestBody Promocion promocion) {
        try {
            Promocion nuevaPromocion = promocionRepository.save(promocion);
            return ResponseEntity.ok(nuevaPromocion);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear promoción: " + e.getMessage());
        }
    }
    
    /**
     * Actualizar promoción
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPromocion(@PathVariable Long id, @RequestBody Promocion promocionActualizada) {
        try {
            Optional<Promocion> promocionExistente = promocionRepository.findById(id);
            if (promocionExistente.isPresent()) {
                Promocion promocion = promocionExistente.get();
                promocion.setDescripcion(promocionActualizada.getDescripcion());
                promocion.setValorDescuento(promocionActualizada.getValorDescuento());
                promocion.setPorcentajeDescuento(promocionActualizada.getPorcentajeDescuento());
                promocion.setActivo(promocionActualizada.getActivo());
                Promocion promocionActual = promocionRepository.save(promocion);
                return ResponseEntity.ok(promocionActual);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar promoción: " + e.getMessage());
        }
    }
    
    /**
     * Validar código de promoción
     */
    @GetMapping("/validar/{codigo}")
    public ResponseEntity<?> validarPromocion(@PathVariable String codigo) {
        try {
            Optional<Promocion> promocion = promocionRepository.findByCodigo(codigo);
            if (promocion.isPresent()) {
                Promocion p = promocion.get();
                LocalDate hoy = LocalDate.now();
                if (p.getActivo() && hoy.isAfter(p.getFechaInicio()) && hoy.isBefore(p.getFechaFin())) {
                    if (p.getUsosLimitados() == null || p.getUsosActuales() < p.getUsosLimitados()) {
                        return ResponseEntity.ok(p);
                    } else {
                        return ResponseEntity.badRequest().body("Promoción agotada");
                    }
                } else {
                    return ResponseEntity.badRequest().body("Promoción no vigente");
                }
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al validar promoción: " + e.getMessage());
        }
    }
}
