package com.hotelsebasitian.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.hotelsebasitian.entity.TarifaReserva;
import com.hotelsebasitian.service.CalendarioTemporadas;
import com.hotelsebasitian.service.TarifaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * GET /api/tarifas — tarifas por persona de cada tipo de reserva.
 * GET /api/tarifas/temporadas — calendario de temporadas (alta, media, festivos, fechas especiales).
 * Son públicas: las usa el reservador. Se editan en SOGO (Alojamiento › Tarifas y temporadas).
 */
@RestController
@RequestMapping("/tarifas")
@RequiredArgsConstructor
public class TarifaController {

    private final TarifaService tarifaService;
    private final CalendarioTemporadas calendario;

    @GetMapping
    public ResponseEntity<List<TarifaReserva>> listar() {
        return ResponseEntity.ok(tarifaService.listar());
    }

    @GetMapping("/temporadas")
    public ResponseEntity<JsonNode> temporadas() {
        return ResponseEntity.ok(calendario.actual());
    }
}
