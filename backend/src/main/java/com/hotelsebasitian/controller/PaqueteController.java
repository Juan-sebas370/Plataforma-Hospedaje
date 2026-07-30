package com.hotelsebasitian.controller;

import com.hotelsebasitian.entity.Paquete;
import com.hotelsebasitian.repository.PaqueteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/paquetes")
@CrossOrigin(origins = "http://localhost:4200")
public class PaqueteController {
    
    @Autowired
    private PaqueteRepository paqueteRepository;
    
    /**
     * Obtener todos los paquetes disponibles
     */
    @GetMapping
    public ResponseEntity<?> obtenerPaquetesDisponibles() {
        try {
            List<Paquete> paquetes = paqueteRepository.findByDisponibleTrue();
            return ResponseEntity.ok(paquetes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al obtener paquetes: " + e.getMessage());
        }
    }
    
    /**
     * Obtener paquete por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPaqueteById(@PathVariable Long id) {
        try {
            Optional<Paquete> paquete = paqueteRepository.findById(id);
            if (paquete.isPresent()) {
                return ResponseEntity.ok(paquete.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al obtener paquete: " + e.getMessage());
        }
    }
    
    /**
     * Obtener paquetes por tipo
     */
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<?> obtenerPaquetesPorTipo(@PathVariable String tipo) {
        try {
            List<Paquete> paquetes = paqueteRepository.findByTipo(tipo);
            return ResponseEntity.ok(paquetes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al obtener paquetes: " + e.getMessage());
        }
    }
    
    /**
     * Crear nuevo paquete (ADMIN)
     */
    @PostMapping
    public ResponseEntity<?> crearPaquete(@RequestBody Paquete paquete) {
        try {
            Paquete nuevoPaquete = paqueteRepository.save(paquete);
            return ResponseEntity.ok(nuevoPaquete);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear paquete: " + e.getMessage());
        }
    }
    
    /**
     * Actualizar paquete (ADMIN)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPaquete(@PathVariable Long id, @RequestBody Paquete paqueteActualizado) {
        try {
            Optional<Paquete> paqueteExistente = paqueteRepository.findById(id);
            if (paqueteExistente.isPresent()) {
                Paquete paquete = paqueteExistente.get();
                paquete.setNombre(paqueteActualizado.getNombre());
                paquete.setDescripcion(paqueteActualizado.getDescripcion());
                paquete.setPrecioTotal(paqueteActualizado.getPrecioTotal());
                paquete.setDisponible(paqueteActualizado.getDisponible());
                Paquete paqueteActual = paqueteRepository.save(paquete);
                return ResponseEntity.ok(paqueteActual);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar paquete: " + e.getMessage());
        }
    }
    
    /**
     * Eliminar paquete (ADMIN)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarPaquete(@PathVariable Long id) {
        try {
            if (paqueteRepository.existsById(id)) {
                paqueteRepository.deleteById(id);
                return ResponseEntity.ok("Paquete eliminado");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar paquete: " + e.getMessage());
        }
    }
}
