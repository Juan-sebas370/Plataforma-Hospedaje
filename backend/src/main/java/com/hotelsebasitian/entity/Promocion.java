package com.hotelsebasitian.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "promociones")
public class Promocion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String codigo;
    
    @Column(length = 300)
    private String descripcion;
    
    @Column(length = 20)
    private String tipoDescuento; // 'porcentaje' o 'fijo'
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valorDescuento;
    
    @Column
    private Integer porcentajeDescuento;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal minimoReserva;
    
    @Column(nullable = false)
    private LocalDate fechaInicio;
    
    @Column(nullable = false)
    private LocalDate fechaFin;
    
    @Column
    private Integer usosLimitados;
    
    @Column
    private Integer usosActuales = 0;
    
    @Column(columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean activo = true;
    
    @Column(columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean aplicableHabitaciones = true;
    
    @Column(columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean aplicableServicios = true;
    
    @Column(name = "fecha_creacion", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;
    
    // Constructores
    public Promocion() {
        this.fechaCreacion = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getCodigo() {
        return codigo;
    }
    
    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public String getTipoDescuento() {
        return tipoDescuento;
    }
    
    public void setTipoDescuento(String tipoDescuento) {
        this.tipoDescuento = tipoDescuento;
    }
    
    public BigDecimal getValorDescuento() {
        return valorDescuento;
    }
    
    public void setValorDescuento(BigDecimal valorDescuento) {
        this.valorDescuento = valorDescuento;
    }
    
    public Integer getPorcentajeDescuento() {
        return porcentajeDescuento;
    }
    
    public void setPorcentajeDescuento(Integer porcentajeDescuento) {
        this.porcentajeDescuento = porcentajeDescuento;
    }
    
    public BigDecimal getMinimoReserva() {
        return minimoReserva;
    }
    
    public void setMinimoReserva(BigDecimal minimoReserva) {
        this.minimoReserva = minimoReserva;
    }
    
    public LocalDate getFechaInicio() {
        return fechaInicio;
    }
    
    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }
    
    public LocalDate getFechaFin() {
        return fechaFin;
    }
    
    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }
    
    public Integer getUsosLimitados() {
        return usosLimitados;
    }
    
    public void setUsosLimitados(Integer usosLimitados) {
        this.usosLimitados = usosLimitados;
    }
    
    public Integer getUsosActuales() {
        return usosActuales;
    }
    
    public void setUsosActuales(Integer usosActuales) {
        this.usosActuales = usosActuales;
    }
    
    public Boolean getActivo() {
        return activo;
    }
    
    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
    
    public Boolean getAplicableHabitaciones() {
        return aplicableHabitaciones;
    }
    
    public void setAplicableHabitaciones(Boolean aplicableHabitaciones) {
        this.aplicableHabitaciones = aplicableHabitaciones;
    }
    
    public Boolean getAplicableServicios() {
        return aplicableServicios;
    }
    
    public void setAplicableServicios(Boolean aplicableServicios) {
        this.aplicableServicios = aplicableServicios;
    }
    
    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
    
    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
    
    public LocalDateTime getFechaModificacion() {
        return fechaModificacion;
    }
    
    public void setFechaModificacion(LocalDateTime fechaModificacion) {
        this.fechaModificacion = fechaModificacion;
    }
}
