package com.hotelsebasitian.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long usuarioId;
    private Long habitacionId;
    private LocalDate fechaIngreso;
    private LocalDate fechaSalida;
    private Integer noches;
    private Double precioTotal;
    private Double precioNoche;
    private String estado; // PENDIENTE, CONFIRMADA, CANCELADA, COMPLETADA
    private Integer huespedes;
    private String nombreHuesped;
    private String pais;
    private String tipoDocumento; // CC, CE, TI, PA, NIT, DNI, RG
    private String numeroDocumento;
    private String codigoPais; // +57, +1, +34, etc.
    private String telefonoContacto;
    private String observaciones;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaModificacion;

    // Método auxiliar para calcular el número de noches
    public void calcularNoches() {
        if (fechaIngreso != null && fechaSalida != null) {
            this.noches = (int) java.time.temporal.ChronoUnit.DAYS.between(fechaIngreso, fechaSalida);
        }
    }

    // Método auxiliar para calcular el precio total
    public void calcularPrecioTotal() {
        if (precioNoche != null && noches != null && noches > 0) {
            this.precioTotal = precioNoche * noches;
        }
    }

}
