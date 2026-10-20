package com.hotelsebasitian.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroRequest {
    @NotBlank
    @Email
    private String email;
    @NotBlank
    @Size(min = 8, max = 72)
    private String password;
    @NotBlank
    @Size(max = 100)
    private String nombre;
    @NotBlank
    @Size(max = 100)
    private String apellido;
    @Size(max = 30)
    private String telefono;
    @Size(max = 40)
    private String cedulaIdentidad;
    @Size(max = 80)
    private String pais;
    @Size(max = 80)
    private String ciudad;
    @Size(max = 200)
    private String direccion;
}
