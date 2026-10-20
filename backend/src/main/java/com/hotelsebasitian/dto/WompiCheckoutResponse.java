package com.hotelsebasitian.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Datos que el frontend necesita para abrir el Widget de Checkout de Wompi. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WompiCheckoutResponse {
    private String publicKey;
    private String reference;
    private long amountInCents;
    private String currency;
    private String signature;
}
