import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icono } from '../../../shared/icono';
import { ReservaEstado } from '../reserva-estado';
import { formatCOP, formatFecha, plural } from '../reserva.catalogo';
import { INDICATIVOS } from '../indicativos';

/** Paso final: revisar todo (editable por partes), aceptar políticas y pagar. */
@Component({
  selector: 'app-paso-confirmar',
  imports: [FormsModule, Icono],
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

  readonly pais = computed(() => INDICATIVOS.find(p => p.iso === this.estado.datos().pais)?.nombre ?? '');
}
