// Prueba E2E de una reserva en línea completa con pago en MODO DE PRUEBAS de Wompi (sandbox).
// Recorre el asistente (Tu viaje → Tu espacio → Tus datos → Confirmar y pagar), paga en el widget de Wompi con la
// tarjeta de pruebas 4242 4242 4242 4242 (no es una tarjeta real) y comprueba la página "¡Reserva confirmada!".
//
// CREA UNA RESERVA en la base de datos del backend al que apunte la página. Por eso se corre contra un entorno local:
//   1. Backend local con llaves de PRUEBAS de Wompi (WOMPI_PUBLIC_KEY=pub_test_…) en el puerto 8080.
//   2. Frontend en modo desarrollo (usa http://localhost:8080/api):
//        npx ng build --configuration development --output-path dist/e2e-dev
//        DIST=dist/e2e-dev/browser node pruebas/e2e/servidor-estatico.mjs 4200
//   3. node pruebas/e2e/reserva-pago-prueba.mjs [díaLlegada] [díaSalida]   (días del mes siguiente; por defecto 5 y 7)
//
// Si el widget de Wompi no muestra "MODO DE PRUEBAS" (llaves de producción), la prueba se detiene antes de pagar.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.BASE_URL ?? 'http://localhost:4200').replace(/\/$/, '');
const CAPTURAS = path.resolve(process.env.CAPTURAS ?? path.join(AQUI, 'capturas/reserva-completa'));
const [LLEGADA, SALIDA] = [process.argv[2] ?? '5', process.argv[3] ?? '7'];
fs.mkdirSync(CAPTURAS, { recursive: true });

let navegador;
for (const channel of process.env.NAVEGADOR ? [process.env.NAVEGADOR] : [undefined, 'msedge', 'chrome']) {
  navegador = await chromium.launch({ channel }).catch(() => null);
  if (navegador) break;
}
if (!navegador) throw new Error('No hay navegador disponible. Ejecuta: npx playwright install chromium');

const pagina = await (await navegador.newContext({ viewport: { width: 1440, height: 900 }, locale: 'es-CO' })).newPage();
const api = [];
pagina.on('response', r => { if (/\/api\/reservas/.test(r.url()) && r.request().method() === 'POST') api.push(`${r.status()} ${new URL(r.url()).pathname}`); });
const foto = n => pagina.screenshot({ path: path.join(CAPTURAS, `${n}.png`) });
const paso = m => console.log('•', m);
const seguir = async () => { await pagina.click('.acciones__seguir'); await pagina.waitForTimeout(1500); };

