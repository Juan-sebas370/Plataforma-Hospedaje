package com.hotelsebasitian.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotelsebasitian.entity.Promocion;
import com.hotelsebasitian.repository.PromocionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Códigos de descuento. Solo /validar/{codigo} es público (quien ya conoce
 * un código puede comprobarlo); listar, ver el detalle, crear y editar es de
 * administración (ver SecurityConfig).
 */
@RestController
@RequestMapping("/promociones")
@RequiredArgsConstructor
public class PromocionController {

    private static final ZoneId ZONA_HOTEL = ZoneId.of("America/Bogota");

    private final PromocionRepository promocionRepository;
    private final ObjectMapper json;

    @GetMapping
    public List<Promocion> obtenerPromocionesActivas() {
        return promocionRepository.findByActivoTrue();
    }

    @GetMapping("/codigo/{codigo}")
    public Promocion obtenerPromocionPorCodigo(@PathVariable String codigo) {
        return promocionRepository.findByCodigo(normalizar(codigo))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Código no encontrado"));
    }

    @PostMapping
    public ResponseEntity<Promocion> crearPromocion(@RequestBody Promocion promocion) {
        promocion.setId(null);   // nunca se sobrescribe una promoción existente
        promocion.setUsosActuales(0);
        promocion.setFechaCreacion(LocalDateTime.now());
        validar(promocion);
        return ResponseEntity.status(HttpStatus.CREATED).body(promocionRepository.save(promocion));
    }

    /** Actualización parcial: solo cambian los campos que vienen en el cuerpo. */
    @PutMapping("/{id}")
    public Promocion actualizarPromocion(@PathVariable Long id, @RequestBody JsonNode cambios) throws IOException {
        Promocion promocion = id == null ? null : promocionRepository.findById(id).orElse(null);
        if (promocion == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Promoción no encontrada");
        LocalDateTime creada = promocion.getFechaCreacion();
        Integer usos = promocion.getUsosActuales();
        json.readerForUpdating(promocion).readValue(cambios);
        promocion.setId(id);
        promocion.setFechaCreacion(creada);
        promocion.setUsosActuales(usos);
        promocion.setFechaModificacion(LocalDateTime.now());
        validar(promocion);
        return promocionRepository.save(promocion);
    }

    /**
     * Comprueba un código. Vigente desde fechaInicio hasta fechaFin, ambos
     * días incluidos (fechas de Colombia). Solo devuelve lo que el huésped
     * necesita saber del descuento.
     */
    @GetMapping("/validar/{codigo}")
    public Map<String, Object> validarPromocion(@PathVariable String codigo) {
        Promocion p = promocionRepository.findByCodigo(normalizar(codigo))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Código no encontrado"));
        LocalDate hoy = LocalDate.now(ZONA_HOTEL);
        boolean vigente = Boolean.TRUE.equals(p.getActivo())
                && p.getFechaInicio() != null && p.getFechaFin() != null
                && !hoy.isBefore(p.getFechaInicio()) && !hoy.isAfter(p.getFechaFin());
        if (!vigente) {
            throw new RuntimeException("Promoción no vigente");
        }
        int usados = p.getUsosActuales() == null ? 0 : p.getUsosActuales();
        if (p.getUsosLimitados() != null && usados >= p.getUsosLimitados()) {
            throw new RuntimeException("Promoción agotada");
        }
        Map<String, Object> respuesta = new LinkedHashMap<>();
        respuesta.put("codigo", p.getCodigo());
        respuesta.put("descripcion", p.getDescripcion());
        respuesta.put("tipoDescuento", p.getTipoDescuento());
        respuesta.put("valorDescuento", p.getValorDescuento());
        respuesta.put("porcentajeDescuento", p.getPorcentajeDescuento());
        respuesta.put("minimoReserva", p.getMinimoReserva());
        respuesta.put("fechaFin", p.getFechaFin());
        return respuesta;
    }

    private void validar(Promocion p) {
        if (p.getCodigo() == null || p.getCodigo().isBlank()) throw new RuntimeException("Escribe el código de la promoción");
        p.setCodigo(normalizar(p.getCodigo()));
        if (p.getCodigo().length() > 50) throw new RuntimeException("El código puede tener máximo 50 caracteres");
        promocionRepository.findByCodigo(p.getCodigo())
                .filter(otra -> !otra.getId().equals(p.getId()))
                .ifPresent(otra -> { throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una promoción con el código " + p.getCodigo()); });
        if (p.getTipoDescuento() != null && !List.of("porcentaje", "fijo").contains(p.getTipoDescuento())) {
            throw new RuntimeException("El tipo de descuento debe ser porcentaje o fijo");
        }
        if (p.getValorDescuento() == null || p.getValorDescuento().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("El valor del descuento es obligatorio y no puede ser negativo");
        }
        if (p.getPorcentajeDescuento() != null && (p.getPorcentajeDescuento() < 0 || p.getPorcentajeDescuento() > 100)) {
            throw new RuntimeException("El porcentaje de descuento debe estar entre 0 y 100");
        }
        if (p.getMinimoReserva() != null && p.getMinimoReserva().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("El mínimo de reserva no puede ser negativo");
        }
        if (p.getFechaInicio() == null || p.getFechaFin() == null) throw new RuntimeException("Indica las fechas de inicio y fin");
        if (p.getFechaFin().isBefore(p.getFechaInicio())) throw new RuntimeException("La fecha de fin no puede ser anterior a la de inicio");
        if (p.getUsosLimitados() != null && p.getUsosLimitados() < 0) throw new RuntimeException("El límite de usos no puede ser negativo");
    }

    /** Los códigos se guardan y buscan sin espacios y en mayúsculas. */
    private static String normalizar(String codigo) {
        return codigo == null ? null : codigo.trim().toUpperCase(Locale.ROOT);
    }
}
