package com.hotelsebasitian.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import org.hibernate.annotations.Generated;
import org.hibernate.generator.EventType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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

    // ── Relaciones ────────────────────────────────────────
    private Long usuarioId;

    /** habitación principal (puede ser null si modoEspacio = piso/casa) */
    private Long habitacionId;

    /** IDs adicionales cuando se reservan varias habitaciones */
    @ElementCollection
    @CollectionTable(name = "reserva_habitaciones",
                     joinColumns = @JoinColumn(name = "reserva_id"))
    @Column(name = "habitacion_id")
    private List<Long> habitacionesIds;

    // ── Tipo de reserva ───────────────────────────────────
    /** individual | familiar | pasadia | grupal */
    private String tipoReserva;

    /** habitaciones | piso | casa */
    private String modoEspacio;

    /** piso1 | piso2 | completo */
    private String espacio;

    // ── Fechas y precios ──────────────────────────────────
    private LocalDate fechaIngreso;
    private LocalDate fechaSalida;
    private Integer noches;
    private Double precioNoche;
    private Double precioTotal;

    /** alta | media | baja */
    private String temporada;

    // ── Estado ────────────────────────────────────────────
    /** PENDIENTE | CONFIRMADA | CANCELADA | COMPLETADA */
    private String estado;

    // ── Personas ──────────────────────────────────────────
    private Integer huespedes;
    private Integer ninos3;
    private Integer ninos10;
    private Integer ninos11;

    // ── Datos del huésped ─────────────────────────────────
    private String nombreHuesped;
    private String apellidoHuesped;
    private String emailContacto;
    private String codigoPais;
    private String telefonoContacto;
    private String pais;
    private String tipoDocumento;   // CC, CE, TI, PA, NIT, DNI, RG
    private String numeroDocumento;
    private String observaciones;

    /**
     * Código secreto que recibe el huésped al crear la reserva. Junto con el id
     * le permite ver y pagar su reserva sin cuenta; sin él nadie puede leer los
     * datos personales probando ids consecutivos. Lo genera el servidor.
     */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Column(name = "codigo_acceso", length = 64)
    private String codigoAcceso;

    /**
     * Código visible de la reserva (RSV-2027-00012), el mismo que muestra y
     * busca SOGO. Lo asigna el trigger trg_reservas_before_insert de MySQL
     * (SOGO/database/01b_reparar_reservas.sql); Hibernate lo vuelve a leer
     * después de insertar. Si no hay trigger queda null y la web usa RSV-<id>,
     * igual que SOGO.
     */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Generated(event = EventType.INSERT)
    @Column(name = "codigo", length = 20, insertable = false, updatable = false)
    private String codigo;

    // ── Aceptación de políticas (prueba ante cualquier reclamo) ──────────
    /** Casilla "acepto la Política de reservas y el Reglamento interno" (llega de la web; no se guarda tal cual). */
    @Transient
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Boolean aceptaPoliticas;

    /** Casilla "autorizo el tratamiento de mis datos personales" (Ley 1581 de 2012). */
    @Transient
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Boolean autorizaDatos;

    /** Cuándo aceptó la Política de reservas y el Reglamento interno (lo fija el servidor). */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Column(name = "politicas_aceptadas_at")
    private LocalDateTime politicasAceptadasAt;

    /** Versión de las políticas que aceptó (fecha de publicación, p. ej. 2026-10-20). */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Column(name = "version_politicas", length = 20)
    private String versionPoliticas;

    /** Cuándo autorizó el tratamiento de datos. Columna compartida con SOGO (dataConsentAt). */
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Column(name = "consentimiento_datos_at")
    private LocalDateTime consentimientoDatosAt;

    // ── Auditoría ─────────────────────────────────────────
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaModificacion;

    // ── Helpers ───────────────────────────────────────────
    public void calcularNoches() {
        if (fechaIngreso != null && fechaSalida != null) {
            this.noches = (int) java.time.temporal.ChronoUnit.DAYS.between(fechaIngreso, fechaSalida);
        }
    }

    public void calcularPrecioTotal() {
        if (precioNoche != null && noches != null && noches > 0) {
            this.precioTotal = precioNoche * noches;
        }
    }
}
