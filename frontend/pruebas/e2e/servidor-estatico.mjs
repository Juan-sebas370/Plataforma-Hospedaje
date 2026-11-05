// Sirve la compilación de producción (dist/frontend/browser) como lo hace Cloudflare Pages:
// - /ruta  → /ruta/index.html (páginas prerenderizadas) o /ruta.html
// - reglas "200" de public/_redirects (las rutas que se dibujan en el navegador → /index.csr.html)
// - cualquier otra ruta → /index.html (Pages hace lo mismo cuando no hay 404.html)
//
// Uso (en frontend/, después de `npx ng build`):  node pruebas/e2e/servidor-estatico.mjs [puerto]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FRONTEND = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const RAIZ = path.resolve(process.env.DIST ?? path.join(FRONTEND, 'dist/frontend/browser'));
const PUERTO = Number(process.argv[2] ?? process.env.PUERTO ?? 4310);

if (!fs.existsSync(path.join(RAIZ, 'index.html'))) {
  console.error(`No existe ${RAIZ}/index.html. Compila primero con: npx ng build`);
  process.exit(1);
}

const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json',
};

/** Reglas "origen destino 200" de _redirects, convertidas a expresiones regulares. */
const reglas = fs.readFileSync(path.join(RAIZ, '_redirects'), 'utf8').split('\n')
  .map(l => l.trim()).filter(l => l && !l.startsWith('#'))
  .map(l => l.split(/\s+/))
  .filter(([, , codigo]) => codigo === '200')
  .map(([origen, destino]) => ({ patron: new RegExp('^' + origen.replace(/:\w+/g, '[^/]+') + '/?$'), destino }));

const archivo = rel => {
  const p = path.join(RAIZ, rel);
  return p.startsWith(RAIZ) && fs.existsSync(p) && fs.statSync(p).isFile() ? p : null;
};

function resolver(ruta) {
  return archivo(ruta)
    ?? archivo(path.join(ruta, 'index.html'))
    ?? archivo(ruta.replace(/\/$/, '') + '.html')
    ?? (() => { const r = reglas.find(x => x.patron.test(ruta)); return r ? archivo(r.destino + '.html') ?? archivo(r.destino) : null; })()
    ?? archivo('index.html');
}

http.createServer((req, res) => {
  const ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const p = resolver(ruta);
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(p)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(p).pipe(res);
}).listen(PUERTO, () => console.log(`Sirviendo ${RAIZ} en http://localhost:${PUERTO}`));
