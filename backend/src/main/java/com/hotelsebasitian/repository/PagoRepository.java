package com.hotelsebasitian.repository;

import com.hotelsebasitian.entity.Pago;
import com.hotelsebasitian.entity.Reserva;
import com.hotelsebasitian.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByReserva(Reserva reserva);
    List<Pago> findByUsuario(Usuario usuario);
    List<Pago> findByEstado(String estado);
    List<Pago> findByFechaPagoBetween(LocalDateTime inicio, LocalDateTime fin);
    List<Pago> findByNumeroTransaccion(String numeroTransaccion);
}
