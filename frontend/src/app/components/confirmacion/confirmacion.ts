import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import * as QRCode from 'qrcode';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-confirmacion',
  imports: [RouterLink, CommonModule, TranslatePipe],
  templateUrl: './confirmacion.html',
  styleUrl: './confirmacion.css',
})
export class Confirmacion implements OnInit {
  Math = Math;
  qrCodeDataUrl: string = '';
  codigoConfirmacion: string = '';
  private isBrowser = false;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // Generar código de confirmación
    this.codigoConfirmacion = `HS-2026-00${Math.floor(Math.random() * 9000) + 1000}`;
    this.generarQRCode();
  }

  async generarQRCode(): Promise<void> {
    try {
      // Datos de la reserva en formato JSON
      const datosReserva = {
        codigo: this.codigoConfirmacion,
        huesped: 'Juan Sebastián Pérez',
        documento: '123456789',
        email: 'correo@ejemplo.com',
        telefono: '+57 300 123 4567',
        habitacion: 'Habitación Doble',
        checkin: '20 Feb 2026, 2:00 PM',
        checkout: '23 Feb 2026, 12:00 PM',
        noches: 3,
        total: '$481.950',
        hotel: 'Hospedaje Sebastian',
        url: `https://hospedajesebastian.com/reserva/${this.codigoConfirmacion}`
      };

      // Convertir a JSON string
      const datosQR = JSON.stringify(datosReserva);

      // Generar el código QR como data URL
      this.qrCodeDataUrl = await QRCode.toDataURL(datosQR, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 300,
        margin: 2,
        color: {
          dark: '#2c3e50',
          light: '#ffffff'
        }
      });
    } catch (error) {
      console.error('Error generando código QR:', error);
    }
  }

  descargarQR(): void {
    if (!this.qrCodeDataUrl || !this.isBrowser) {
      return;
    }

    // Crear un enlace temporal para descargar la imagen
    const link = document.createElement('a');
    link.href = this.qrCodeDataUrl;
    link.download = `QR-${this.codigoConfirmacion}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
