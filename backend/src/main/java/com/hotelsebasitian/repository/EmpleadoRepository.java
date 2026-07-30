package com.hotelsebasitian.repository;

import com.hotelsebasitian.entity.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {
    Optional<Empleado> findByEmail(String email);
    Optional<Empleado> findByNumeroEmpleado(String numeroEmpleado);
    List<Empleado> findByActivoTrue();
    List<Empleado> findByCargo(String cargo);
    List<Empleado> findByDepartamento(String departamento);
}
