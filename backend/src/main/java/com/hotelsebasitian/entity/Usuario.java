package com.hotelsebasitian.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;
    private String nombre;
    private String apellido;
    private String codigoPais; // +57, +1, +34, etc.
    private String telefono;
    private String tipoDocumento; // CC, CE, TI, PA, NIT, DNI, RG
    private String cedulaIdentidad;
    private String pais;
    private String ciudad;
    private String direccion;
    private String rol; // USER, ADMIN
    private Boolean activo;
    private LocalDateTime fechaRegistro;
    private LocalDateTime ultimaConexion;
    private String resetToken;
    private LocalDateTime resetTokenExpiry;

}
