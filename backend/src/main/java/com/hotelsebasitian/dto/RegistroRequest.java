package com.hotelsebasitian.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroRequest {
    private String email;
    private String password;
    private String nombre;
    private String apellido;
    private String telefono;
    private String cedulaIdentidad;
    private String pais;
    private String ciudad;
    private String direccion;
}
