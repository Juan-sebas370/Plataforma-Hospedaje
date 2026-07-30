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
    private String tipo; // SIMPLE, DOBLE, SUITE, etc.
    private Integer capacidad;
    private Double precioNoche;
    private String descripcion;
    
    @ElementCollection
    private List<String> servicios;
    
    @ElementCollection
    private List<String> imagenes;
    
    private String estado; // DISPONIBLE, OCUPADA, MANTENIMIENTO
    private Boolean climatizacion;
    private Boolean television;
    private Boolean wifi;
    private Boolean bano;
    private Boolean minibar;

}
