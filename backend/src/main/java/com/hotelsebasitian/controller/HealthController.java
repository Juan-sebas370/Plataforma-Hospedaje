package com.hotelsebasitian.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("")
public class HealthController {

    private final JdbcTemplate jdbc;

    public HealthController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> welcome() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Bienvenido a HOSPEDAJE SEBASTIAN API");
        response.put("version", "1.0.0");
        response.put("status", "active");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    /**
     * Comprueba la base de datos con una consulta mínima. Lo llama un monitor externo
     * (UptimeRobot) cada pocos minutos: así Aiven (plan Free) no apaga la base por
     * inactividad y, si la base se cae, el monitor avisa por correo.
     */
    @GetMapping("/health/db")
    public ResponseEntity<Map<String, Object>> healthDb() {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        try {
            jdbc.queryForObject("SELECT 1", Integer.class);
            response.put("status", "OK");
            response.put("database", "UP");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("status", "ERROR");
            response.put("database", "DOWN");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }
    }

}
