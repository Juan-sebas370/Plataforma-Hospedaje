package com.hotelsebasitian.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "pagos")
public class Pago {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "reserva_id", nullable = false)
    private Reserva reserva;
    
    // Muchas reservas son de huéspedes sin cuenta (no requieren login para
    // reservar), así que no siempre hay un Usuario asociado al pago.
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
    
    @ManyToOne
    @JoinColumn(name = "metodo_pago_id")
    private MetodoPago metodoPago;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;
    
    @Column(length = 50, nullable = false)
    private String estado;
    
    @Column(length = 100)
    private String numeroTransaccion;
    
    @Column(length = 100)
    private String referenciaBanco;
    
    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;
    
    @Column(name = "fecha_creacion", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;
    
    // Constructores
    // Sin estado por defecto: este constructor también lo usa Jackson al leer
    // ediciones parciales, y un "pendiente" implícito pisaría el estado real.
    // Quien crea un pago (PagoController, PagoWompiService) fija el estado.
    public Pago() {
        this.fechaCreacion = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Reserva getReserva() {
        return reserva;
    }
    
    public void setReserva(Reserva reserva) {
        this.reserva = reserva;
    }
    
    public Usuario getUsuario() {
        return usuario;
    }
    
    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
    
    public MetodoPago getMetodoPago() {
        return metodoPago;
    }
    
    public void setMetodoPago(MetodoPago metodoPago) {
        this.metodoPago = metodoPago;
    }
    
    public BigDecimal getMonto() {
        return monto;
    }
    
    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }
    
    public String getEstado() {
        return estado;
    }
    
    public void setEstado(String estado) {
        this.estado = estado;
    }
    
    public String getNumeroTransaccion() {
        return numeroTransaccion;
    }
    
    public void setNumeroTransaccion(String numeroTransaccion) {
        this.numeroTransaccion = numeroTransaccion;
    }
    
    public String getReferenciaBanco() {
        return referenciaBanco;
    }
    
    public void setReferenciaBanco(String referenciaBanco) {
        this.referenciaBanco = referenciaBanco;
    }
    
    public LocalDateTime getFechaPago() {
        return fechaPago;
    }
    
    public void setFechaPago(LocalDateTime fechaPago) {
        this.fechaPago = fechaPago;
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
