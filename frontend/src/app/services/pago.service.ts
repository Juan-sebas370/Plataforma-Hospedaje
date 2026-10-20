import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/** Datos firmados por el backend para abrir el Widget de Checkout de Wompi. */
export interface WompiCheckout {
  publicKey: string;
  reference: string;
  amountInCents: number;
  currency: string;
  signature: string;
}

@Injectable({
  providedIn: 'root',
})
export class PagoService {
  private apiUrl = `${environment.apiUrl}/reservas`;

  constructor(private http: HttpClient) {}

  /**
   * Pide al backend los datos firmados (llave pública, referencia, monto,
   * firma de integridad) para pagar una reserva con el Widget de Wompi. El
   * monto siempre lo calcula el servidor a partir de la reserva — nunca se
   * envía desde el frontend.
   */
  iniciarCheckoutWompi(reservaId: number, codigo: string): Observable<WompiCheckout> {
    return this.http.get<WompiCheckout>(`${this.apiUrl}/${reservaId}/checkout-wompi`, { params: { codigo } });
  }

  /**
   * Pide al backend que consulte a Wompi el estado real de una transacción y,
   * si está aprobada, confirme la reserva. Devuelve el estado según Wompi
   * (APPROVED, DECLINED, PENDING, VOIDED, ERROR).
   */
  verificarPagoWompi(reservaId: number, transaccionId: string, codigo: string): Observable<{ estado: string }> {
    return this.http.post<{ estado: string }>(`${this.apiUrl}/${reservaId}/verificar-pago-wompi`, {
      transaccionId,
      codigo,
    });
  }
}
