import { ChangeDetectionStrategy, Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import * as QRCode from 'qrcode';
import { ReservaService, Reserva } from '../../services/reserva.service';
import { PagoService } from '../../services/pago.service';
import { HabitacionService } from '../../services/habitacion.service';
import { Icono } from '../../shared/icono';
import { TIPOS_RESERVA, formatCOP, formatFecha, plural } from '../reservas/reserva.catalogo';

/** Datos de contacto del hospedaje (los mismos del botón de WhatsApp del pie de página). */
const WHATSAPP = '573147556717';
const DIRECCION = 'Carrera 3ra #5-65, Filandia, Quindío';

/**
 * Comprobante de la reserva: a esta página vuelve el huésped después de pagar
 * en Wompi (/confirmacion?reservaId=…&codigo=…).
 *
 * - El código visible es el de SOGO (`codigo`, p. ej. RSV-2027-00012): el mismo
 *   que el personal busca en SOGO. Si la base aún no lo asignó se usa RSV-<id>,
 *   igual que SOGO.
 * - El QR lleva el enlace a esta misma página (con el código de acceso): al
 *   escanearlo con la cámara del celular se abre la reserva. Es el mismo QR que
 *   llega en el correo de confirmación.
 */
@Component({
  selector: 'app-confirmacion',
  imports: [RouterLink, Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirmacion.html',
  styleUrl: './confirmacion.css',
})
export class Confirmacion implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly reservaService = inject(ReservaService);
  private readonly pagoService = inject(PagoService);
  private readonly habitacionService = inject(HabitacionService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly cargando = signal(true);
  readonly error = signal('');
  readonly reserva = signal<Reserva | null>(null);
  readonly qr = signal('');
  readonly copiado = signal(false);
  private readonly numeros = signal<Map<number, string>>(new Map());

  readonly direccion = DIRECCION;
  readonly whatsapp = `https://wa.me/${WHATSAPP}`;
  readonly mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Hospedaje Sebastián, ' + DIRECCION)}`;

  readonly estado = computed(() => this.reserva()?.estado ?? '');
  readonly confirmada = computed(() => this.estado() === 'CONFIRMADA' || this.estado() === 'COMPLETADA');
  readonly codigo = computed(() => {
    const r = this.reserva();
    return r ? (r.codigo || `RSV-${r.id}`) : '';
  });
  /** Enlace que abre esta reserva: es lo que lleva el QR. */
  readonly enlace = computed(() => {
    const r = this.reserva();
    if (!r || !this.isBrowser) return '';
    return `${window.location.origin}/confirmacion?reservaId=${r.id}&codigo=${encodeURIComponent(r.codigoAcceso ?? '')}`;
  });
  readonly esDia = computed(() => ['pasadia', 'grupal'].includes(this.reserva()?.tipoReserva ?? ''));
  readonly tipo = computed(() => TIPOS_RESERVA.find(t => t.id === this.reserva()?.tipoReserva));

  readonly llegada = computed(() => this.fecha(this.reserva()?.fechaIngreso));
  readonly salida = computed(() => this.fecha(this.reserva()?.fechaSalida));
  readonly noches = computed(() => this.reserva()?.noches ?? 0);
  readonly horarioLlegada = computed(() => (this.tipo()?.horario ?? 'Check-in 3:00 p.m. – 10:00 p.m.').replace(/^Check-in /, ''));

  readonly personas = computed(() => {
    const r = this.reserva();
    if (!r) return '';
    const partes = [plural(r.huespedes ?? 0, 'adulto')];
    if (r.ninos11) partes.push(plural(r.ninos11, 'joven', 'jóvenes') + ' (11+)');
    if (r.ninos10) partes.push(plural(r.ninos10, 'niño') + ' (4–10)');
    if (r.ninos3) partes.push(plural(r.ninos3, 'bebé') + ' (0–3)');
    // Cada grupo en una sola línea: solo se parte entre grupos
    return partes.map(p => p.replace(/ /g, ' ')).join(' · ');
  });

  readonly espacio = computed(() => {
    const r = this.reserva();
    if (!r) return '';
    if (this.esDia()) return r.tipoReserva === 'grupal' ? 'Salón y zonas comunes' : 'Zonas comunes';
    if (r.modoEspacio === 'casa' || (r.modoEspacio !== 'habitaciones' && r.espacio === 'completo')) return 'Casa completa';
    if (r.modoEspacio === 'piso') return r.espacio === 'piso2' ? 'Piso 2 completo' : 'Piso 1 completo';
    const ids = r.habitacionesIds?.length ? r.habitacionesIds : (r.habitacionId ? [r.habitacionId] : []);
    const nums = ids.map(id => this.numeros().get(id)).filter((n): n is string => !!n).sort();
    if (!nums.length) return plural(ids.length || 1, 'habitación', 'habitaciones');
    return nums.length === 1 ? `Habitación ${nums[0]}` : `Habitaciones ${nums.slice(0, -1).join(', ')} y ${nums.at(-1)}`;
  });

  readonly total = computed(() => formatCOP(this.reserva()?.precioTotal ?? 0));
  readonly titular = computed(() => {
    const r = this.reserva();
    return r ? `${r.nombreHuesped ?? ''} ${r.apellidoHuesped ?? ''}`.trim() : '';
  });
  readonly nombre = computed(() => this.reserva()?.nombreHuesped?.trim().split(' ')[0] ?? '');

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const reservaId = params.get('reservaId');
    if (!reservaId) {
      this.mostrarError('No encontramos el número de la reserva en el enlace.');
      return;
    }
    const codigo = params.get('codigo') ?? '';
    // Wompi agrega ?id=<transacción> al volver del pago: si el webhook todavía
    // no confirmó la reserva, se verifica directamente con el backend.
    this.cargar(+reservaId, codigo, params.get('id'));
  }

  private cargar(reservaId: number, codigo: string, transaccionId: string | null): void {
    this.reservaService.obtenerReserva(reservaId, codigo).subscribe({
      next: reserva => {
        if (reserva.estado === 'PENDIENTE' && transaccionId) {
          this.pagoService.verificarPagoWompi(reservaId, transaccionId, codigo).subscribe({
            next: () => this.cargar(reservaId, codigo, null),
            error: () => this.mostrar(reserva),
          });
          return;
        }
        this.mostrar(reserva);
      },
      error: () => this.mostrarError('No pudimos cargar tu reserva. Revisa que el enlace esté completo o escríbenos.'),
    });
  }

  private mostrar(reserva: Reserva): void {
    this.reserva.set(reserva);
    this.cargando.set(false);
    if (reserva.habitacionesIds?.length || reserva.habitacionId) {
      this.habitacionService.obtenerTodas().subscribe({
        next: lista => this.numeros.set(new Map(lista.map(h => [h.id, h.numero]))),
        error: () => {},
      });
    }
    this.generarQR();
  }

  private mostrarError(mensaje: string): void {
    this.error.set(mensaje);
    this.cargando.set(false);
  }

  private fecha(iso: string | undefined): string {
    // "jue 2 dic 2027": en un comprobante el año sí importa
    return iso ? `${formatFecha(iso)} ${iso.slice(0, 4)}` : '';
  }

  // ── Código y QR ───────────────────────────────────────────

  private async generarQR(): Promise<void> {
    if (!this.isBrowser) return;
    try {
      this.qr.set(await QRCode.toDataURL(this.enlace(), {
        errorCorrectionLevel: 'M', width: 360, margin: 1,
        color: { dark: '#0A3D6D', light: '#FFFFFF' },
      }));
    } catch {
      this.qr.set('');
    }
  }

  async copiarCodigo(): Promise<void> {
    if (!this.isBrowser) return;
    try {
      await navigator.clipboard.writeText(this.codigo());
      this.copiado.set(true);
      setTimeout(() => this.copiado.set(false), 2500);
    } catch {
      this.copiado.set(false);
    }
  }

  /** Descarga una tarjeta PNG con el QR, el código y las fechas: lista para mostrar en la recepción. */
  descargarQR(): void {
    if (!this.isBrowser || !this.qr()) return;
    const img = new Image();
    img.onload = () => {
      const ancho = 600, alto = 820;
      const canvas = document.createElement('canvas');
      canvas.width = ancho;
      canvas.height = alto;
      const c = canvas.getContext('2d')!;
      c.fillStyle = '#FFFFFF';
      c.fillRect(0, 0, ancho, alto);
      c.fillStyle = '#0A3D6D';
      c.fillRect(0, 0, ancho, 110);
      c.textAlign = 'center';
      c.fillStyle = '#FFFFFF';
      c.font = '600 34px Georgia, serif';
      c.fillText('Hospedaje Sebastián', ancho / 2, 58);
      c.font = '20px system-ui, sans-serif';
      c.fillText('Filandia, Quindío', ancho / 2, 90);
      c.drawImage(img, 120, 150, 360, 360);
      c.fillStyle = '#5F5A54';
      c.font = '20px system-ui, sans-serif';
      c.fillText('Código de reserva', ancho / 2, 560);
      c.fillStyle = '#0A3D6D';
      c.font = '700 44px ui-monospace, Consolas, monospace';
      c.fillText(this.codigo(), ancho / 2, 612);
      c.fillStyle = '#2B2B2B';
      c.font = '22px system-ui, sans-serif';
      const fechas = this.esDia() ? this.llegada() : `${this.llegada()}  →  ${this.salida()}`;
      c.fillText(fechas, ancho / 2, 672);
      c.fillText(this.titular(), ancho / 2, 708);
      c.fillStyle = '#7A7A7A';
      c.font = '18px system-ui, sans-serif';
      c.fillText('Escanéalo para abrir tu reserva · muéstralo al llegar', ancho / 2, 776);
      const enlace = document.createElement('a');
      enlace.href = canvas.toDataURL('image/png');
      enlace.download = `Reserva-${this.codigo()}.png`;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
    };
    img.src = this.qr();
  }

  imprimir(): void {
    if (this.isBrowser) window.print();
  }
}
