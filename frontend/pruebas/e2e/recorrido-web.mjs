// Pruebas extremo a extremo (E2E) de la página web pública, WEB-01 a WEB-19.
// Cada prueba abre la página en un navegador real, actúa como un visitante y verifica el resultado.
// Las capturas de evidencia quedan en pruebas/e2e/capturas/ y el resumen en capturas/resultados.json.
//
// Uso (en frontend/):
//   npx ng build
//   node pruebas/e2e/servidor-estatico.mjs          (en otra terminal; sirve en http://localhost:4310)
//   node pruebas/e2e/recorrido-web.mjs
//
// Variables opcionales:
//   BASE_URL=https://hospedajesebastianfilandia.com  → prueba el sitio publicado (solo lectura: no envía formularios ni crea reservas)
//   NAVEGADOR=msedge | chrome                         → usa un navegador instalado en vez del Chromium de Playwright
//   CAPTURAS=otra/carpeta                             → dónde guardar las capturas
// La primera vez, si no hay navegador: npx playwright install chromium
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.BASE_URL ?? 'http://localhost:4310').replace(/\/$/, '');
const CAPTURAS = path.resolve(process.env.CAPTURAS ?? path.join(AQUI, 'capturas'));
const ESCRITORIO = { width: 1440, height: 900 };
const CELULAR = { width: 390, height: 844 };

/** Las pruebas de Reservas y Pagos dependen de si las reservas en línea están activas en la compilación de producción. */
const RESERVAS_HABILITADAS = /reservasHabilitadas:\s*true/.test(
  fs.readFileSync(path.join(AQUI, '../../src/environments/environment.production.ts'), 'utf8'));

fs.mkdirSync(CAPTURAS, { recursive: true });

// ───────────────────────── utilidades
async function abrirNavegador() {
  const canales = process.env.NAVEGADOR ? [process.env.NAVEGADOR] : [undefined, 'msedge', 'chrome'];
  for (const channel of canales) {
    try {
      const b = await chromium.launch({ channel, headless: true });
      return { navegador: b, nombre: `${channel ?? 'chromium'} ${b.version()}` };
    } catch { /* se intenta con el siguiente */ }
  }
  throw new Error('No hay navegador disponible. Ejecuta: npx playwright install chromium');
}

/** Errores de JavaScript de la página (no cuenta las peticiones de red fallidas, p. ej. el API apagado). */
const erroresJs = [];
function vigilar(pagina, prueba) {
  pagina.on('pageerror', e => erroresJs.push(`${prueba}: ${e.message}`));
  pagina.on('console', m => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/Failed to load resource|net::ERR_|CORS|Access-Control-Allow-Origin|Http failure|status of [45]\d\d/i.test(t)) return;
    erroresJs.push(`${prueba}: ${t}`);
  });
}

function afirmar(condicion, mensaje) {
  if (!condicion) throw new Error(mensaje);
}

async function ir(pagina, ruta) {
  await pagina.goto(BASE + ruta, { waitUntil: 'load', timeout: 60_000 });
  await pagina.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await pagina.waitForTimeout(600);
}

async function capturar(pagina, nombre, opciones = {}) {
  const archivo = path.join(CAPTURAS, `${nombre}.png`);
  await pagina.screenshot({ path: archivo, ...opciones });
  return path.basename(archivo);
}

/** Cierra el aviso de bienvenida si está abierto (solo aparece con las reservas deshabilitadas). */
async function cerrarAviso(pagina) {
  const boton = pagina.locator('dialog.aviso[open] .boton--principal');
  if (await boton.count()) await boton.click();
}

