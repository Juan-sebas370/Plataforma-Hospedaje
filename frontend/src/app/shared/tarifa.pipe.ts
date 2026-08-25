import { Pipe, PipeTransform } from '@angular/core';
import { Tarifa } from '../components/reservas/reservas';

@Pipe({ name: 'tarifa', standalone: true })
export class TarifaPipe implements PipeTransform {
  transform(tarifas: Tarifa[], opcion: string, temporada: 'baja' | 'media' | 'alta'): number {
    return tarifas.find(t => t.opcion === opcion)?.[temporada] ?? 0;
  }
}
