package com.hotelsebasitian.repository;

import com.hotelsebasitian.entity.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findByUsuarioId(Long usuarioId);

    /**
     * Pasa la reserva a CONFIRMADA solo si sigue PENDIENTE, en una sola
     * instrucción. Devuelve 1 únicamente a quien la confirma de verdad: así,
     * si el webhook de Wompi y la verificación del navegador llegan a la vez,
     * solo uno envía el correo de confirmación.
     */
    @Modifying
    @Transactional
    @Query("UPDATE Reserva r SET r.estado = 'CONFIRMADA', r.fechaModificacion = :ahora WHERE r.id = :id AND r.estado = 'PENDIENTE'")
    int confirmarSiPendiente(@Param("id") Long id, @Param("ahora") java.time.LocalDateTime ahora);
    List<Reserva> findByHabitacionId(Long habitacionId);
    List<Reserva> findByEstado(String estado);
    List<Reserva> findByFechaIngresoBetween(LocalDate inicio, LocalDate fin);

    // ── Queries de disponibilidad ─────────────────────────────────────────────

    /**
     * Reservas activas (no canceladas) cuyas fechas se solapan con el rango dado.
     * Solapamiento: entrada < fechaSalida AND salida > fechaIngreso.
     * Las reservas de pasadía se guardan sin fechaSalida (ocupan un solo día,
     * el de fechaIngreso); se tratan aparte porque "fechaSalida > :fechaIngreso"
     * da NULL/false en SQL para esas filas y las dejaría fuera del resultado,
     * permitiendo reservas dobles sobre ese día.
     */
    @Query("""
        SELECT r FROM Reserva r
        WHERE r.estado NOT IN ('CANCELADA')
          AND r.fechaIngreso < :fechaSalida
          AND (
               (r.fechaSalida IS NOT NULL AND r.fechaSalida > :fechaIngreso)
            OR (r.fechaSalida IS NULL AND r.fechaIngreso >= :fechaIngreso)
          )
        """)
    List<Reserva> findReservasEnRango(
        @Param("fechaIngreso") LocalDate fechaIngreso,
        @Param("fechaSalida")  LocalDate fechaSalida
    );
}
