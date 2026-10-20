import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DatosHospedaje, HOSPEDAJE_POR_DEFECTO } from '../data/politicas';

interface HospedajeApi {
  commercialName?: string; legalName?: string; nit?: string; rnt?: string;
  address?: string; municipality?: string; phone?: string; mobile?: string; email?: string;
}

/**
 * Datos del hospedaje (nombre, razón social, NIT, RNT, contacto) que se editan
 * en SOGO. Se piden una sola vez; si no llegan, quedan los de por defecto.
 */
@Injectable({ providedIn: 'root' })
export class HospedajeService {
  private readonly http = inject(HttpClient);
  private pedido = false;

  readonly datos = signal<DatosHospedaje>(HOSPEDAJE_POR_DEFECTO);

  cargar(): void {
    if (this.pedido) return;
    this.pedido = true;
    this.http.get<HospedajeApi>(`${environment.apiUrl}/hospedaje`).subscribe({
      next: h => {
        const d = HOSPEDAJE_POR_DEFECTO;
        const direccion = [h.address, h.municipality].filter(Boolean).join(', ');
        const telefonos = [h.mobile, h.phone].filter(Boolean).join(' · ');
        this.datos.set({
          nombre: h.commercialName || d.nombre,
          razonSocial: h.legalName || '',
          nit: h.nit || '',
          rnt: h.rnt || '',
          direccion: direccion || d.direccion,
          correo: h.email || d.correo,
          telefonos: telefonos || d.telefonos,
          whatsapp: d.whatsapp,
        });
      },
      error: () => { this.pedido = false; },
    });
  }
}
