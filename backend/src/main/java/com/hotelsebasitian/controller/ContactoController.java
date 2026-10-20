package com.hotelsebasitian.controller;

import com.hotelsebasitian.entity.Contacto;
import com.hotelsebasitian.repository.ContactoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Mensajes del formulario de Contacto. Enviar es público; leer, cambiar y
 * responder es solo de administración (ver SecurityConfig). Los estados y
 * prioridades son los mismos que usa SOGO (MensajeService).
 */
@RestController
@RequestMapping("/contactos")   // context-path /api ya está en application.properties
@RequiredArgsConstructor
public class ContactoController {

    private static final List<String> ESTADOS = List.of("nuevo", "leido", "respondido", "archivado");
    private static final List<String> PRIORIDADES = List.of("baja", "normal", "alta");
    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$");
    private static final int MAX_MENSAJE = 5000;

    private final ContactoRepository contactoRepository;

    /** GET /api/contactos */
    @GetMapping
    public List<Contacto> obtenerTodos() {
        return contactoRepository.findAll();
    }

    /** GET /api/contactos/{id} */
    @GetMapping("/{id}")
    public Contacto obtenerPorId(@PathVariable Long id) {
        return buscar(id);
    }

    /** GET /api/contactos/estado/{estado} */
    @GetMapping("/estado/{estado}")
    public List<Contacto> porEstado(@PathVariable String estado) {
        return contactoRepository.findByEstado(estado);
    }

    /** GET /api/contactos/prioridad/{prioridad} */
    @GetMapping("/prioridad/{prioridad}")
    public List<Contacto> porPrioridad(@PathVariable String prioridad) {
        return contactoRepository.findByPrioridad(prioridad);
    }

    /**
     * POST /api/contactos — formulario de contacto de la web (público).
     * Solo se toman los campos del formulario: nombre, email, telefono,
     * asunto, mensaje y categoria. Id, estado, prioridad, respuesta y usuario
     * los fija el servidor.
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> crear(@RequestBody Contacto datos) {
        Contacto contacto = new Contacto();
        contacto.setNombre(texto(datos.getNombre(), "nombre", 120, true));
        contacto.setEmail(texto(datos.getEmail(), "correo", 120, true));
        if (!EMAIL.matcher(contacto.getEmail()).matches()) {
            throw new RuntimeException("Revisa el correo electrónico");
        }
        contacto.setTelefono(texto(datos.getTelefono(), "teléfono", 30, false));
        contacto.setAsunto(texto(datos.getAsunto(), "asunto", 200, true));
        contacto.setMensaje(texto(datos.getMensaje(), "mensaje", MAX_MENSAJE, true));
        contacto.setCategoria(texto(datos.getCategoria(), "categoría", 50, false));
        contacto.setEstado("nuevo");
        contacto.setPrioridad("normal");
        contacto.setFechaCreacion(LocalDateTime.now());

        Contacto guardado = contactoRepository.save(contacto);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", guardado.getId(),
                "estado", guardado.getEstado(),
                "fechaCreacion", guardado.getFechaCreacion(),
                "mensaje", "Mensaje recibido correctamente"
        ));
    }

    /** PUT /api/contactos/{id} — cambiar estado o prioridad (admin) */
    @PutMapping("/{id}")
    public Contacto actualizar(@PathVariable Long id, @RequestBody Contacto datos) {
        Contacto c = buscar(id);
        if (datos.getEstado() != null) {
            if (!ESTADOS.contains(datos.getEstado())) {
                throw new RuntimeException("Estado no válido. Usa uno de: " + String.join(", ", ESTADOS));
            }
            c.setEstado(datos.getEstado());
        }
        if (datos.getPrioridad() != null) {
            if (!PRIORIDADES.contains(datos.getPrioridad())) {
                throw new RuntimeException("Prioridad no válida. Usa una de: " + String.join(", ", PRIORIDADES));
            }
            c.setPrioridad(datos.getPrioridad());
        }
        c.setFechaModificacion(LocalDateTime.now());
        return contactoRepository.save(c);
    }

    /** PUT /api/contactos/{id}/responder — responder mensaje (admin) */
    @PutMapping("/{id}/responder")
    public Contacto responder(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Contacto c = buscar(id);
        c.setRespuesta(texto(body.get("respuesta"), "respuesta", MAX_MENSAJE, true));
        c.setEstado("respondido");
        c.setFechaRespuesta(LocalDateTime.now());
        c.setFechaModificacion(LocalDateTime.now());
        return contactoRepository.save(c);
    }

    private Contacto buscar(Long id) {
        return contactoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mensaje no encontrado"));
    }

    /** Texto recortado; null si es opcional y viene vacío. */
    private static String texto(String valor, String campo, int maximo, boolean obligatorio) {
        String limpio = valor == null ? "" : valor.trim();
        if (limpio.isEmpty()) {
            if (obligatorio) throw new RuntimeException("Escribe el " + campo);
            return null;
        }
        if (limpio.length() > maximo) {
            throw new RuntimeException("El " + campo + " puede tener máximo " + maximo + " caracteres");
        }
        return limpio;
    }
}
