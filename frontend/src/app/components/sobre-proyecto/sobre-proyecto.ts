import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icono } from '../../shared/icono';

/**
 * Franja discreta al final del inicio sobre el origen del proyecto, con una
 * ventana "Sobre el proyecto" (elemento <dialog> nativo: mantiene el foco
 * adentro, cierra con Escape y lo anuncian bien los lectores de pantalla).
 */
@Component({
  selector: 'app-sobre-proyecto',
  imports: [RouterLink, Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sobre-proyecto.html',
  styleUrl: './sobre-proyecto.css',
})
export class SobreProyecto {
  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  abrir(): void {
    this.dialogo().nativeElement.showModal();
  }

  cerrar(): void {
    this.dialogo().nativeElement.close();
  }

  /** Clic en el fondo oscuro (fuera de la tarjeta) también cierra. */
  alHacerClicEnDialogo(e: MouseEvent): void {
    if (e.target === this.dialogo().nativeElement) this.cerrar();
  }
}
