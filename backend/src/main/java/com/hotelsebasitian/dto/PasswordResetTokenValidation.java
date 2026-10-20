package com.hotelsebasitian.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetTokenValidation {
    @NotBlank
    private String token;
    @NotBlank
    @Size(min = 8, max = 72)
    private String newPassword;
    @NotBlank
    @Size(min = 8, max = 72)
    private String confirmPassword;
}
