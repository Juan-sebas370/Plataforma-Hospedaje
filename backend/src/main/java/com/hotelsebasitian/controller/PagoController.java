package com.hotelsebasitian.controller;

import com.hotelsebasitian.entity.Pago;
import com.hotelsebasitian.entity.Reserva;
import com.hotelsebasitian.repository.PagoRepository;
import com.hotelsebasitian.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * Pagos (solo administración; ver SecurityConfig). Los pagos de Wompi los
 * registra PagoWompiService; aquí se consultan y se registran pagos manuales.
 * Los estados son los mismos que usa SOGO.
 */
@RestController
@RequestMapping("/pagos")
@RequiredArgsConstructor
public class PagoController {

    private static final Set<String> ESTADOS = Set.of("pendiente", "aprobado", "rechazado", "anulado", "error", "reembolsado");

    private final PagoRepository pagoRepository;
    private final ReservaRepository reservaRepository;

    @GetMapping
    public List<Pago> obtenerTodosPagos() {
        return pagoRepository.findAll();
    }

    @GetMapping("/{id}")
    public Pago obtenerPagoById(@PathVariable Long id) {
        return buscar(id);
    }

    /** Registra un pago manual (efectivo, transferencia…) de una reserva existente. */
    @PostMapping
    public ResponseEntity<Pago> crearPago(@RequestBody Pago datos) {
        Long reservaId = datos.getReserva() == null ? null : datos.getReserva().getId();
        if (reservaId == null) {
            throw new RuntimeException("Indica la reserva del pago");
        }
        Reserva reserva = reservaId == null ? null : reservaRepository.findById(reservaId).orElse(null);
        if (reserva == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada");

        Pago pago = new Pago();   // id nuevo: nunca se sobrescribe un pago existente
        pago.setReserva(reserva);
        pago.setMonto(datos.getMonto());
        pago.setEstado(datos.getEstado() == null ? "pendiente" : datos.getEstado());
        pago.setNumeroTransaccion(datos.getNumeroTransaccion());
        pago.setReferenciaBanco(datos.getReferenciaBanco());
        pago.setFechaPago(datos.getFechaPago() == null ? LocalDateTime.now() : datos.getFechaPago());
        validar(pago);
        return ResponseEntity.status(HttpStatus.CREATED).body(pagoRepository.save(pago));
    }

    /** Actualización parcial: solo cambia los campos que se envían. */
    @PutMapping("/{id}")
    public Pago actualizarPago(@PathVariable Long id, @RequestBody Pago cambios) {
        Pago pago = buscar(id);
        if (cambios.getEstado() != null)            pago.setEstado(cambios.getEstado());
        if (cambios.getNumeroTransaccion() != null) pago.setNumeroTransaccion(cambios.getNumeroTransaccion());
        if (cambios.getReferenciaBanco() != null)   pago.setReferenciaBanco(cambios.getReferenciaBanco());
        if (cambios.getFechaPago() != null)         pago.setFechaPago(cambios.getFechaPago());
        if (cambios.getMonto() != null)             pago.setMonto(cambios.getMonto());
        validar(pago);
        pago.setFechaModificacion(LocalDateTime.now());
        return pagoRepository.save(pago);
    }

    @GetMapping("/reserva/{reservaId}")
    public List<Pago> obtenerPagosPorReserva(@PathVariable Long reservaId) {
        Reserva reserva = reservaId == null ? null : reservaRepository.findById(reservaId).orElse(null);
        if (reserva == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada");
        return pagoRepository.findByReserva(reserva);
    }

    @GetMapping("/estado/{estado}")
    public List<Pago> obtenerPagosPorEstado(@PathVariable String estado) {
        return pagoRepository.findByEstado(estado);
    }

    private @NonNull Pago buscar(Long id) {
        Pago pago = id == null ? null : pagoRepository.findById(id).orElse(null);
        if (pago == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pago no encontrado");
        return pago;
    }

    private static void validar(Pago pago) {
        if (pago.getMonto() == null || pago.getMonto().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("El monto del pago debe ser mayor que cero");
        }
        if (!ESTADOS.contains(pago.getEstado())) {
            throw new RuntimeException("Estado de pago no válido. Usa uno de: " + String.join(", ", ESTADOS));
        }
    }
}
