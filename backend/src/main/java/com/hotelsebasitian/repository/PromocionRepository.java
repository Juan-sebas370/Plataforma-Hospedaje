package com.hotelsebasitian.repository;

import com.hotelsebasitian.entity.Promocion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromocionRepository extends JpaRepository<Promocion, Long> {
    Optional<Promocion> findByCodigo(String codigo);
    List<Promocion> findByActivoTrue();
    List<Promocion> findByFechaInicioBeforeAndFechaFinAfter(LocalDate inicio, LocalDate fin);
}