try {
  // 1. Tu viaje: fechas del mes siguiente
  await pagina.goto(`${BASE}/reservas`, { waitUntil: 'networkidle' });
  await pagina.waitForTimeout(1000);
  await pagina.click('button[aria-label="Mes siguiente"]');
  await pagina.locator('button.cal-dia', { hasText: new RegExp(`^${LLEGADA}$`) }).click();
  await pagina.locator('button.cal-dia', { hasText: new RegExp(`^${SALIDA}$`) }).click();
  await pagina.waitForTimeout(400);
  await foto('reserva-1-tu-viaje');
  paso(`Tu viaje: del ${LLEGADA} al ${SALIDA} del mes siguiente, 2 adultos`);
  await seguir();

  // 2. Tu espacio: la primera habitación disponible en esas fechas
  const agregar = pagina.locator('button.btn-primario:not([disabled])', { hasText: 'Agregar' }).first();
  await agregar.waitFor({ timeout: 15_000 });
  const habitacion = (await agregar.locator('xpath=ancestor::*[contains(., "Habitación")][1]').innerText()).match(/Habitación \d+/)?.[0];
  await agregar.click();
  await pagina.waitForTimeout(500);
  await foto('reserva-2-tu-espacio');
  paso(`Tu espacio: ${habitacion ?? 'primera habitación disponible'}`);
  await seguir();

  // 3. Tus datos (ficticios)
  await pagina.fill('#f-nombre', 'Laura'); await pagina.fill('#f-apellido', 'Prueba');
  await pagina.selectOption('#f-tipodoc', { index: 1 }); await pagina.fill('#f-numdoc', '1094000000');
  await pagina.fill('#f-email', 'prueba.e2e@example.com'); await pagina.fill('#f-tel', '3001234567');
  await foto('reserva-3-tus-datos');
  paso('Tus datos: Laura Prueba (datos ficticios)');
  await seguir();

  // 4. Confirmar: aceptar políticas y crear la reserva
  for (const c of await pagina.locator('label.terminos input[type=checkbox]').all()) await c.check();
  await foto('reserva-4-confirmar');
  await pagina.click('.acciones__seguir');
  await pagina.waitForURL(/\/pagos\?/, { timeout: 20_000 });
  await pagina.waitForTimeout(2000);
  await foto('reserva-5-pagos');
  paso(`Reserva creada → ${new URL(pagina.url()).pathname}?reservaId=${new URL(pagina.url()).searchParams.get('reservaId')}`);

  // 5. Widget de Wompi
  await pagina.getByRole('button', { name: /pagar/i }).first().click();
  const W = pagina.frameLocator('iframe[src*="wompi"]').first();
  await W.getByText('Tarjeta débito o crédito').waitFor({ timeout: 30_000 });
  if (!(await W.getByText(/modo de pruebas/i).count())) throw new Error('Wompi NO está en modo de pruebas: se detiene la prueba antes de pagar.');
  await foto('reserva-6-wompi-modo-pruebas');
  paso('Wompi abrió en MODO DE PRUEBAS');
  await W.getByText('Tarjeta débito o crédito').click();
  await W.locator('#fullName').fill('Laura Prueba'); await W.locator('#email').fill('prueba.e2e@example.com');
  await W.locator('input#number').fill('3001234567');
  await W.getByRole('button', { name: /continuar con tu pago/i }).click();

  // Tarjeta de PRUEBAS de Wompi: 4242 4242 4242 4242 → transacción aprobada
  await W.locator('#cardNumber').fill('4242424242424242');
  await W.locator('#expirationMonth').selectOption('12'); await W.locator('#expirationYear').selectOption('29');
  await W.locator('#code').fill('123'); await W.locator('#cardHolder').fill('Laura Prueba');
  await W.locator('#legal_id_option').selectOption({ index: 3 }); await W.locator('#legal_id_number').fill('1094000000');
  for (const id of ['acceptance', 'acceptancePersonal']) {
    for (let i = 0; i < 4 && !(await W.locator(`#${id}`).isChecked()); i++) {
      await W.locator(`label:has(#${id})`).click({ position: { x: 10, y: 13 } });
      await pagina.waitForTimeout(600);
    }
  }
  await foto('reserva-7-tarjeta-de-prueba');
  await W.getByRole('button', { name: /continuar con tu pago/i }).click();
  await W.getByText(/pago aprobado/i).first().waitFor({ timeout: 60_000 });
  await pagina.waitForTimeout(1000);
  await foto('reserva-8-pago-aprobado');
  paso('Wompi: ¡Pago aprobado! (VISA ****4242 de pruebas)');

  // 6. Confirmación en la página
  await W.getByRole('button', { name: /volver al comercio/i }).first().click().catch(() => {});
  await pagina.waitForURL(/\/confirmacion\?/, { timeout: 60_000 });
  await pagina.getByText(/reserva confirmada/i).first().waitFor({ timeout: 30_000 });
  await pagina.waitForTimeout(1500);
  await foto('reserva-9-confirmada');
  const texto = (await pagina.locator('main').first().innerText()).replace(/\s+/g, ' ');
  const codigo = texto.match(/RSV-\d{4}-\d+/)?.[0];
  if (!/pagado/i.test(texto) || !codigo) throw new Error('La confirmación no muestra el código o el estado pagado.');
  paso(`Página: ¡Reserva confirmada! ${codigo}, estado Pagado`);
  console.log(`\nAPROBADA · llamadas al API: ${api.join(' · ')} · capturas en ${CAPTURAS}`);
} catch (e) {
  await foto('error').catch(() => {});
  console.error(`\nFALLIDA: ${e.message.split('\n')[0]}`);
  process.exitCode = 1;
} finally {
  await navegador.close();
}
