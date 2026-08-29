package com.hotelsebasitian.repository;

import com.hotelsebasitian.entity.Habitacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HabitacionRepository extends JpaRepository<Habitacion, Long> {
    List<Habitacion> findByEstado(String estado);
    List<Habitacion> findByTipo(String tipo);
    List<Habitacion> findByPiso(Integer piso);
    List<Habitacion> findByPisoAndEstado(Integer piso, String estado);
}
