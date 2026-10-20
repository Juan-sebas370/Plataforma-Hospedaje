package com.hotelsebasitian.repository;

import com.hotelsebasitian.entity.TarifaReserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TarifaReservaRepository extends JpaRepository<TarifaReserva, Long> {
    Optional<TarifaReserva> findByTipoReserva(String tipoReserva);
}
