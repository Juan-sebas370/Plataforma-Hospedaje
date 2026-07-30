package com.hotelsebasitian.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "paquetes")
public class Paquete {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 150)
    private String nombre;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(length = 50)
    private String tipo;
    
    @Column(length = 300)
    private String imagenUrl;
    
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precioTotal;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal precioPorNoche;
    
    @Column
    private Integer nochesMinimas;
    
    @Column
    private Integer capacidadMaxima;
    
    @Column(columnDefinition = "TEXT")
    private String incluyeServicios;
    
    @Column(length = 500)
    private String serviciosIncuidosIds;
    
    @Column
    private Integer descuentoPorcentaje;
    
    @Column(columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean disponible = true;
    
    @Column
    private LocalDate fechaInicio;
    
    @Column
    private LocalDate fechaFin;
    
    @Column
    private Integer validezMeses;
    
    @Column(columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean activo = true;
    
    @Column(name = "fecha_creacion", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;
    
    // Constructores
    public Paquete() {
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
    
    public String getImagenUrl() {
        return imagenUrl;
    }
    
    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }
    
    public BigDecimal getPrecioTotal() {
        return precioTotal;
    }
    
    public void setPrecioTotal(BigDecimal precioTotal) {
        this.precioTotal = precioTotal;
    }
    
    public BigDecimal getPrecioPorNoche() {
        return precioPorNoche;
    }
    
    public void setPrecioPorNoche(BigDecimal precioPorNoche) {
        this.precioPorNoche = precioPorNoche;
    }
    
    public Integer getNochesMinimas() {
        return nochesMinimas;
    }
    
    public void setNochesMinimas(Integer nochesMinimas) {
        this.nochesMinimas = nochesMinimas;
    }
    
    public Integer getCapacidadMaxima() {
        return capacidadMaxima;
    }
    
    public void setCapacidadMaxima(Integer capacidadMaxima) {
        this.capacidadMaxima = capacidadMaxima;
    }
    
    public String getIncluyeServicios() {
        return incluyeServicios;
    }
    
    public void setIncluyeServicios(String incluyeServicios) {
        this.incluyeServicios = incluyeServicios;
    }
    
    public String getServiciosIncuidosIds() {
        return serviciosIncuidosIds;
    }
    
    public void setServiciosIncuidosIds(String serviciosIncuidosIds) {
        this.serviciosIncuidosIds = serviciosIncuidosIds;
    }
    
    public Integer getDescuentoPorcentaje() {
        return descuentoPorcentaje;
    }
    
    public void setDescuentoPorcentaje(Integer descuentoPorcentaje) {
        this.descuentoPorcentaje = descuentoPorcentaje;
    }
    
    public Boolean getDisponible() {
        return disponible;
    }
    
    public void setDisponible(Boolean disponible) {
        this.disponible = disponible;
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
    
    public Integer getValidezMeses() {
        return validezMeses;
    }
    
    public void setValidezMeses(Integer validezMeses) {
        this.validezMeses = validezMeses;
    }
    
    public Boolean getActivo() {
        return activo;
    }
    
    public void setActivo(Boolean activo) {
        this.activo = activo;
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
