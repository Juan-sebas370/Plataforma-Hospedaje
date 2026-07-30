import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';

interface MetodoPago {
  id: string;
  nombre: string;
  icono: string;
  activo: boolean;
}

interface DetallesReserva {
  id: string;
  habitacion: string;
  fechaLlegada: string;
  fechaSalida: string;
  noches: number;
  precioNoche: number;
  precioTotal: number;
  impuestos: number;
  totalConImpuestos: number;
}

@Component({
  selector: 'app-pagos',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
})
export class Pagos implements OnInit {
  // Datos de la reserva (recibiría del servicio)
  detallesReserva: DetallesReserva = {
    id: 'RES-2024-001',
    habitacion: 'Suite Deluxe #301',
    fechaLlegada: '2024-03-20',
    fechaSalida: '2024-03-25',
    noches: 5,
    precioNoche: 250,
    precioTotal: 1250,
    impuestos: 125,
    totalConImpuestos: 1375,
  };

  // Opciones de pago
  metodosPago: MetodoPago[] = [
    {
      id: 'tarjeta',
      nombre: 'Tarjeta de Crédito/Débito',
      icono: 'card',
      activo: true,
    },
    {
      id: 'transferencia',
      nombre: 'Transferencia Bancaria',
      icono: 'bank',
      activo: false,
    },
    { id: 'paypal', nombre: 'PayPal', icono: 'paypal', activo: false },
    {
      id: 'efectivo',
      nombre: 'Efectivo al Llegar',
      icono: 'cash',
      activo: false,
    },
  ];

  // Formulario de tarjeta
  formularioPago!: FormGroup;
  procesando: boolean = false;
  pagoCompleto: boolean = false;
  errorPago: string = '';
  metodoPagoSeleccionado: string = 'tarjeta';
  submitted: boolean = false;

  // Estados paso a paso
  pasoActual: number = 1; // 1: Datos, 2: Confirmación, 3: Procesamiento, 4: Éxito

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    this.cargarDetallesReserva();
  }

  /**
   * Inicializa el formulario de pago
   */
  private inicializarFormulario(): void {
    this.formularioPago = this.formBuilder.group({
      nombreTitular: [
        '',
        [Validators.required, Validators.minLength(3)],
      ],
      numeroTarjeta: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{13,19}$/),
        ],
      ],
      mesExpiracion: ['', [Validators.required, Validators.pattern(/^\d{2}$/)]],
      anoExpiracion: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      email: ['', [Validators.required, Validators.email]],
      terminos: [false, Validators.requiredTrue],
    });
  }

  /**
   * Carga los detalles de la reserva (simula obtener del servidor)
   */
  private cargarDetallesReserva(): void {
    // Aquí iría la llamada al servicio: this.reservasService.obtenerDetalles(id)
  }

  /**
   * Getter para acceder a controles
   */
  get f() {
    return this.formularioPago.controls;
  }

  /**
   * Selecciona un método de pago
   */
  seleccionarMetodo(metodId: string): void {
    this.metodosPago.forEach((m) => (m.activo = m.id === metodId));
    this.metodoPagoSeleccionado = metodId;
    this.errorPago = '';
  }

  /**
   * Procede al siguiente paso
   */
  procederProxPaso(): void {
    if (this.pasoActual === 1) {
      this.pasoActual = 2;
    } else if (this.pasoActual === 2) {
      this.procesarPago();
    }
  }

  /**
   * Vuelve al paso anterior
   */
  volverPasoAnterior(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
      this.errorPago = '';
    }
  }

  /**
   * Procesa el pago
   */
  private procesarPago(): void {
    this.submitted = true;

    if (this.metodoPagoSeleccionado === 'tarjeta') {
      if (this.formularioPago.invalid) {
        return;
      }
    }

    this.procesando = true;
    this.pasoActual = 3;

    // Simular procesamiento
    setTimeout(() => {
      this.procesando = false;
      this.pagoCompleto = true;
      this.pasoActual = 4;

      // Limpiar formulario después de éxito
      this.formularioPago.reset();
      this.submitted = false;
    }, 2500);
  }

  /**
   * Cancela el pago y vuelve a reservas
   */
  cancelarPago(): void {
    if (
      confirm(
        '¿Estás seguro de que deseas cancelar el pago? Tu reserva será descartada.'
      )
    ) {
      this.router.navigate(['/reservas']);
    }
  }

  /**
   * Completa la transacción y va al dashboard
   */
  completarTransaccion(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Formatea el número de tarjeta
   */
  formatearTarjeta(evento: any): void {
    const valor = evento.target.value.replace(/\s/g, '');
    evento.target.value = valor
      .replace(/\D/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim();
  }

  /**
   * Valida mes de expiración
   */
  validarMes(evento: any): void {
    let valor = evento.target.value.replace(/\D/g, '');
    if (valor.length > 2) valor = valor.substring(0, 2);
    if (valor && parseInt(valor) > 12) valor = '12';
    evento.target.value = valor;
  }

  /**
   * Valida año de expiración
   */
  validarAno(evento: any): void {
    let valor = evento.target.value.replace(/\D/g, '');
    if (valor.length > 4) valor = valor.substring(0, 4);
    evento.target.value = valor;
  }

  /**
   * Valida CVV
   */
  validarCVV(evento: any): void {
    evento.target.value = evento.target.value
      .replace(/\D/g, '')
      .substring(0, 4);
  }

  /**
   * Obtiene icono del método de pago seleccionado
   */
  getIconoMetodo(): string {
    const metodo = this.metodosPago.find((m) => m.id === this.metodoPagoSeleccionado);
    return metodo?.icono || 'card';
  }

  /**
   * Obtiene nombre del método de pago seleccionado
   */
  getNombreMetodo(): string {
    const metodo = this.metodosPago.find((m) => m.id === this.metodoPagoSeleccionado);
    return metodo?.nombre || '';
  }

  /**
   * Calcula el total formateado
   */
  getTotalFormateado(): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(this.detallesReserva.totalConImpuestos);
  }
}
