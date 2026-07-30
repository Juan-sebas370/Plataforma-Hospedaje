package com.hotelsebasitian.repository;

import com.hotelsebasitian.entity.Paquete;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaqueteRepository extends JpaRepository<Paquete, Long> {
    List<Paquete> findByActivoTrue();
    List<Paquete> findByDisponibleTrue();
    List<Paquete> findByTipo(String tipo);
}
