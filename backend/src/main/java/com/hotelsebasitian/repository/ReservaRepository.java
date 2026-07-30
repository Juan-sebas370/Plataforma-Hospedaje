package com.hotelsebasitian.repository;

import com.hotelsebasitian.entity.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    List<Reserva> findByUsuarioId(Long usuarioId);
    List<Reserva> findByHabitacionId(Long habitacionId);
    List<Reserva> findByEstado(String estado);
    List<Reserva> findByFechaIngresoBetween(LocalDate inicio, LocalDate fin);
}
