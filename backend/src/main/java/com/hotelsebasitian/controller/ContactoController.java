package com.hotelsebasitian.controller;

import com.hotelsebasitian.entity.Contacto;
import com.hotelsebasitian.repository.ContactoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/contactos")   // context-path /api ya está en application.properties
@RequiredArgsConstructor
public class ContactoController {

    private final ContactoRepository contactoRepository;

    /** GET /api/contactos */
    @GetMapping
    public ResponseEntity<List<Contacto>> obtenerTodos() {
        return ResponseEntity.ok(contactoRepository.findAll());
    }

    /** GET /api/contactos/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        return contactoRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/contactos/estado/{estado} */
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Contacto>> porEstado(@PathVariable String estado) {
        return ResponseEntity.ok(contactoRepository.findByEstado(estado));
    }

    /** GET /api/contactos/prioridad/{prioridad} */
    @GetMapping("/prioridad/{prioridad}")
    public ResponseEntity<List<Contacto>> porPrioridad(@PathVariable String prioridad) {
        return ResponseEntity.ok(contactoRepository.findByPrioridad(prioridad));
    }

    /**
     * POST /api/contactos
     * Recibe el formulario de contacto del frontend.
     * Campos: nombre, email, telefono, asunto, mensaje, categoria
     */
    @PostMapping
    public ResponseEntity<Contacto> crear(@RequestBody Contacto contacto) {
        contacto.setFechaCreacion(LocalDateTime.now());
        contacto.setEstado("nuevo");
        if (contacto.getPrioridad() == null) {
            contacto.setPrioridad("normal");
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(contactoRepository.save(contacto));
    }

    /** PUT /api/contactos/{id} — cambiar estado o prioridad (admin) */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable Long id,
            @RequestBody Contacto datos) {
        return contactoRepository.findById(id).map(c -> {
            if (datos.getEstado()    != null) c.setEstado(datos.getEstado());
            if (datos.getPrioridad() != null) c.setPrioridad(datos.getPrioridad());
            c.setFechaModificacion(LocalDateTime.now());
            return ResponseEntity.ok(contactoRepository.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** PUT /api/contactos/{id}/responder — responder mensaje (admin) */
    @PutMapping("/{id}/responder")
    public ResponseEntity<?> responder(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return contactoRepository.findById(id).map(c -> {
            c.setRespuesta(body.get("respuesta"));
            c.setEstado("respondido");
            c.setFechaRespuesta(LocalDateTime.now());
            c.setFechaModificacion(LocalDateTime.now());
            return ResponseEntity.ok(contactoRepository.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }
}
