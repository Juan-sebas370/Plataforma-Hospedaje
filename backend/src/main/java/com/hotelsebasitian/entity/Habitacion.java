package com.hotelsebasitian.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "habitaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Habitacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numero;
    private String tipo;    // SIMPLE, DOBLE, SUITE, etc.
    private Integer piso;   // 1 o 2
    private Integer capacidad;
    /** Tarifa por noche en temporada BAJA (nombre histórico de la columna). Se edita desde SOGO. */
    private Double precioNoche;
    /** Tarifas por noche en temporada media y alta (SOGO/database/19_tarifas.sql). */
    private Double precioMedia;
    private Double precioAlta;
    private String descripcion;

    @ElementCollection
    private List<String> servicios;

    @ElementCollection
    private List<String> imagenes;

    private String estado;        // DISPONIBLE, OCUPADA, MANTENIMIENTO
    private Boolean climatizacion;
    private Boolean television;
    private Boolean wifi;
    private Boolean bano;
    private Boolean minibar;

}
