package com.hotelsebasitian.controller;

import com.hotelsebasitian.dto.LoginRequest;
import com.hotelsebasitian.dto.LoginResponse;
import com.hotelsebasitian.dto.RegistroRequest;
import com.hotelsebasitian.dto.UsuarioDTO;
import com.hotelsebasitian.dto.PasswordResetRequest;
import com.hotelsebasitian.dto.PasswordResetTokenValidation;
import com.hotelsebasitian.dto.ResetTokenResponse;
import com.hotelsebasitian.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request.getEmail(), request.getPassword()));
    }

    @PostMapping("/registro")
    public ResponseEntity<UsuarioDTO> registro(@RequestBody RegistroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registro(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Logout exitoso");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody PasswordResetRequest request) {
        authService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok("Email de recuperación enviado");
    }

    @GetMapping("/validate-reset-token/{token}")
    public ResponseEntity<ResetTokenResponse> validateResetToken(@PathVariable String token) {
        return ResponseEntity.ok(authService.validateResetToken(token));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody PasswordResetTokenValidation request) {
        authService.resetPassword(request.getToken(), request.getNewPassword(), request.getConfirmPassword());
        return ResponseEntity.ok("Contraseña actualizada exitosamente");
    }

}
