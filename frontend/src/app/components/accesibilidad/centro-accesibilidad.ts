import {
  ChangeDetectionStrategy, Component, ElementRef, HostListener, Injector, afterNextRender, inject, signal, viewChild,
} from '@angular/core';
import { Icono, IconoNombre } from '../../shared/icono';
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
  imports: [Icono],
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
      titulo: 'Visualización',
      opciones: [
        { id: 'contraste', titulo: 'Alto contraste', ayuda: 'Colores más intensos y texto más oscuro', icono: 'contraste' },
        { id: 'grises', titulo: 'Escala de grises', ayuda: 'Quita los colores (útil con daltonismo)', icono: 'gotas' },
        { id: 'enlaces', titulo: 'Resaltar enlaces', ayuda: 'Subraya y marca todos los enlaces', icono: 'link' },
      ],
    },
    {
      titulo: 'Lectura',
      opciones: [
        { id: 'espaciado', titulo: 'Más espaciado', ayuda: 'Más espacio entre letras, palabras y líneas', icono: 'espaciado' },
        { id: 'fuente', titulo: 'Fuente legible', ayuda: 'Letra más simple y fácil de leer', icono: 'tipografia' },
      ],
    },
    {
      titulo: 'Navegación',
      opciones: [
        { id: 'foco', titulo: 'Foco reforzado', ayuda: 'Marca muy visible al navegar con teclado', icono: 'teclado' },
        { id: 'cursor', titulo: 'Cursor grande', ayuda: 'Puntero del mouse más grande', icono: 'cursor' },
        { id: 'sinAnimacion', titulo: 'Sin animaciones', ayuda: 'Detiene movimientos y carruseles', icono: 'pausa' },
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
