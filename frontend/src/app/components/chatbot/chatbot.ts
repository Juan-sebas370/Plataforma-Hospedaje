import {
  ChangeDetectionStrategy, Component, ElementRef, HostListener, Injector, PLATFORM_ID,
  afterNextRender, computed, effect, inject, signal, viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, firstValueFrom, map } from 'rxjs';
import { Icono } from '../../shared/icono';
import { Language, TranslateService } from '../../services/translate.service';
import { AccesibilidadService } from '../../services/accesibilidad.service';
import { TarifaService } from '../../services/tarifa.service';
import { formatCOP } from '../reservas/reserva.catalogo';
import { Accion, INTENCIONES, SUGERENCIAS_INICIALES, UI } from './conocimiento';
import { MOTOR_CHATBOT, RespuestaBot } from './motor';

interface Mensaje {
  id: number;
  autor: 'bot' | 'usuario';
  texto: string;
  acciones: Accion[];
  sugerencias: string[];
}

const CLAVE_CONVERSACION = 'hs-chatbot';

/**
 * Asistente virtual de todo el sitio: botón flotante + ventana de
 * conversación con preguntas sugeridas, respuestas y enlaces a las secciones
 * del sitio. Responde en el idioma elegido en el selector de idioma.
 */
@Component({
  selector: 'app-chatbot',
  imports: [Icono, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css',
})
export class Chatbot {
  private readonly motor = inject(MOTOR_CHATBOT);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly accesibilidad = inject(AccesibilidadService);
  private readonly tarifas = inject(TarifaService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly lanzador = viewChild.required<ElementRef<HTMLButtonElement>>('lanzador');
  private readonly campo = viewChild<ElementRef<HTMLInputElement>>('campo');
  private readonly historial = viewChild<ElementRef<HTMLElement>>('historial');

  readonly idioma = toSignal(inject(TranslateService).currentLang$, { initialValue: 'es' as Language });
  readonly abierto = signal(false);
  readonly escribiendo = signal(false);
  readonly consulta = signal('');
  readonly mensajes = signal<Mensaje[]>(this.leerConversacion());
  private siguienteId = this.mensajes().reduce((m, x) => Math.max(m, x.id), 0) + 1;

  /** En /reservas (celular) hay una barra de acciones fija abajo: el botón sube para no taparla. */
  readonly elevado = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects.startsWith('/reservas')),
    ),
    { initialValue: this.isBrowser && location.pathname.startsWith('/reservas') },
  );

  /** Las sugerencias solo se muestran bajo el último mensaje del asistente. */
  readonly ultimoBot = computed(() => [...this.mensajes()].reverse().find(m => m.autor === 'bot')?.id ?? null);

  constructor() {
    effect(() => {
      const mensajes = this.mensajes();
      if (!this.isBrowser) return;
      try { sessionStorage.setItem(CLAVE_CONVERSACION, JSON.stringify(mensajes.slice(-40))); } catch { /* sin almacenamiento */ }
    });
  }

  t(clave: string): string {
    return UI[clave][this.idioma()];
  }

  preguntaDe(id: string): string {
    return INTENCIONES.find(i => i.id === id)?.pregunta[this.idioma()] ?? id;
  }

  etiqueta(accion: Accion): string {
    return accion.etiqueta[this.idioma()];
  }

  // ── Abrir / cerrar ───────────────────────────────────────
  alternar(): void {
    this.abierto() ? this.cerrar() : this.abrir();
  }

  abrir(): void {
    if (!this.mensajes().length) this.saludar();
    this.abierto.set(true);
    afterNextRender(() => {
      this.bajarAlFinal();
      this.campo()?.nativeElement.focus();
    }, { injector: this.injector });
  }

  cerrar(): void {
    if (!this.abierto()) return;
    this.abierto.set(false);
    this.lanzador().nativeElement.focus();
  }

  @HostListener('document:keydown.escape')
  alPresionarEscape(): void {
    this.cerrar();
  }

  reiniciar(): void {
    this.mensajes.set([]);
    this.saludar();
    this.campo()?.nativeElement.focus();
  }

  private saludar(): void {
    this.agregar({ autor: 'bot', texto: this.t('saludo'), acciones: [], sugerencias: SUGERENCIAS_INICIALES });
  }

  // ── Conversación ─────────────────────────────────────────
  async enviar(evento?: Event): Promise<void> {
    evento?.preventDefault();
    const texto = this.consulta().trim();
    if (!texto || this.escribiendo()) return;
    this.consulta.set('');
    this.agregar({ autor: 'usuario', texto, acciones: [], sugerencias: [] });
    await this.contestar(() => this.motor.responder(texto, this.idioma()));
  }

  async elegirSugerencia(id: string): Promise<void> {
    if (this.escribiendo()) return;
    this.agregar({ autor: 'usuario', texto: this.preguntaDe(id), acciones: [], sugerencias: [] });
    await this.contestar(async () => this.motor.responderIntencion(id, this.idioma()));
    this.campo()?.nativeElement.focus();
  }

  /** Al seguir un enlace en el celular, la ventana se cierra para ver la página. */
  alSeguirEnlace(): void {
    if (this.isBrowser && window.innerWidth < 640) this.abierto.set(false);
  }

  private async contestar(obtener: () => Promise<RespuestaBot>): Promise<void> {
    this.escribiendo.set(true);
    this.bajarAlFinal();
    const pausa = this.accesibilidad.movimientoReducido() ? 0 : 450;
    const [respuesta] = await Promise.all([obtener(), new Promise(r => setTimeout(r, pausa))]);
    const texto = await this.conPrecios(respuesta.texto);
    this.escribiendo.set(false);
    this.agregar({ autor: 'bot', texto, acciones: respuesta.acciones, sugerencias: respuesta.sugerencias });
  }

  /**
   * Las respuestas con precios traen marcadores ({individual}, {pasadia}…):
   * se reemplazan por la tarifa por persona en temporada baja de la base de
   * datos (editable en SOGO), para que el chat nunca cite precios viejos.
   */
  private async conPrecios(texto: string): Promise<string> {
    if (!texto.includes('{')) return texto;
    try { await firstValueFrom(this.tarifas.cargar()); } catch { /* sin tarifas: se usa el respaldo */ }
    return texto.replace(/\{(individual|familiar|pasadia|grupal)\}/g, (_, tipo: string) => {
      const t = this.tarifas.de(tipo);
      return t ? formatCOP(t.baja) : '…';
    });
  }

  private agregar(m: Omit<Mensaje, 'id'>): void {
    this.mensajes.update(lista => [...lista, { ...m, id: this.siguienteId++ }]);
    this.bajarAlFinal();
  }

  private bajarAlFinal(): void {
    if (!this.isBrowser) return;
    afterNextRender(() => {
      const h = this.historial()?.nativeElement;
      if (h) h.scrollTop = h.scrollHeight;
    }, { injector: this.injector });
  }

  private leerConversacion(): Mensaje[] {
    if (typeof sessionStorage === 'undefined') return [];
    try {
      return JSON.parse(sessionStorage.getItem(CLAVE_CONVERSACION) ?? '[]');
    } catch {
      return [];
    }
  }
}
