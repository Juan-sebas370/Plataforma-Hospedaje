import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProcesarPagoRequest {
  reservaId: string;
  metodoPago: string;
  montoTotal: number;
  moneda: string;
  nombreTitular?: string;
  numeroTarjeta?: string;
  mesExpiracion?: string;
  anoExpiracion?: string;
  cvv?: string;
  email: string;
}

export interface ResultadoPago {
  id: string;
  reservaId: string;
  estado: 'exitoso' | 'pendiente' | 'fallido';
  monto: number;
  metodoPago: string;
  fecha: string;
  transactionId?: string;
  mensaje?: string;
}

export interface DetallesReservaConPago {
  reservaId: string;
  habitacion: string;
  fechaLlegada: string;
  fechaSalida: string;
  noches: number;
  precioNoche: number;
  subtotal: number;
  impuestos: number;
  total: number;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private apiUrl = `${environment.apiUrl}/pagos`;
  private pagoEnProcesoSubject = new BehaviorSubject<ResultadoPago | null>(null);
  public pagoEnProceso$ = this.pagoEnProcesoSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los detalles de una reserva para cobro
   */
  obtenerDetallesReserva(reservaId: string): Observable<DetallesReservaConPago> {
    return this.http
      .get<DetallesReservaConPago>(`${this.apiUrl}/reservas/${reservaId}/detalles`)
      .pipe(
        catchError((error) => {
          console.error('Error al obtener detalles de reserva:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Procesa un pago con tarjeta de crédito
   */
  procesarPagoTarjeta(datos: ProcesarPagoRequest): Observable<ResultadoPago> {
    return this.http
      .post<ResultadoPago>(`${this.apiUrl}/procesar-tarjeta`, datos)
      .pipe(
        tap((resultado) => {
          this.pagoEnProcesoSubject.next(resultado);
          if (resultado.estado === 'exitoso') {
            localStorage.setItem('ultimo_pago', JSON.stringify(resultado));
          }
        }),
        catchError((error) => {
          console.error('Error al procesar pago:', error);
          return throwError(() => ({
            estado: 'fallido',
            mensaje: error.error?.mensaje || 'Error procesando el pago',
            ...error.error,
          }));
        })
      );
  }

  /**
   * Procesa un pago con transferencia bancaria
   */
  procesarPagoTransferencia(reservaId: string, email: string): Observable<ResultadoPago> {
    return this.http
      .post<ResultadoPago>(`${this.apiUrl}/procesar-transferencia`, {
        reservaId,
        email,
      })
      .pipe(
        tap((resultado) => {
          this.pagoEnProcesoSubject.next(resultado);
        }),
        catchError((error) => {
          console.error('Error al procesar transferencia:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Procesa un pago con PayPal
   */
  procesarPagoPayPal(reservaId: string, email: string): Observable<{ url: string }> {
    return this.http
      .post<{ url: string }>(`${this.apiUrl}/procesar-paypal`, {
        reservaId,
        email,
      })
      .pipe(
        catchError((error) => {
          console.error('Error al procesar PayPal:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtiene el historial de pagos del usuario
   */
  obtenerHistorialPagos(): Observable<ResultadoPago[]> {
    return this.http
      .get<ResultadoPago[]>(`${this.apiUrl}/historial`)
      .pipe(
        catchError((error) => {
          console.error('Error al obtener historial:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Verifica el estado de un pago
   */
  verificarEstadoPago(pagoId: string): Observable<ResultadoPago> {
    return this.http
      .get<ResultadoPago>(`${this.apiUrl}/${pagoId}`)
      .pipe(
        tap((resultado) => {
          this.pagoEnProcesoSubject.next(resultado);
        }),
        catchError((error) => {
          console.error('Error al verificar pago:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Retorna el último pago en proceso
   */
  getUltimoPago(): ResultadoPago | null {
    return this.pagoEnProcesoSubject.value;
  }

  /**
   * Limpia el pago en proceso
   */
  limpiarPago(): void {
    this.pagoEnProcesoSubject.next(null);
  }

  /**
   * Valida una tarjeta de crédito (básico)
   */
  validarTarjeta(numero: string, mes: string, ano: string, cvv: string): boolean {
    // Validación de Luhn
    const soloNumeros = numero.replace(/\s/g, '');
    if (!this.validarLuhn(soloNumeros)) return false;

    // Validar fecha
    const ahora = new Date();
    const mesNum = parseInt(mes);
    const anoNum = parseInt(ano);
    if (anoNum < ahora.getFullYear()) return false;
    if (anoNum === ahora.getFullYear() && mesNum < ahora.getMonth() + 1)
      return false;

    // Validar CVV
    if (!/^\d{3,4}$/.test(cvv)) return false;

    return true;
  }

  /**
   * Valida usando el algoritmo de Luhn
   */
  private validarLuhn(numero: string): boolean {
    let suma = 0;
    let esSegundoDigito = false;

    for (let i = numero.length - 1; i >= 0; i--) {
      let digito = parseInt(numero.charAt(i), 10);

      if (esSegundoDigito) {
        digito *= 2;
        if (digito > 9) {
          digito -= 9;
        }
      }

      suma += digito;
      esSegundoDigito = !esSegundoDigito;
    }

    return suma % 10 === 0;
  }

  /**
   * Formatea un número de tarjeta
   */
  formatearNumeroTarjeta(numero: string): string {
    return numero
      .replace(/\s/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim();
  }

  /**
   * Obtiene los últimos 4 dígitos de una tarjeta
   */
  obtenerUltimosDigitos(numero: string): string {
    return numero.replace(/\s/g, '').slice(-4);
  }
}
