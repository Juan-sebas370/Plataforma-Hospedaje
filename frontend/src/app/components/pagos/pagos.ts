import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '../../shared/translate.pipe';
import { ReservaService, Reserva } from '../../services/reserva.service';
import { PagoService, WompiCheckout } from '../../services/pago.service';

/** Constructor global que define https://checkout.wompi.co/widget.js */
declare const WidgetCheckout: new (config: Record<string, unknown>) => {
  open: (callback: (resultado: { transaction?: { id: string; status: string } }) => void) => void;
};

const WOMPI_WIDGET_URL = 'https://checkout.wompi.co/widget.js';

@Component({
  selector: 'app-pagos',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
})
export class Pagos implements OnInit {
  reserva: Reserva | null = null;
  reservaId = 0;
  /** Código de acceso de la reserva (llega en la URL desde el paso de confirmación). */
  private codigo = '';
  cargando = true;
  error = '';
  /** true mientras se pide la firma al backend / se abre el widget / se verifica. */
  procesando = false;
  /** Mensaje del resultado del último intento de pago (rechazado, pendiente...). */
  mensajePago = '';
  private isBrowser: boolean;
  private widgetScript?: Promise<void>;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private route: ActivatedRoute,
    private router: Router,
    private reservaService: ReservaService,
    private pagoService: PagoService,
    private cdr: ChangeDetectorRef,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    const reservaId = this.route.snapshot.queryParamMap.get('reservaId');
    if (!reservaId) {
      this.error = 'No se encontró el ID de la reserva.';
      this.cargando = false;
      return;
    }
    this.reservaId = +reservaId;
    this.codigo = this.route.snapshot.queryParamMap.get('codigo') ?? '';

    this.reservaService.obtenerReserva(this.reservaId, this.codigo).subscribe({
      next: (reserva) => {
        this.reserva = reserva;
        this.cargando = false;
        // La app es zoneless: sin esto la vista no se actualiza.
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar la información de la reserva.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  get yaPagada(): boolean {
    return this.reserva?.estado === 'CONFIRMADA';
  }

  /**
   * Abre el Widget de Checkout de Wompi. Se pide una firma nueva en cada
   * intento porque Wompi no deja reutilizar la referencia de un pago
   * rechazado. El pago ocurre dentro del widget de Wompi — el número de
   * tarjeta jamás toca nuestro frontend ni backend.
   */
  pagar(): void {
    if (!this.isBrowser || this.procesando) return;
    this.procesando = true;
    this.mensajePago = '';

    this.pagoService.iniciarCheckoutWompi(this.reservaId, this.codigo).subscribe({
      next: (checkout) => {
        this.cargarWidget()
          .then(() => this.abrirWidget(checkout))
          .catch(() => this.finalizar('No se pudo cargar Wompi. Revisá tu conexión e intentá de nuevo.'));
      },
      error: (err) => {
        this.finalizar(err?.error?.error || 'No se pudo iniciar el pago. Intenta de nuevo en unos minutos.');
      },
    });
  }

  private cargarWidget(): Promise<void> {
    if (typeof WidgetCheckout !== 'undefined') return Promise.resolve();
    this.widgetScript ??= new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = WOMPI_WIDGET_URL;
      script.onload = () => resolve();
      script.onerror = () => {
        this.widgetScript = undefined;
        reject();
      };
      document.head.appendChild(script);
    });
    return this.widgetScript;
  }

  private abrirWidget(checkout: WompiCheckout): void {
    const config: Record<string, unknown> = {
      currency: checkout.currency,
      amountInCents: checkout.amountInCents,
      reference: checkout.reference,
      publicKey: checkout.publicKey,
      signature: { integrity: checkout.signature },
    };
    // El firewall de Wompi responde 403 si la redirect-url apunta a una
    // dirección local, así que en desarrollo se omite; el resultado llega
    // igual por el callback de open().
    const esLocal = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
    if (!esLocal) {
      config['redirectUrl'] = `${window.location.origin}/confirmacion?reservaId=${this.reservaId}&codigo=${encodeURIComponent(this.codigo)}`;
    }
    if (this.reserva?.emailContacto) {
      config['customerData'] = { email: this.reserva.emailContacto };
    }

    new WidgetCheckout(config).open((resultado) => {
      const transaccion = resultado?.transaction;
      if (!transaccion?.id) {
        // El huésped cerró el widget sin pagar.
        this.finalizar('');
        return;
      }
      console.info('Transacción de Wompi', transaccion.id, transaccion.status);
      this.mensajePago = 'Verificando tu pago con Wompi...';
      this.cdr.detectChanges();
      this.verificarPago(transaccion.id);
    });
  }

  /** Confirma el estado con el backend, que a su vez le pregunta a Wompi. */
  private verificarPago(transaccionId: string, intento = 1): void {
    this.pagoService.verificarPagoWompi(this.reservaId, transaccionId, this.codigo).subscribe({
      next: ({ estado }) => {
        if (estado === 'APPROVED') {
          this.router.navigate(['/confirmacion'], { queryParams: { reservaId: this.reservaId, codigo: this.codigo } });
        } else if (estado === 'PENDING' && intento < 10) {
          this.mensajePago = 'Tu pago está en proceso, esperando la confirmación de Wompi...';
          this.cdr.detectChanges();
          setTimeout(() => this.verificarPago(transaccionId, intento + 1), 3000);
        } else if (estado === 'PENDING') {
          this.finalizar('Tu pago sigue en proceso. Te avisaremos por correo cuando Wompi lo confirme.');
        } else {
          this.finalizar('El pago fue rechazado. Podés intentarlo de nuevo con otro medio de pago.');
        }
      },
      error: (err) => {
        // Justo después de pagar, la transacción puede tardar unos segundos
        // en aparecer en la API de Wompi: se reintenta antes de rendirse.
        if (intento < 5) {
          setTimeout(() => this.verificarPago(transaccionId, intento + 1), 3000);
          return;
        }
        console.error('No se pudo verificar la transacción de Wompi', transaccionId, err);
        this.finalizar(err?.error?.error || 'No pudimos verificar tu pago. Si se descontó el dinero, contactá al hotel.');
      },
    });
  }

  private finalizar(mensaje: string): void {
    this.procesando = false;
    this.mensajePago = mensaje;
    this.cdr.detectChanges();
  }

  formatPrecio(valor: number | undefined): string {
    if (valor == null) return '–';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor);
  }

  cancelar(): void {
    if (confirm('¿Seguro que querés cancelar? Podés volver a intentar el pago más tarde desde el enlace de tu reserva.')) {
      this.router.navigate(['/']);
    }
  }
}
