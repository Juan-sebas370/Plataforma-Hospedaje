package com.hotelsebasitian.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Tarifa POR PERSONA de un tipo de reserva (individual, familiar, pasadia,
 * grupal) en cada temporada. Se edita desde SOGO y la usan la web y este
 * backend para calcular el precio. Tabla compartida: ver SOGO/database/19_tarifas.sql.
 */
@Entity
@Table(name = "tarifas_reserva")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TarifaReserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipo_reserva", nullable = false, unique = true, length = 20)
    private String tipoReserva;

    @Column(nullable = false, length = 60)
    private String nombre;

    @Column(name = "precio_baja", nullable = false)
    private Double precioBaja;

    @Column(name = "precio_media", nullable = false)
    private Double precioMedia;

    @Column(name = "precio_alta", nullable = false)
    private Double precioAlta;

    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;

    public double precioEn(String temporada) {
        return switch (temporada) {
            case "alta" -> precioAlta;
            case "media" -> precioMedia;
            default -> precioBaja;
        };
    }
}
