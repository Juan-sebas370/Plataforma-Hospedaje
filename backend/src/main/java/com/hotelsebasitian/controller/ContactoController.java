package com.hotelsebasitian.controller;

import com.hotelsebasitian.entity.Contacto;
import com.hotelsebasitian.repository.ContactoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/contactos")
@CrossOrigin(origins = "http://localhost:4200")
public class ContactoController {
    
    @Autowired
    private ContactoRepository contactoRepository;
    
    /**
     * Obtener todos los contactos
     */
    @GetMapping
    public ResponseEntity<?> obtenerTodosContactos() {
        try {
            List<Contacto> contactos = contactoRepository.findAll();
            return ResponseEntity.ok(contactos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al obtener contactos: " + e.getMessage());
        }
    }
    
    /**
     * Obtener contacto por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerContactoById(@PathVariable Long id) {
        try {
            Optional<Contacto> contacto = contactoRepository.findById(id);
            if (contacto.isPresent()) {
                return ResponseEntity.ok(contacto.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al obtener contacto: " + e.getMessage());
        }
    }
    
    /**
     * Crear nuevo mensaje de contacto
     */
    @PostMapping
    public ResponseEntity<?> crearContacto(@RequestBody Contacto contacto) {
        try {
            contacto.setFechaCreacion(LocalDateTime.now());
            contacto.setEstado("nuevo");
            Contacto nuevoContacto = contactoRepository.save(contacto);
            return ResponseEntity.ok(nuevoContacto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear contacto: " + e.getMessage());
        }
    }
    
    /**
     * Actualizar estado de contacto
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarContacto(@PathVariable Long id, @RequestBody Contacto contactoActualizado) {
        try {
            Optional<Contacto> contactoExistente = contactoRepository.findById(id);
            if (contactoExistente.isPresent()) {
                Contacto contacto = contactoExistente.get();
                contacto.setEstado(contactoActualizado.getEstado());
                contacto.setPrioridad(contactoActualizado.getPrioridad());
                contacto.setFechaModificacion(LocalDateTime.now());
                Contacto contactoActual = contactoRepository.save(contacto);
                return ResponseEntity.ok(contactoActual);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar contacto: " + e.getMessage());
        }
    }
    
    /**
     * Responder mensaje de contacto (ADMIN)
     */
    @PutMapping("/{id}/responder")
    public ResponseEntity<?> responderContacto(@PathVariable Long id, @RequestBody Map<String, Object> datos) {
        try {
            Optional<Contacto> contactoExistente = contactoRepository.findById(id);
            if (contactoExistente.isPresent()) {
                Contacto contacto = contactoExistente.get();
                contacto.setRespuesta((String) datos.get("respuesta"));
                contacto.setEstado("respondido");
                contacto.setFechaRespuesta(LocalDateTime.now());
                Contacto contactoActual = contactoRepository.save(contacto);
                return ResponseEntity.ok(contactoActual);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al responder contacto: " + e.getMessage());
        }
    }
    
    /**
     * Obtener contactos por estado
     */
    @GetMapping("/estado/{estado}")
    public ResponseEntity<?> obtenerContactosPorEstado(@PathVariable String estado) {
        try {
            List<Contacto> contactos = contactoRepository.findByEstado(estado);
            return ResponseEntity.ok(contactos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al obtener contactos: " + e.getMessage());
        }
    }
    
    /**
     * Obtener contactos por prioridad
     */
    @GetMapping("/prioridad/{prioridad}")
    public ResponseEntity<?> obtenerContactosPorPrioridad(@PathVariable String prioridad) {
        try {
            List<Contacto> contactos = contactoRepository.findByPrioridad(prioridad);
            return ResponseEntity.ok(contactos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al obtener contactos: " + e.getMessage());
        }
    }
}
