package com.hotelsebasitian.config;

import com.hotelsebasitian.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
            .headers(headers -> headers
                .frameOptions(frame -> frame.deny())
                .contentTypeOptions(contentType -> {})
                .referrerPolicy(referrer -> referrer
                    .policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
                .permissionsPolicy(permissions -> permissions
                    .policy("camera=(), microphone=(), geolocation=()")))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                // Sin token (o token vencido/falso) → 401, para que la web cierre la sesión;
                // con token pero sin permisos → 403.
                .exceptionHandling(ex -> ex.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/health", "/error").permitAll()
                        .requestMatchers("/auth/**").permitAll()
                        // Habitaciones, paquetes y promociones: lectura pública, escritura solo admin
                        .requestMatchers(HttpMethod.GET, "/habitaciones/**", "/paquetes/**", "/tarifas", "/tarifas/temporadas", "/hospedaje").permitAll()
                        // Promociones: el público solo puede validar un código que ya conoce;
                        // el listado y el detalle de los códigos son de administración.
                        .requestMatchers(HttpMethod.GET, "/promociones/validar/**").permitAll()
                        .requestMatchers("/promociones/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/habitaciones/**", "/paquetes/**", "/promociones/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/habitaciones/**", "/paquetes/**", "/promociones/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/habitaciones/**", "/paquetes/**", "/promociones/**").hasRole("ADMIN")
                        // Reservas: crear y verificar disponibilidad sin login (clientes no tienen cuenta)
                        .requestMatchers(HttpMethod.POST, "/reservas").permitAll()
                        .requestMatchers(HttpMethod.GET, "/reservas/disponibilidad").permitAll()
                        // Consultar una reserva puntual por id: la usa la pantalla de confirmación
                        // justo después de crearla (el cliente no tiene cuenta).
                        .requestMatchers(HttpMethod.GET, "/reservas/{id:[0-9]+}").permitAll()
                        // Iniciar el pago con Wompi de una reserva puntual: mismo caso, sin cuenta.
                        .requestMatchers(HttpMethod.GET, "/reservas/{id:[0-9]+}/checkout-wompi").permitAll()
                        // Verificar el pago contra la API de Wompi tras cerrar el widget.
                        .requestMatchers(HttpMethod.POST, "/reservas/{id:[0-9]+}/verificar-pago-wompi").permitAll()
                        // Reservas de un usuario: requiere estar autenticado; el controlador valida
                        // que sea el propio usuario o un administrador.
                        .requestMatchers(HttpMethod.GET, "/reservas/usuario/**").authenticated()
                        // Listado completo y modificación/cancelación/borrado: solo administración.
                        .requestMatchers(HttpMethod.GET, "/reservas").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/reservas/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/reservas/**").hasRole("ADMIN")
                        // Contacto: enviar mensaje sin login
                        .requestMatchers(HttpMethod.POST, "/contactos").permitAll()
                        // Leer, cambiar y responder mensajes: datos personales, solo administración
                        .requestMatchers("/contactos/**").hasRole("ADMIN")
                        // Webhook de Wompi: lo llama el servidor de Wompi, no un usuario logueado;
                        // cada request se valida por firma criptográfica, no por sesión.
                        .requestMatchers(HttpMethod.POST, "/webhooks/wompi").permitAll()
                        // Pagos: información sensible, solo administración
                        .requestMatchers("/pagos/**").hasRole("ADMIN")
                        // Todo lo demás es del panel de administración. Por defecto se
                        // niega a los huéspedes: una ruta nueva no queda expuesta por olvido.
                        .anyRequest().hasRole("ADMIN"))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