// ───────────────────────── pruebas
const pruebas = [
  ['WEB-01', 'Inicio', RESERVAS_HABILITADAS
    ? 'El inicio carga con su contenido y sin el aviso de "aún no recibimos reservas" (las reservas están activas).'
    : 'El inicio carga, muestra el aviso de que aún no se reciben reservas en línea y el aviso se puede cerrar.',
  async ({ pagina, evidencias }) => {
    await ir(pagina, '/');
    afirmar(await pagina.locator('app-home h1, app-home h2').first().isVisible(), 'El inicio no muestra su título.');
    const aviso = pagina.locator('dialog.aviso[open]');
    if (RESERVAS_HABILITADAS) {
      afirmar(await aviso.count() === 0, 'Aparece el aviso aunque las reservas están activas.');
      evidencias.push(await capturar(pagina, 'figura-8.01-inicio'));
    } else {
      afirmar(await aviso.isVisible(), 'No aparece el aviso de que aún no se reciben reservas.');
      evidencias.push(await capturar(pagina, 'figura-8.01-inicio'));
      await cerrarAviso(pagina);
      afirmar(await aviso.count() === 0, 'El aviso no se cierra.');
    }
  }],

  ['WEB-02', 'Menú', 'El menú tiene las 6 secciones públicas y ninguna opción de iniciar sesión, registrarse o perfil.',
  async ({ pagina, evidencias }) => {
    await ir(pagina, '/');
    await cerrarAviso(pagina);
    const rutas = await pagina.locator('#menu-principal a.nav-link').evaluateAll(as => as.map(a => a.getAttribute('href')));
    afirmar(JSON.stringify(rutas) === JSON.stringify(['/', '/habitaciones', '/galeria', '/servicios', '/contacto', '/reservas']),
      `El menú tiene: ${rutas.join(', ')}`);
    const textoBarra = (await pagina.locator('nav.navbar').innerText()).toLowerCase();
    for (const p of ['iniciar sesión', 'registr', 'perfil', 'login'])
      afirmar(!textoBarra.includes(p), `La barra ofrece "${p}".`);
    evidencias.push(await capturar(pagina, 'figura-8.02-menu', { clip: { x: 0, y: 0, width: ESCRITORIO.width, height: 160 } }));
  }],

  ['WEB-03', 'Habitaciones', 'Muestra las habitaciones con foto, los filtros por piso y la opción de casa completa.',
  async ({ pagina, evidencias }) => {
    await ir(pagina, '/habitaciones');
    await cerrarAviso(pagina);
    const tarjetas = pagina.locator('.hab-card');
    afirmar(await tarjetas.count() === 7, `Hay ${await tarjetas.count()} habitaciones (se esperaban 7).`);
    // La foto de cada tarjeta es el fondo de .hab-card__imagen: se comprueba que exista y que el archivo sea una imagen.
    const fotos = await tarjetas.evaluateAll(cs => cs.map(c => {
      const m = getComputedStyle(c.querySelector('.hab-card__imagen')).backgroundImage.match(/url\("?([^")]+)"?\)/);
      return m ? m[1] : null;
    }));
    const sinFoto = [];
    for (const [i, url] of fotos.entries()) {
      const r = url ? await fetch(url).catch(() => null) : null;
      if (!r?.ok || !r.headers.get('content-type')?.startsWith('image/')) sinFoto.push(url ?? `tarjeta ${i + 1}`);
    }
    afirmar(sinFoto.length === 0, `Habitaciones sin foto: ${sinFoto.join(', ')}`);
    afirmar(await pagina.locator('.filtro-btn').count() >= 3, 'Faltan los filtros por piso.');
    afirmar(await pagina.getByText(/casa completa/i).first().isVisible().catch(() => false)
      || await pagina.locator('.pisos-section').getByText(/casa/i).count() > 0, 'No aparece la opción de casa completa.');
    evidencias.push(await capturar(pagina, 'figura-8.03-habitaciones'));
  }],

  ['WEB-04', 'Habitaciones', 'El filtro "Piso 2" deja solo las habitaciones del segundo piso.',
  async ({ pagina, evidencias }) => {
    await ir(pagina, '/habitaciones');
    await cerrarAviso(pagina);
    await pagina.locator('.filtro-btn', { hasText: '2' }).first().click();
    await pagina.waitForTimeout(400);
    const tarjetas = pagina.locator('.hab-card');
    const total = await tarjetas.count();
    const delPiso2 = await pagina.locator('.hab-card.hab-card--piso2').count();
    afirmar(total === 4 && delPiso2 === 4, `Con "Piso 2" quedan ${total} tarjetas, ${delPiso2} del segundo piso (se esperaban 4 y 4).`);
    await tarjetas.first().scrollIntoViewIfNeeded();
    evidencias.push(await capturar(pagina, 'figura-8.04-filtro-piso-2'));
  }],

  ['WEB-05', 'Habitaciones', '"Ver detalle" abre la ficha de la habitación con sus fotos, capacidad, cama, baño y precio.',
  async ({ pagina, evidencias }) => {
    await ir(pagina, '/habitaciones');
    await cerrarAviso(pagina);
    await pagina.locator('.btn-ver-detalle').first().click();
    const ficha = pagina.locator('.modal-box');
    await ficha.waitFor({ state: 'visible', timeout: 5000 });
    afirmar(await ficha.locator('.modal-galeria img').count() > 0, 'La ficha no tiene fotos.');
    afirmar(await ficha.locator('.modal-dato').count() >= 4, 'La ficha no muestra capacidad, cama, baño y demás datos.');
    afirmar(/\$\s?\d/.test(await ficha.locator('.modal-precio').innerText()), 'La ficha no muestra el precio.');
    await pagina.waitForTimeout(500);
    evidencias.push(await capturar(pagina, 'figura-8.05-detalle-habitacion'));
  }],

  ['WEB-06', 'Galería', 'La galería carga las fotos del hospedaje sin imágenes rotas.',
  async ({ pagina, evidencias }) => {
    await ir(pagina, '/galeria');
    await cerrarAviso(pagina);
    // Las fotos cargan al acercarse (loading="lazy"): se recorre la página para que todas se pidan.
    for (let y = 0; y < 30; y++) {
      const fin = await pagina.evaluate(() => { window.scrollBy(0, 700); return innerHeight + scrollY >= document.body.scrollHeight - 5; });
      await pagina.waitForTimeout(150);
      if (fin) break;
    }
    await pagina.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    const fotos = await pagina.locator('.galeria-item img').evaluateAll(is => is.map(i => ({ src: i.getAttribute('src'), ok: i.complete && i.naturalWidth > 0 })));
    afirmar(fotos.length > 0, 'La galería no tiene fotos.');
    const rotas = fotos.filter(f => !f.ok).map(f => f.src);
    afirmar(rotas.length === 0, `Fotos rotas: ${rotas.join(', ')}`);
    await pagina.evaluate(() => window.scrollTo(0, 0));
    await pagina.waitForTimeout(400);
    evidencias.push(await capturar(pagina, 'figura-8.06-galeria'));
    return `${fotos.length} fotos cargadas`;
  }],

  ['WEB-07', 'Servicios', 'La página de servicios carga.',
  async ({ pagina, evidencias }) => {
    await ir(pagina, '/servicios');
    await cerrarAviso(pagina);
    afirmar(await pagina.locator('app-servicios h1').isVisible(), 'La página de servicios no muestra su título.');
    evidencias.push(await capturar(pagina, 'figura-8.07-servicios'));
  }],

  ['WEB-08', 'Contacto', 'Con el formulario vacío, el botón "Enviar Mensaje" está deshabilitado.',
  async ({ pagina, evidencias }) => {
    await ir(pagina, '/contacto');
    await cerrarAviso(pagina);
    const enviar = pagina.locator('.btn-enviar');
    await enviar.scrollIntoViewIfNeeded();
    afirmar(await enviar.isDisabled(), 'El botón de enviar está activo con el formulario vacío.');
    await pagina.locator('.contacto-form').scrollIntoViewIfNeeded();
    evidencias.push(await capturar(pagina, 'figura-8.08-contacto-vacio'));
  }],

  ['WEB-09', 'Contacto', 'Con un correo mal escrito ("correo-sin-arroba") el formulario no se puede enviar.',
  async ({ pagina, evidencias }) => {
    await ir(pagina, '/contacto');
    await cerrarAviso(pagina);
    await pagina.fill('#nombre', 'Prueba E2E');
    await pagina.fill('#email', 'correo-sin-arroba');
    await pagina.fill('#telefono', '3001234567');
    await pagina.selectOption('#asunto', { index: 1 });
    await pagina.fill('#mensaje', 'Mensaje de prueba automática. No se envía.');
    await pagina.check('input[name="politica"]');
    await pagina.locator('#email').scrollIntoViewIfNeeded();
    await pagina.waitForTimeout(300);
    evidencias.push(await capturar(pagina, 'figura-8.09-contacto-correo-invalido'));
    // Solo se revisa el botón: la prueba nunca hace clic en enviar.
    afirmar(await pagina.locator('.btn-enviar').isDisabled(), 'El botón "Enviar Mensaje" queda activo con el correo "correo-sin-arroba" (defecto D-W1).');
  }],

  ['WEB-10', 'Reservas', RESERVAS_HABILITADAS
    ? 'Muestra el asistente de reserva con sus 4 pasos (Tu viaje, Tu espacio, Tus datos, Confirmar y pagar).'
    : 'Muestra "Aún no recibimos reservas en línea", porque las reservas están deshabilitadas.',
  async ({ pagina, evidencias }) => {
    await ir(pagina, '/reservas');
    if (RESERVAS_HABILITADAS) {
      afirmar(await pagina.locator('dialog.aviso[open], app-aviso-preparacion .aviso').count() === 0, 'Aparece el aviso de reservas deshabilitadas.');
      const pasos = await pagina.locator('.paso__nombre').allInnerTexts();
      afirmar(pasos.length === 4, `El asistente tiene ${pasos.length} pasos: ${pasos.join(', ')}`);
      evidencias.push(await capturar(pagina, 'figura-8.10-reservas'));
      return `Pasos: ${pasos.join(' → ')}`;
    }
    afirmar(await pagina.locator('app-aviso-preparacion .aviso').isVisible(), 'No aparece el aviso en /reservas.');
    evidencias.push(await capturar(pagina, 'figura-8.10-reservas'));
  }],

  ['WEB-11', 'Pagos', RESERVAS_HABILITADAS
    ? 'Sin una reserva no se puede pagar: /pagos sin reserva avisa que no la encontró y no muestra el botón de pago.'
    : 'Muestra el mismo aviso: no se puede pagar mientras las reservas están deshabilitadas.',
  async ({ pagina, evidencias }) => {
    await ir(pagina, '/pagos');
    if (RESERVAS_HABILITADAS) {
      const error = pagina.locator('.error-text[role="alert"]');
      await error.waitFor({ state: 'visible', timeout: 8000 });
      afirmar(/reserva/i.test(await error.innerText()), 'El mensaje no habla de la reserva.');
      afirmar(await pagina.getByRole('button', { name: /pagar/i }).count() === 0, 'Muestra un botón de pagar sin reserva.');
      evidencias.push(await capturar(pagina, 'figura-8.17-pagos-sin-reserva'));
      return `Mensaje: "${(await error.innerText()).trim()}"`;
    }
    afirmar(await pagina.locator('app-aviso-preparacion .aviso').isVisible(), 'No aparece el aviso en /pagos.');
  }],

  ['WEB-12', 'Políticas', 'La página de políticas y reglamento carga.',
  async ({ pagina, evidencias }) => {
    await ir(pagina, '/politicas');
    await cerrarAviso(pagina);
    afirmar(await pagina.locator('h1').first().isVisible(), 'Políticas no muestra su título.');
    afirmar((await pagina.locator('main, body').first().innerText()).length > 1000, 'Políticas no muestra los documentos.');
    evidencias.push(await capturar(pagina, 'figura-8.11-politicas'));
  }],

  ['WEB-13', 'Idiomas', 'Hay 6 idiomas y al cambiar a inglés el menú se traduce.',
  async ({ pagina, evidencias }) => {
    await ir(pagina, '/');
    await cerrarAviso(pagina);
    // Si el clic llega antes de que Angular termine de arrancar no abre la lista: se reintenta.
    const lista = pagina.locator('.language-dropdown.show');
    for (let i = 0; i < 3 && !(await lista.count()); i++) {
      await pagina.locator('.language-btn:visible').first().click();
      await lista.first().waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
    }
    const opciones = lista.locator('.language-option');
    afirmar(await opciones.count() === 6, `Hay ${await opciones.count()} idiomas.`);
    await opciones.and(pagina.locator('[lang="en"]')).click();
    await pagina.waitForTimeout(800);
    const menu = await pagina.locator('#menu-principal a.nav-link').allInnerTexts();
    afirmar(menu.some(t => /rooms/i.test(t)) && menu.some(t => /^\s*home\s*$/i.test(t)), `El menú no se tradujo: ${menu.join(', ')}`);
    afirmar(await pagina.evaluate(() => document.documentElement.lang) === 'en', 'La página no cambió su idioma (lang).');
    evidencias.push(await capturar(pagina, 'figura-8.12-idioma-ingles'));
    return `Menú en inglés: ${menu.map(t => t.trim()).join(', ')}`;
  }],

  ['WEB-14', 'Accesibilidad', 'El panel de accesibilidad abre y aumenta el tamaño del texto.',
  async ({ pagina, evidencias }) => {
    await ir(pagina, '/');
    await cerrarAviso(pagina);
    const tam = () => pagina.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
    const antes = await tam();
    await pagina.locator('button.disparador').click();
    const panel = pagina.locator('#panel-accesibilidad');
    await panel.waitFor({ state: 'visible', timeout: 5000 });
    await panel.locator('.texto button').last().click();
    await pagina.waitForTimeout(300);
    const despues = await tam();
    afirmar(despues > antes, `El texto no creció (${antes}px → ${despues}px).`);
    evidencias.push(await capturar(pagina, 'figura-8.13-accesibilidad'));
    return `Texto de ${antes}px a ${despues}px`;
  }],

  ['WEB-15', 'Asistente', 'El asistente de ayuda abre con el saludo y responde una pregunta frecuente.',
  async ({ pagina, evidencias }) => {
    await ir(pagina, '/');
    await cerrarAviso(pagina);
    await pagina.locator('button.lanzador').click();
    const ventana = pagina.locator('section.ventana');
    await ventana.waitFor({ state: 'visible', timeout: 5000 });
    const mensajes = ventana.locator('.mensaje__burbuja:not(.escribiendo)');
    afirmar(await mensajes.count() >= 1, 'El asistente no saluda.');
    const antes = await mensajes.count();
    await pagina.fill('#chatbot-campo', '¿A qué hora es el check-in?');
    await pagina.locator('.entrada__enviar').click();
    // Espera la pregunta y la respuesta (no la burbuja de "escribiendo…").
    await pagina.waitForFunction(n => document.querySelectorAll('section.ventana .mensaje__burbuja:not(.escribiendo)').length >= n + 2
      && !document.querySelector('section.ventana .escribiendo'), antes, { timeout: 15_000 });
    const respuesta = (await mensajes.last().innerText()).trim();
    afirmar(respuesta.length > 10, 'El asistente no respondió.');
    await pagina.waitForTimeout(400);
    evidencias.push(await capturar(pagina, 'figura-8.14-asistente'));
    return `Respuesta: "${respuesta.slice(0, 90)}${respuesta.length > 90 ? '…' : ''}"`;
  }],

  ['WEB-16', 'Sin inicio de sesión', 'La dirección /login no existe y lleva al inicio: la página web no tiene inicio de sesión.',
  async ({ pagina }) => {
    await ir(pagina, '/login');
    await pagina.waitForURL(u => new URL(u).pathname === '/', { timeout: 8000 });
    afirmar(await pagina.locator('input[type="password"]').count() === 0, 'Hay un campo de contraseña.');
  }],

  ['WEB-17', 'Celular', 'En vista de celular (390×844) el menú se abre con el botón de hamburguesa.',
  async ({ pagina, evidencias }) => {
    await pagina.setViewportSize(CELULAR);
    await ir(pagina, '/');
    await cerrarAviso(pagina);
    const menu = pagina.locator('#menu-principal');
    afirmar(!(await menu.locator('a.nav-link').first().isVisible()), 'El menú ya está abierto sin tocar la hamburguesa.');
    await pagina.locator('button.hamburger').click();
    await pagina.waitForTimeout(500);
    afirmar(await menu.locator('a.nav-link').last().isVisible(), 'El menú no se abre con la hamburguesa.');
    afirmar(await pagina.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'La página se desborda a lo ancho.');
    evidencias.push(await capturar(pagina, 'figura-8.15-celular-menu'));
  }],

  ['WEB-18', 'Prerenderizado', 'Inicio, Habitaciones, Galería y Servicios traen su contenido en el HTML: funcionan para buscadores y aunque el API esté caído.',
  async () => {
    const detalle = [];
    for (const ruta of ['/', '/habitaciones', '/galeria', '/servicios']) {
      const html = await (await fetch(BASE + ruta)).text();
      const cuerpo = html.slice(html.indexOf('<app-root'));
      const texto = cuerpo.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      afirmar(/<h1[\s>]/.test(cuerpo) && texto.length > 500, `${ruta} llega vacío en el HTML (${texto.length} caracteres de texto).`);
      detalle.push(`${ruta}: ${texto.length} caracteres`);
    }
    return detalle.join(' · ');
  }],
];

