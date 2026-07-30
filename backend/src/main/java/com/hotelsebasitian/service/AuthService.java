package com.hotelsebasitian.service;

import com.hotelsebasitian.dto.*;
import com.hotelsebasitian.entity.Usuario;
import com.hotelsebasitian.repository.UsuarioRepository;
import com.hotelsebasitian.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public LoginResponse login(String email, String password) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        usuario.setUltimaConexion(LocalDateTime.now());
        usuarioRepository.save(usuario);

        String token = jwtTokenProvider.generateToken(usuario.getId().toString(), usuario.getEmail());

        return LoginResponse.builder()
                .token(token)
                .tipo("Bearer")
                .id(usuario.getId())
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .rol(usuario.getRol())
                .build();
    }

    public UsuarioDTO registro(RegistroRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        Usuario usuario = Usuario.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .telefono(request.getTelefono())
                .cedulaIdentidad(request.getCedulaIdentidad())
                .pais(request.getPais())
                .ciudad(request.getCiudad())
                .direccion(request.getDireccion())
                .rol("USER")
                .activo(true)
                .fechaRegistro(LocalDateTime.now())
                .build();

        usuario = usuarioRepository.save(usuario);

        return UsuarioDTO.builder()
                .id(usuario.getId())
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .telefono(usuario.getTelefono())
                .cedulaIdentidad(usuario.getCedulaIdentidad())
                .pais(usuario.getPais())
                .ciudad(usuario.getCiudad())
                .direccion(usuario.getDireccion())
                .rol(usuario.getRol())
                .activo(usuario.getActivo())
                .build();
    }

    public void requestPasswordReset(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + email));

        // Generar token único
        String resetToken = UUID.randomUUID().toString();
        usuario.setResetToken(resetToken);
        usuario.setResetTokenExpiry(LocalDateTime.now().plusHours(24)); // Válido por 24 horas
        usuarioRepository.save(usuario);

        // Enviar email
        emailService.sendPasswordResetEmail(email, resetToken);
    }

    public ResetTokenResponse validateResetToken(String token) {
        Usuario usuario = usuarioRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido"));

        if (usuario.getResetTokenExpiry() == null || usuario.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expirado");
        }

        return ResetTokenResponse.builder()
                .valid(true)
                .message("Token válido")
                .email(usuario.getEmail())
                .build();
    }

    public void resetPassword(String token, String newPassword, String confirmPassword) {
        if (!newPassword.equals(confirmPassword)) {
            throw new RuntimeException("Las contraseñas no coinciden");
        }

        if (newPassword.length() < 6) {
            throw new RuntimeException("La contraseña debe tener al menos 6 caracteres");
        }

        Usuario usuario = usuarioRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido"));

        if (usuario.getResetTokenExpiry() == null || usuario.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expirado");
        }

        // Actualizar contraseña
        usuario.setPassword(passwordEncoder.encode(newPassword));
        usuario.setResetToken(null);
        usuario.setResetTokenExpiry(null);
        usuarioRepository.save(usuario);

        // Enviar confirmación
        emailService.sendPasswordResetSuccessEmail(usuario.getEmail());
    }

}
