package com.hotelsebasitian.controller;

import com.hotelsebasitian.dto.WompiCheckoutResponse;
import com.hotelsebasitian.entity.Reserva;
import com.hotelsebasitian.service.PagoWompiService;
import com.hotelsebasitian.service.ReservaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;
    private final PagoWompiService pagoWompiService;

    /**
     * GET /api/reservas/disponibilidad?fechaIngreso=2026-09-10&fechaSalida=2026-09-12
     * Devuelve qué habitaciones y espacios están ocupados en el rango dado.
     * Endpoint público — no requiere autenticación.
     */
    @GetMapping("/disponibilidad")
    public ResponseEntity<Map<String, Object>> verificarDisponibilidad(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaIngreso,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaSalida) {
        return ResponseEntity.ok(reservaService.verificarDisponibilidad(fechaIngreso, fechaSalida));
    }

    /** GET /api/reservas */
    @GetMapping
    public ResponseEntity<List<Reserva>> obtenerTodas() {
        return ResponseEntity.ok(reservaService.obtenerTodas());
    }

    /**
     * GET /api/reservas/{id}?codigo=...
     * Público para el huésped sin cuenta, pero exige el código de acceso que
     * recibió al crear la reserva (o ser el dueño / un administrador).
     */
    @GetMapping("/{id}")
    public ResponseEntity<Reserva> obtenerPorId(@PathVariable Long id, @RequestParam(required = false) String codigo) {
        return ResponseEntity.ok(conAcceso(id, codigo));
    }

    /**
     * GET /api/reservas/{id}/checkout-wompi
     * Devuelve los datos firmados que el frontend necesita para abrir el
     * Widget de Checkout de Wompi. Público — el huésped paga sin cuenta,
     * igual que crea la reserva.
     */
    @GetMapping("/{id}/checkout-wompi")
    public ResponseEntity<WompiCheckoutResponse> generarCheckoutWompi(
            @PathVariable Long id, @RequestParam(required = false) String codigo) {
        conAcceso(id, codigo);
        return ResponseEntity.ok(reservaService.generarCheckoutWompi(id));
    }

    /**
     * POST /api/reservas/{id}/verificar-pago-wompi  body: {"transaccionId": "...", "codigo": "..."}
     * Consulta a Wompi el estado real de la transacción que devolvió el widget
     * y, si está aprobada, registra el pago y confirma la reserva. Público,
     * igual que el checkout: la fuente de verdad es la API de Wompi, no el body.
     */
    @PostMapping("/{id}/verificar-pago-wompi")
    public ResponseEntity<Map<String, String>> verificarPagoWompi(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        conAcceso(id, body.get("codigo"));
        String estado = pagoWompiService.verificarTransaccion(id, body.get("transaccionId"));
        return ResponseEntity.ok(Map.of("estado", estado));
    }

    /**
     * GET /api/reservas/usuario/{usuarioId}
     * Solo el propio usuario autenticado o un administrador pueden consultar
     * estas reservas.
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Reserva>> obtenerPorUsuario(@PathVariable Long usuarioId) {
        if (!esAdmin() && !usuarioId.equals(usuarioActual())) {
            throw new AccessDeniedException("No puedes consultar reservas de otro usuario");
        }

        return ResponseEntity.ok(reservaService.obtenerPorUsuario(usuarioId));
    }

    /**
     * POST /api/reservas
     * Crea una reserva nueva desde el wizard del frontend.
     * El body incluye tipoReserva, modoEspacio, espacio,
     * habitacionesIds[], fechaIngreso, fechaSalida, datos del huésped, etc.
     * La respuesta incluye codigoAcceso, que la web pasa a /pagos y /confirmacion.
     */
    @PostMapping
    public ResponseEntity<Reserva> crear(@RequestBody Reserva reserva) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservaService.crear(reserva, usuarioActual()));
    }

    /** PUT /api/reservas/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<Reserva> actualizar(
            @PathVariable Long id,
            @RequestBody Reserva reserva) {
        return ResponseEntity.ok(reservaService.actualizar(id, reserva));
    }

    /** PUT /api/reservas/{id}/cancelar */
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Reserva> cancelar(@PathVariable Long id) {
        return ResponseEntity.ok(reservaService.cancelar(id));
    }

    /** DELETE /api/reservas/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        reservaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    private Reserva conAcceso(Long id, String codigo) {
        return reservaService.obtenerConAcceso(id, codigo, esAdmin(), usuarioActual());
    }

    private static boolean esAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }

    /** Id del usuario con sesión (el filtro JWT pone el id como nombre), o null si es anónimo. */
    private static Long usuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth instanceof AnonymousAuthenticationToken || !auth.isAuthenticated()) return null;
        try {
            return Long.valueOf(auth.getName());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