// Revisión de rutas del hallazgo D-W2 (no es una de las 19 pruebas): /reset-password sigue pública.
async function figuraResetPassword(navegador) {
  const ctx = await navegador.newContext({ viewport: ESCRITORIO, locale: 'es-CO' });
  const pagina = await ctx.newPage();
  await ir(pagina, '/reset-password');
  await cerrarAviso(pagina);
  const archivo = await capturar(pagina, 'figura-8.16-reset-password');
  await ctx.close();
  return archivo;
}

// ───────────────────────── ejecución
const { navegador, nombre: nombreNavegador } = await abrirNavegador();
console.log(`Probando ${BASE} con ${nombreNavegador} · reservas en línea ${RESERVAS_HABILITADAS ? 'activas' : 'deshabilitadas'}\n`);

const resultados = [];
for (const [codigo, pantalla, descripcion, fn] of pruebas) {
  const ctx = await navegador.newContext({ viewport: ESCRITORIO, locale: 'es-CO' });
  const pagina = await ctx.newPage();
  vigilar(pagina, codigo);
  const evidencias = [];
  const inicio = Date.now();
  let estado = 'Aprobada', detalle = '';
  try {
    detalle = (await fn({ pagina, evidencias })) ?? '';
  } catch (e) {
    estado = 'Fallida';
    detalle = e.message.split('\n')[0];
  }
  await ctx.close();
  resultados.push({ codigo, pantalla, descripcion, estado, detalle, evidencias, ms: Date.now() - inicio });
  console.log(`${estado === 'Aprobada' ? '✔' : '✘'} ${codigo} ${pantalla}: ${estado}${detalle ? ' — ' + detalle : ''}`);
}

