package com.hotelsebasitian.controller;

import com.hotelsebasitian.entity.Habitacion;
import com.hotelsebasitian.service.HabitacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/habitaciones")
@RequiredArgsConstructor
public class HabitacionController {

    private final HabitacionService habitacionService;

    /** GET /api/habitaciones — todas las habitaciones */
    @GetMapping
    public ResponseEntity<List<Habitacion>> obtenerTodas() {
        return ResponseEntity.ok(habitacionService.obtenerTodas());
    }

    /** GET /api/habitaciones/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<Habitacion> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(habitacionService.obtenerPorId(id));
    }

    /** GET /api/habitaciones/disponibles */
    @GetMapping("/disponibles")
    public ResponseEntity<List<Habitacion>> obtenerDisponibles() {
        return ResponseEntity.ok(habitacionService.obtenerDisponibles());
    }

    /** GET /api/habitaciones/piso/{numero} — habitaciones filtradas por piso */
    @GetMapping("/piso/{numero}")
    public ResponseEntity<List<Habitacion>> obtenerPorPiso(@PathVariable Integer numero) {
        return ResponseEntity.ok(habitacionService.obtenerPorPiso(numero));
    }

    /** POST /api/habitaciones — crear (admin) */
    @PostMapping
    public ResponseEntity<Habitacion> crear(@RequestBody Habitacion habitacion) {
        return ResponseEntity.status(HttpStatus.CREATED).body(habitacionService.crear(habitacion));
    }

    /** PUT /api/habitaciones/{id} — actualizar (admin) */
    @PutMapping("/{id}")
    public ResponseEntity<Habitacion> actualizar(@PathVariable Long id, @RequestBody Habitacion habitacion) {
        return ResponseEntity.ok(habitacionService.actualizar(id, habitacion));
    }

    /** DELETE /api/habitaciones/{id} — eliminar (admin) */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        habitacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

}
