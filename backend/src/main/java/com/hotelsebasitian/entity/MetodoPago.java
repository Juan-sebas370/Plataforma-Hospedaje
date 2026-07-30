package com.hotelsebasitian.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "metodos_pago")
public class MetodoPago {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String nombre;
    
    @Column(length = 200)
    private String descripcion;
    
    @Column(length = 50)
    private String tipo;
    
    @Column(columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean activo = true;
    
    @Column(length = 300)
    private String iconoUrl;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal comisionPorcentaje = BigDecimal.ZERO;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal comisionFija = BigDecimal.ZERO;
    
    @Column(columnDefinition = "TINYINT(1) DEFAULT 0")
    private Boolean requiereVerificacion = false;
    
    @Column(length = 50)
    private String tiempoConfirmacion;
    
    @Column(name = "fecha_creacion", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;
    
    // Constructores
    public MetodoPago() {
        this.fechaCreacion = LocalDateTime.now();
    }
    
    public MetodoPago(String nombre, String descripcion, String tipo, BigDecimal comisionPorcentaje) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.tipo = tipo;
        this.comisionPorcentaje = comisionPorcentaje;
        this.activo = true;
        this.fechaCreacion = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public String getTipo() {
        return tipo;
    }
    
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
    
    public Boolean getActivo() {
        return activo;
    }
    
    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
    
    public String getIconoUrl() {
        return iconoUrl;
    }
    
    public void setIconoUrl(String iconoUrl) {
        this.iconoUrl = iconoUrl;
    }
    
    public BigDecimal getComisionPorcentaje() {
        return comisionPorcentaje;
    }
    
    public void setComisionPorcentaje(BigDecimal comisionPorcentaje) {
        this.comisionPorcentaje = comisionPorcentaje;
    }
    
    public BigDecimal getComisionFija() {
        return comisionFija;
    }
    
    public void setComisionFija(BigDecimal comisionFija) {
        this.comisionFija = comisionFija;
    }
    
    public Boolean getRequiereVerificacion() {
        return requiereVerificacion;
    }
    
    public void setRequiereVerificacion(Boolean requiereVerificacion) {
        this.requiereVerificacion = requiereVerificacion;
    }
    
    public String getTiempoConfirmacion() {
        return tiempoConfirmacion;
    }
    
    public void setTiempoConfirmacion(String tiempoConfirmacion) {
        this.tiempoConfirmacion = tiempoConfirmacion;
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
