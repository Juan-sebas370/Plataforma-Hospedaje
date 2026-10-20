import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icono } from '../../../shared/icono';
import { ReservaEstado } from '../reserva-estado';
import { formatCOP, formatFecha, plural } from '../reserva.catalogo';
import { INDICATIVOS } from '../indicativos';
import { IdPolitica, puntosClave } from '../../../data/politicas';
import { PoliticaModal } from '../ui/politica-modal';

/** Paso final: revisar todo (editable por partes), aceptar políticas y pagar. */
@Component({
  selector: 'app-paso-confirmar',
  imports: [FormsModule, Icono, PoliticaModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../ui/reservas-ui.css', './paso-confirmar.css'],
  templateUrl: './paso-confirmar.html',
})
export class PasoConfirmar {
  readonly estado = inject(ReservaEstado);
  readonly formatCOP = formatCOP;
  readonly formatFecha = formatFecha;
  readonly plural = plural;

  readonly documento = computed(() => {
    const d = this.estado.datos();
    return `${d.tipoDocumento} ${d.numeroDocumento}`.trim();
  });

  /** Lo más importante de las políticas, a la vista junto a las casillas. */
  readonly puntos = computed(() => puntosClave(this.estado.esDia()));

  /** Casillas que faltan, solo después de intentar confirmar. */
  readonly faltaPoliticas = computed(() => this.estado.intentoFallido() === 'confirmar' && !this.estado.aceptaTerminos());
  readonly faltaDatos = computed(() => this.estado.intentoFallido() === 'confirmar' && !this.estado.autorizaDatos());

  /** Documento abierto en la ventana (null = cerrada). */
  readonly politica = signal<IdPolitica | null>(null);

  abrir(id: IdPolitica, e: Event): void {
    // El enlace está dentro de la etiqueta de la casilla: abrir el documento no debe marcarla
    e.preventDefault();
    e.stopPropagation();
    this.politica.set(id);
  }

  readonly pais = computed(() => INDICATIVOS.find(p => p.iso === this.estado.datos().pais)?.nombre ?? '');
}
