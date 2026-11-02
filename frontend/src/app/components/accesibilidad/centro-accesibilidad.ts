import {
  ChangeDetectionStrategy, Component, ElementRef, HostListener, Injector, afterNextRender, inject, signal, viewChild,
} from '@angular/core';
import { Icono, IconoNombre } from '../../shared/icono';
import { TranslatePipe } from '../../shared/translate.pipe';
import { AccesibilidadService, OpcionAccesibilidad } from '../../services/accesibilidad.service';

interface Opcion {
  id: OpcionAccesibilidad;
  titulo: string;
  ayuda: string;
  icono: IconoNombre;
}

/**
 * Centro de accesibilidad: un desplegable en la barra de navegación con
 * ajustes de texto, visualización y navegación. Es un complemento; el sitio
 * cumple WCAG 2.2 AA sin necesidad de activar nada aquí.
 */
@Component({
  selector: 'app-centro-accesibilidad',
  imports: [Icono, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './centro-accesibilidad.html',
  styleUrl: './centro-accesibilidad.css',
})
export class CentroAccesibilidad {
  readonly a11y = inject(AccesibilidadService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  private readonly boton = viewChild.required<ElementRef<HTMLButtonElement>>('boton');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  readonly abierto = signal(false);

  readonly grupos: { titulo: string; opciones: Opcion[] }[] = [
    {
      titulo: 'a11y.visualizacion',
      opciones: [
        { id: 'contraste', titulo: 'a11y.contraste', ayuda: 'a11y.contrasteD', icono: 'contraste' },
        { id: 'grises', titulo: 'a11y.grises', ayuda: 'a11y.grisesD', icono: 'gotas' },
        { id: 'enlaces', titulo: 'a11y.enlaces', ayuda: 'a11y.enlacesD', icono: 'link' },
      ],
    },
    {
      titulo: 'a11y.lectura',
      opciones: [
        { id: 'espaciado', titulo: 'a11y.espaciado', ayuda: 'a11y.espaciadoD', icono: 'espaciado' },
        { id: 'fuente', titulo: 'a11y.fuente', ayuda: 'a11y.fuenteD', icono: 'tipografia' },
      ],
    },
    {
      titulo: 'a11y.navegacion',
      opciones: [
        { id: 'foco', titulo: 'a11y.foco', ayuda: 'a11y.focoD', icono: 'teclado' },
        { id: 'cursor', titulo: 'a11y.cursor', ayuda: 'a11y.cursorD', icono: 'cursor' },
        { id: 'sinAnimacion', titulo: 'a11y.sinAnimacion', ayuda: 'a11y.sinAnimacionD', icono: 'pausa' },
      ],
    },
  ];

  alternarPanel(): void {
    this.abierto() ? this.cerrar(true) : this.abrir();
  }

  private abrir(): void {
    this.abierto.set(true);
    // Lleva el foco al panel para que con Tab se recorran las opciones de inmediato.
    afterNextRender(() => this.panel()?.nativeElement.focus(), { injector: this.injector });
  }

  cerrar(devolverFoco = false): void {
    if (!this.abierto()) return;
    this.abierto.set(false);
    if (devolverFoco) this.boton().nativeElement.focus();
  }

  @HostListener('document:keydown.escape')
  alPresionarEscape(): void {
    this.cerrar(true);
  }

  @HostListener('document:click', ['$event'])
  alHacerClic(e: MouseEvent): void {
    if (!this.host.nativeElement.contains(e.target as Node)) this.cerrar();
  }

  /** Si el foco sale del panel con Tab, se cierra (no deja un menú abierto a la vista). */
  alPerderFoco(e: FocusEvent): void {
    const destino = e.relatedTarget as Node | null;
    if (destino && !this.host.nativeElement.contains(destino)) this.cerrar();
  }
}