// WEB-19: ninguna de las pantallas anteriores dejó errores de JavaScript.
resultados.push({
  codigo: 'WEB-19', pantalla: 'Transversal', descripcion: 'Ninguna pantalla recorrida dejó errores de JavaScript en la consola.',
  estado: erroresJs.length ? 'Fallida' : 'Aprobada', detalle: erroresJs.slice(0, 10).join(' | '), evidencias: [], ms: 0,
});
console.log(`${erroresJs.length ? '✘' : '✔'} WEB-19 Transversal: ${erroresJs.length ? 'Fallida — ' + erroresJs.join(' | ') : 'Aprobada'}`);

const figura816 = await figuraResetPassword(navegador);
await navegador.close();

const aprobadas = resultados.filter(r => r.estado === 'Aprobada').length;
fs.writeFileSync(path.join(CAPTURAS, 'resultados.json'), JSON.stringify({
  fecha: new Date().toISOString(), sitio: BASE, navegador: nombreNavegador, reservasHabilitadas: RESERVAS_HABILITADAS,
  aprobadas, total: resultados.length, resultados, revisionRutasDW2: figura816,
}, null, 2) + '\n');
console.log(`\n${aprobadas}/${resultados.length} aprobadas. Capturas en ${CAPTURAS}`);
process.exitCode = aprobadas === resultados.length ? 0 : 1;
