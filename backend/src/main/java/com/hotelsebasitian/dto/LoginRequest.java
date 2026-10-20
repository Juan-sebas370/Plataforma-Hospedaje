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
public class LoginRequest {
    @NotBlank
    @Email
    private String email;
    // Sin mínimo: una clave corta simplemente no coincide y responde "Credenciales invalidas"
    // (cuentas antiguas con claves cortas pueden seguir entrando).
    @NotBlank
    @Size(max = 72)
    private String password;
}
