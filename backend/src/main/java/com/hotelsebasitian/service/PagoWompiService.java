package com.hotelsebasitian.service;

import com.hotelsebasitian.entity.Pago;
import com.hotelsebasitian.entity.Reserva;
import com.hotelsebasitian.repository.PagoRepository;
import com.hotelsebasitian.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.locks.ReentrantLock;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Procesa los eventos/webhooks que envía Wompi cuando cambia el estado de
 * una transacción. Ver WompiService para la verificación criptográfica del
 * checksum.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PagoWompiService {

    private static final Pattern REFERENCIA_PATTERN = Pattern.compile("^HS-(\\d+)-.*$");
    /** Estados de Wompi que ya no cambian a "pendiente". */
    private static final Set<String> ESTADOS_FINALES = Set.of("aprobado", "rechazado", "anulado", "error");

    private final WompiService wompiService;
    private final ReservaRepository reservaRepository;
    private final PagoRepository pagoRepository;
    private final CorreoReservaService correoReserva;

    /**
     * El webhook de Wompi y la verificación desde el navegador suelen llegar al
     * mismo tiempo para la misma transacción. Sin este lock ambos ven "no hay
     * pago registrado" y lo crean dos veces. Los guardados ocurren dentro del
     * lock (sin @Transactional envolvente) para que el siguiente ya los vea.
     */
    private final ReentrantLock lock = new ReentrantLock();

    /**
     * @return true si el evento se procesó (o ya se había procesado antes);
     *         false si la firma no es válida y el evento debe rechazarse.
     */
    @SuppressWarnings("unchecked")
    public boolean procesarEvento(Map<String, Object> payload) {
        if (!wompiService.verificarChecksumEvento(payload)) {
            return false;
        }

        Object data = payload.get("data");
        if (!(data instanceof Map)) return true;
        Object transactionObj = ((Map<String, Object>) data).get("transaction");
        if (!(transactionObj instanceof Map)) return true;
        Map<String, Object> transaction = (Map<String, Object>) transactionObj;

        Long reservaId = reservaDeReferencia(transaction);
        if (reservaId == null) return true;
        Reserva reserva = reservaRepository.findById(reservaId).orElse(null);
        if (reserva == null) {
            log.warn("Evento de Wompi para la reserva {} que no existe (transacción {})", reservaId, transaction.get("id"));
            return true;
        }

        registrarTransaccion(reserva, transaction);
        return true;
    }

    /**
     * Verificación activa del pago: el frontend manda el id de transacción que
     * le entregó el widget, y el estado real se consulta directo a Wompi (no se
     * confía en lo que diga el navegador). Sirve cuando el webhook no llega,
     * por ejemplo en desarrollo local, donde Wompi no puede alcanzar localhost.
     *
     * @return el estado de la transacción según Wompi (APPROVED, DECLINED, PENDING...)
     */
    public String verificarTransaccion(Long reservaId, String transaccionId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        Map<String, Object> transaction = wompiService.consultarTransaccion(transaccionId);

        // La transacción tiene que ser de ESTA reserva: evita que se use el id
        // de un pago ajeno (o de otra reserva más barata) para confirmarla.
        if (!reservaId.equals(reservaDeReferencia(transaction))) {
            throw new RuntimeException("La transacción no corresponde a esta reserva");
        }
        if (!montoCoincide(reserva, transaction)) {
            throw new RuntimeException("El monto de la transacción no coincide con el de la reserva");
        }

        registrarTransaccion(reserva, transaction);
        return String.valueOf(transaction.get("status"));
    }

    /**
     * Guarda (o actualiza) el pago de una transacción de Wompi y confirma la
     * reserva si quedó aprobada. Idempotente: Wompi puede reintentar el mismo
     * evento y el frontend puede verificar varias veces.
     *
     * Reglas:
     *  - un pago en estado final no vuelve a "pendiente" (eventos que llegan en desorden);
     *  - solo se confirma una reserva PENDIENTE y si el monto pagado es el total;
     *    si estaba cancelada, el pago queda registrado para que el hotel lo devuelva.
     */
    private void registrarTransaccion(Reserva reserva, Map<String, Object> transaction) {
        String transaccionId = String.valueOf(transaction.get("id"));
        String estadoWompi = String.valueOf(transaction.get("status"));
        String estadoNuevo = mapearEstado(estadoWompi);

        lock.lock();
        try {
            List<Pago> existentes = pagoRepository.findByNumeroTransaccion(transaccionId);
            Pago pago;
            if (existentes.isEmpty()) {
                pago = new Pago();
                pago.setReserva(reserva);
                pago.setMonto(montoEnPesos(transaction));
                pago.setNumeroTransaccion(transaccionId);
                pago.setReferenciaBanco(String.valueOf(transaction.get("reference")));
                pago.setFechaPago(LocalDateTime.now());
                pago.setEstado(estadoNuevo);
            } else {
                pago = existentes.get(0);
                if ("pendiente".equals(estadoNuevo) && ESTADOS_FINALES.contains(pago.getEstado())) {
                    log.info("Se ignora el estado PENDING tardío de la transacción {} (ya estaba {})", transaccionId, pago.getEstado());
                } else {
                    pago.setEstado(estadoNuevo);
                }
                pago.setFechaModificacion(LocalDateTime.now());
            }
            pagoRepository.save(pago);

            if ("APPROVED".equals(estadoWompi) && !"CONFIRMADA".equals(reserva.getEstado())) {
                if (!"PENDIENTE".equals(reserva.getEstado())) {
                    log.warn("Pago aprobado {} para la reserva {} en estado {}: no se confirma; revisar devolución",
                            transaccionId, reserva.getId(), reserva.getEstado());
                } else if (!montoCoincide(reserva, transaction)) {
                    log.warn("Pago aprobado {} para la reserva {} por un monto distinto al total: no se confirma",
                            transaccionId, reserva.getId());
                } else if (reservaRepository.confirmarSiPendiente(reserva.getId(), LocalDateTime.now()) == 1) {
                    reserva.setEstado("CONFIRMADA");
                    avisarConfirmacion(reserva);
                }
            }
        } finally {
            lock.unlock();
        }
    }

    private void avisarConfirmacion(Reserva reserva) {
        try {
            correoReserva.reservaConfirmada(reserva);
        } catch (RuntimeException e) {
            log.error("No se pudo preparar el correo de confirmación de la reserva {}", reserva.getId(), e);
        }
    }

    private static Long reservaDeReferencia(Map<String, Object> transaction) {
        Matcher m = REFERENCIA_PATTERN.matcher(String.valueOf(transaction.get("reference")));
        if (!m.matches()) return null;
        try {
            return Long.parseLong(m.group(1));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static boolean montoCoincide(Reserva reserva, Map<String, Object> transaction) {
        long montoEsperado = Math.round((reserva.getPrecioTotal() == null ? 0 : reserva.getPrecioTotal()) * 100);
        return String.valueOf(montoEsperado).equals(String.valueOf(transaction.get("amount_in_cents")));
    }

    private static BigDecimal montoEnPesos(Map<String, Object> transaction) {
        Object montoObj = transaction.get("amount_in_cents");
        try {
            return montoObj == null ? BigDecimal.ZERO
                    : BigDecimal.valueOf(Long.parseLong(String.valueOf(montoObj))).movePointLeft(2);
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }

    private String mapearEstado(String estadoWompi) {
        if (estadoWompi == null) return "pendiente";
        return switch (estadoWompi) {
            case "APPROVED" -> "aprobado";
            case "DECLINED" -> "rechazado";
            case "VOIDED" -> "anulado";
            case "ERROR" -> "error";
            default -> "pendiente";
        };
    }
}
