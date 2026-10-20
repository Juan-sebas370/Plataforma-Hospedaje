package com.hotelsebasitian.controller;

import com.hotelsebasitian.service.PagoWompiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Recibe los eventos que Wompi envía por webhook cuando cambia el estado de
 * una transacción (aprobada, rechazada, etc). Público por necesidad — lo
 * llama el servidor de Wompi, no un usuario logueado — pero cada request se
 * valida por firma criptográfica (ver WompiService), no por sesión.
 */
@RestController
@RequestMapping("/webhooks/wompi")
@RequiredArgsConstructor
public class WompiWebhookController {

    private final PagoWompiService pagoWompiService;

    @PostMapping
    public ResponseEntity<Void> recibirEvento(@RequestBody Map<String, Object> payload) {
        boolean valido = pagoWompiService.procesarEvento(payload);
        return valido ? ResponseEntity.ok().build() : ResponseEntity.status(401).build();
    }
}
