package com.hotelsebasitian.controller;

import com.hotelsebasitian.entity.Pago;
import com.hotelsebasitian.repository.PagoRepository;
import com.hotelsebasitian.repository.ReservaRepository;
import com.hotelsebasitian.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pagos")
@CrossOrigin(origins = "http://localhost:4200")
public class PagoController {
    
    @Autowired
    private PagoRepository pagoRepository;
    
    @Autowired
    private ReservaRepository reservaRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    /**
     * Obtener todos los pagos
     */
    @GetMapping
    public ResponseEntity<?> obtenerTodosPagos() {
        try {
            List<Pago> pagos = pagoRepository.findAll();
            return ResponseEntity.ok(pagos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al obtener pagos: " + e.getMessage());
        }
    }
    
    /**
     * Obtener pago por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPagoById(@PathVariable Long id) {
        try {
            Optional<Pago> pago = pagoRepository.findById(id);
            if (pago.isPresent()) {
                return ResponseEntity.ok(pago.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al obtener pago: " + e.getMessage());
        }
    }
    
    /**
     * Crear nuevo pago
     */
    @PostMapping
    public ResponseEntity<?> crearPago(@RequestBody Pago pago) {
        try {
            Pago nuevoPago = pagoRepository.save(pago);
            return ResponseEntity.ok(nuevoPago);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear pago: " + e.getMessage());
        }
    }
    
    /**
     * Actualizar pago
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPago(@PathVariable Long id, @RequestBody Pago pagoActualizado) {
        try {
            Optional<Pago> pagoExistente = pagoRepository.findById(id);
            if (pagoExistente.isPresent()) {
                Pago pago = pagoExistente.get();
                pago.setEstado(pagoActualizado.getEstado());
                pago.setNumeroTransaccion(pagoActualizado.getNumeroTransaccion());
                pago.setReferenciaBanco(pagoActualizado.getReferenciaBanco());
                pago.setFechaPago(pagoActualizado.getFechaPago());
                Pago pagoActual = pagoRepository.save(pago);
                return ResponseEntity.ok(pagoActual);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar pago: " + e.getMessage());
        }
    }
    
    /**
     * Obtener pagos de una reserva
     */
    @GetMapping("/reserva/{reservaId}")
    public ResponseEntity<?> obtenerPagosPorReserva(@PathVariable Long reservaId) {
        try {
            return reservaRepository.findById(reservaId).map(reserva -> {
                List<Pago> pagos = pagoRepository.findByReserva(reserva);
                return ResponseEntity.ok(pagos);
            }).orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al obtener pagos: " + e.getMessage());
        }
    }
    
    /**
     * Obtener pagos por estado
     */
    @GetMapping("/estado/{estado}")
    public ResponseEntity<?> obtenerPagosPorEstado(@PathVariable String estado) {
        try {
            List<Pago> pagos = pagoRepository.findByEstado(estado);
            return ResponseEntity.ok(pagos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al obtener pagos: " + e.getMessage());
        }
    }
}
