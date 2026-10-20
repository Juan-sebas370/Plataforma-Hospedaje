import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type OpcionAccesibilidad =
  | 'contraste' | 'grises' | 'enlaces' | 'espaciado' | 'fuente' | 'foco' | 'cursor' | 'sinAnimacion';

export interface PreferenciasAccesibilidad {
  tamanoTexto: number;   // índice en ESCALAS_TEXTO
  contraste: boolean;
  grises: boolean;
  enlaces: boolean;
  espaciado: boolean;
  fuente: boolean;
  foco: boolean;
  cursor: boolean;
  sinAnimacion: boolean;
}

export const ESCALAS_TEXTO = [87.5, 100, 112.5, 125, 137.5, 150];
const TEXTO_NORMAL = 1;
const CLAVE = 'hs-accesibilidad';

const CLASES: Record<OpcionAccesibilidad, string> = {
  contraste: 'a11y-contraste',
  grises: 'a11y-grises',
  enlaces: 'a11y-enlaces',
  espaciado: 'a11y-espaciado',
  fuente: 'a11y-fuente',
  foco: 'a11y-foco',
  cursor: 'a11y-cursor',
  sinAnimacion: 'a11y-sin-animacion',
};

const POR_DEFECTO: PreferenciasAccesibilidad = {
  tamanoTexto: TEXTO_NORMAL, contraste: false, grises: false, enlaces: false,
  espaciado: false, fuente: false, foco: false, cursor: false, sinAnimacion: false,
};

/**
 * Preferencias del Centro de accesibilidad. Se guardan en el navegador y se
 * aplican como clases en <html> (ver la sección ACCESIBILIDAD de styles.css).
 * Es un complemento: el sitio ya es accesible sin activar nada.
 */
@Injectable({ providedIn: 'root' })
export class AccesibilidadService {
  private readonly documento = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly preferencias = signal<PreferenciasAccesibilidad>(this.leer());

  readonly porcentajeTexto = computed(() => ESCALAS_TEXTO[this.preferencias().tamanoTexto]);
  readonly puedeAumentar = computed(() => this.preferencias().tamanoTexto < ESCALAS_TEXTO.length - 1);
  readonly puedeDisminuir = computed(() => this.preferencias().tamanoTexto > 0);
  readonly hayCambios = computed(() => JSON.stringify(this.preferencias()) !== JSON.stringify(POR_DEFECTO));
  readonly cantidadActivas = computed(() => {
    const p = this.preferencias();
    return (Object.keys(CLASES) as OpcionAccesibilidad[]).filter(k => p[k]).length
      + (p.tamanoTexto !== TEXTO_NORMAL ? 1 : 0);
  });

  /** Animaciones automáticas (carruseles) deben detenerse si la persona lo pidió aquí o en su sistema. */
  readonly movimientoReducido = computed(() => this.preferencias().sinAnimacion || this.sistemaPideMenosMovimiento);
  private readonly sistemaPideMenosMovimiento =
    this.isBrowser && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  constructor() {
    effect(() => {
      const p = this.preferencias();
      if (!this.isBrowser) return;
      const html = this.documento.documentElement;
      for (const [opcion, clase] of Object.entries(CLASES)) {
        html.classList.toggle(clase, p[opcion as OpcionAccesibilidad]);
      }
      html.style.fontSize = p.tamanoTexto === TEXTO_NORMAL ? '' : `${ESCALAS_TEXTO[p.tamanoTexto]}%`;
      try { localStorage.setItem(CLAVE, JSON.stringify(p)); } catch { /* sin almacenamiento */ }
    });
  }

  alternar(opcion: OpcionAccesibilidad): void {
    this.preferencias.update(p => ({ ...p, [opcion]: !p[opcion] }));
  }

  cambiarTexto(delta: number): void {
    this.preferencias.update(p => ({
      ...p,
      tamanoTexto: Math.min(ESCALAS_TEXTO.length - 1, Math.max(0, p.tamanoTexto + delta)),
    }));
  }

  textoNormal(): void {
    this.preferencias.update(p => ({ ...p, tamanoTexto: TEXTO_NORMAL }));
  }

  restablecer(): void {
    this.preferencias.set({ ...POR_DEFECTO });
  }

  private leer(): PreferenciasAccesibilidad {
    if (!this.isBrowser) return { ...POR_DEFECTO };
    try {
      const guardadas = JSON.parse(localStorage.getItem(CLAVE) ?? 'null');
      return guardadas ? { ...POR_DEFECTO, ...guardadas } : { ...POR_DEFECTO };
    } catch {
      return { ...POR_DEFECTO };
    }
  }
}
