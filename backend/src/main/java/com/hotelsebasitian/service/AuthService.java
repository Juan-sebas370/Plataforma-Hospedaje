package com.hotelsebasitian.service;

import com.hotelsebasitian.dto.*;
import com.hotelsebasitian.entity.Usuario;
import com.hotelsebasitian.repository.UsuarioRepository;
import com.hotelsebasitian.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public LoginResponse login(String email, String password) {
        Usuario usuario = usuarioRepository.findByEmail(normalizar(email))
                .orElseThrow(() -> new BadCredentialsException("Credenciales invalidas"));

        if (!Boolean.TRUE.equals(usuario.getActivo()) || !passwordEncoder.matches(password, usuario.getPassword())) {
            throw new BadCredentialsException("Credenciales invalidas");
        }

        usuario.setUltimaConexion(LocalDateTime.now());
        usuarioRepository.save(usuario);

        String token = jwtTokenProvider.generateToken(
                usuario.getId().toString(), usuario.getEmail(), usuario.getRol());

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
        String email = normalizar(request.getEmail());
        if (usuarioRepository.existsByEmail(email)) {
            throw new RuntimeException("El email ya está registrado");
        }

        Usuario usuario = Usuario.builder()
                .email(email)
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

        usuarioRepository.save(Objects.requireNonNull(usuario));

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
        Usuario usuario = usuarioRepository.findByEmail(normalizar(email)).orElse(null);
        if (usuario == null) {
            return;
        }

        String resetToken = UUID.randomUUID().toString();
        usuario.setResetToken(hashToken(resetToken));
        usuario.setResetTokenExpiry(LocalDateTime.now().plusHours(24)); // Válido por 24 horas
        usuarioRepository.save(usuario);

        // Si el correo falla se registra en el log pero se responde igual que con un
        // email inexistente: así nadie puede averiguar qué cuentas existen.
        try {
            emailService.sendPasswordResetEmail(usuario.getEmail(), resetToken);
        } catch (RuntimeException e) {
            log.error("No se pudo enviar el correo de recuperación a usuario {}", usuario.getId(), e);
        }
    }

    public ResetTokenResponse validateResetToken(String token) {
        Usuario usuario = usuarioRepository.findByResetToken(hashToken(token))
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

        if (newPassword.length() < 8) {
            throw new RuntimeException("La contraseña debe tener al menos 8 caracteres");
        }

        Usuario usuario = usuarioRepository.findByResetToken(hashToken(token))
                .orElseThrow(() -> new RuntimeException("Token inválido"));

        if (usuario.getResetTokenExpiry() == null || usuario.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expirado");
        }

        // Actualizar contraseña
        usuario.setPassword(passwordEncoder.encode(newPassword));
        usuario.setResetToken(null);
        usuario.setResetTokenExpiry(null);
        usuarioRepository.save(usuario);

        // La contraseña ya cambió: un fallo del correo de confirmación no debe parecer un error.
        try {
            emailService.sendPasswordResetSuccessEmail(usuario.getEmail());
        } catch (RuntimeException e) {
            log.error("No se pudo enviar la confirmación de cambio de contraseña a usuario {}", usuario.getId(), e);
        }
    }

    /** Los emails se guardan y buscan sin espacios y en minúsculas. */
    private static String normalizar(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder(digest.length * 2);
            for (byte value : digest) {
                result.append(String.format("%02x", value));
            }
            return result.toString();
        } catch (java.security.NoSuchAlgorithmException exception) {
            throw new IllegalStateException("Hashing algorithm unavailable", exception);
        }
    }

}
