package com.hotelsebasitian.repository;

import com.hotelsebasitian.entity.Contacto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactoRepository extends JpaRepository<Contacto, Long> {
    List<Contacto> findByEstado(String estado);
    List<Contacto> findByPrioridad(String prioridad);
    List<Contacto> findByCategoria(String categoria);
    List<Contacto> findByEmail(String email);
}
