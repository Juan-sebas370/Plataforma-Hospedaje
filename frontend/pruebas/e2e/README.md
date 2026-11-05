# Pruebas extremo a extremo (E2E) de la página web

Pruebas de sistema de la página pública (hospedajesebastianfilandia.com) con Playwright: abren la página en un navegador real, actúan como un visitante y verifican lo que se ve en pantalla. Son la evidencia de la sección 8 del plan de pruebas (PT-PP-03).

| Archivo | Qué hace |
|---|---|
| `servidor-estatico.mjs` | Sirve la compilación de producción como Cloudflare Pages: páginas prerenderizadas y reglas de `_redirects`. |
| `recorrido-web.mjs` | Las 19 pruebas WEB-01 a WEB-19 (recorrido de la página). Solo lectura: no envía formularios ni crea reservas. |
| `reserva-pago-prueba.mjs` | Una reserva en línea completa, pagada en **modo de pruebas de Wompi** con la tarjeta de pruebas `4242 4242 4242 4242`. Crea una reserva, por eso se corre contra el backend local. |
| `capturas/` | Capturas de evidencia (figuras 8.1 a 8.17) y `resultados.json` con el detalle de la última ejecución. |
| `capturas/reserva-completa/` | Las 9 capturas de la reserva con pago de prueba. |

## Último resultado (05/11/2026, después de reactivar las reservas en línea)

- **Recorrido de la página:** 19/19 aprobadas, ejecutadas 3 veces seguidas con el mismo resultado. WEB-09 (correo inválido en Contacto) ya pasa: el defecto D-W1 se corrigió.
- **Reserva con pago de prueba:** aprobada. Se creó la reserva, Wompi mostró "Modo de pruebas" y aprobó el pago con la tarjeta de pruebas (VISA ****4242), y la página mostró "¡Reserva confirmada!" con estado Pagado.

## Cómo repetirlas

En `frontend/`. La primera vez, si no hay un navegador: `npx playwright install chromium`. También sirve Edge o Chrome instalados, con `NAVEGADOR=msedge` o `NAVEGADOR=chrome`.

**Recorrido de la página (WEB-01 a WEB-19)**

```bash
npx ng build
node pruebas/e2e/servidor-estatico.mjs        # terminal 1: http://localhost:4310
node pruebas/e2e/recorrido-web.mjs            # terminal 2
```

Para probar el sitio publicado, que es de solo lectura: `BASE_URL=https://hospedajesebastianfilandia.com node pruebas/e2e/recorrido-web.mjs`.

**Reserva completa con pago de prueba**

1. Backend local en el puerto 8080 con llaves de **pruebas** de Wompi (`WOMPI_PUBLIC_KEY=pub_test_…`).
2. Frontend en modo desarrollo, que usa `http://localhost:8080/api`:
   ```bash
   npx ng build --configuration development --output-path dist/e2e-dev
   DIST=dist/e2e-dev/browser node pruebas/e2e/servidor-estatico.mjs 4200
   ```
3. Correr la prueba. Las fechas son días del mes siguiente que estén libres:
   ```bash
   node pruebas/e2e/reserva-pago-prueba.mjs 9 11
   ```

Si el widget de Wompi no muestra "Modo de pruebas" (llaves de producción), la prueba se detiene antes de pagar.

Las pruebas de Reservas y Pagos (WEB-01, WEB-10 y WEB-11) se adaptan solas según `reservasHabilitadas` en `src/environments/environment.production.ts`: con las reservas activas verifican el asistente de reserva; con las reservas desactivadas verifican el aviso.
