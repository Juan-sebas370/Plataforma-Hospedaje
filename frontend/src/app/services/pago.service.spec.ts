/**
 * Tests unitarios para PagoService
 * Cubre: procesamiento de pagos, validación de tarjetas, historial de transacciones
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PagoService, ProcesarPagoRequest, ResultadoPago, DetallesReservaConPago } from './pago.service';

describe('PagoService', () => {
  let service: PagoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PagoService],
    });

    service = TestBed.inject(PagoService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Inicialización', () => {
    it('debería crear el servicio', () => {
      expect(service).toBeTruthy();
    });

    it('debería tener método procesarPagoTarjeta', () => {
      expect(typeof service.procesarPagoTarjeta).toBe('function');
    });

    it('debería tener método obtenerDetallesReserva', () => {
      expect(typeof service.obtenerDetallesReserva).toBe('function');
    });

    it('debería tener método obtenerHistorialPagos', () => {
      expect(typeof service.obtenerHistorialPagos).toBe('function');
    });
  });

  describe('Obtener Detalles de Reserva', () => {
    it('debería obtener detalles de reserva por ID', () => {
      service.obtenerDetallesReserva('RES-001').subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/pagos/reservas/RES-001/detalles');
      expect(req.request.method).toBe('GET');

      const mockDetalles: DetallesReservaConPago = {
        reservaId: 'RES-001',
        habitacion: 'Habitación Doble 101',
        fechaLlegada: '2026-03-01',
        fechaSalida: '2026-03-05',
        noches: 4,
        precioNoche: 150,
        subtotal: 600,
        impuestos: 96,
        total: 696,
        estado: 'confirmada',
      };

      req.flush(mockDetalles);
    });

    it('debería retornar detalles con total calculado', () => {
      const mockDetalles: DetallesReservaConPago = {
        reservaId: 'RES-002',
        habitacion: 'Suite Premium',
        fechaLlegada: '2026-02-20',
        fechaSalida: '2026-02-22',
        noches: 2,
        precioNoche: 250,
        subtotal: 500,
        impuestos: 80,
        total: 580,
        estado: 'confirmada',
      };

      service.obtenerDetallesReserva('RES-002').subscribe((detalles) => {
        expect(detalles.total).toBe(580);
        expect(detalles.noches).toBe(2);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/pagos/reservas/RES-002/detalles');
      req.flush(mockDetalles);
    });
  });

  describe('Procesar Pago con Tarjeta', () => {
    it('debería enviar POST a /procesar-tarjeta', () => {
      const datoPago: ProcesarPagoRequest = {
        reservaId: 'RES-001',
        metodoPago: 'tarjeta',
        montoTotal: 696,
        moneda: 'USD',
        nombreTitular: 'Juan Perez',
        numeroTarjeta: '4532015112830366',
        mesExpiracion: '12',
        anoExpiracion: '2026',
        cvv: '123',
        email: 'juan@example.com',
      };

      service.procesarPagoTarjeta(datoPago).subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/pagos/procesar-tarjeta');
      expect(req.request.method).toBe('POST');

      const mockResultado: ResultadoPago = {
        id: 'PAG-001',
        reservaId: 'RES-001',
        estado: 'exitoso',
        monto: 696,
        metodoPago: 'tarjeta',
        fecha: '2026-02-19',
        transactionId: 'TXN-12345',
      };

      req.flush(mockResultado);
    });

    it('debería guardar pago exitoso en localStorage', () => {
      const datoPago: ProcesarPagoRequest = {
        reservaId: 'RES-001',
        metodoPago: 'tarjeta',
        montoTotal: 696,
        moneda: 'USD',
        email: 'test@example.com',
      };

      service.procesarPagoTarjeta(datoPago).subscribe(() => {
        expect(localStorage.getItem('ultimo_pago')).not.toBeNull();
      });

      const req = httpMock.expectOne('http://localhost:3000/api/pagos/procesar-tarjeta');
      req.flush({
        id: 'PAG-001',
        reservaId: 'RES-001',
        estado: 'exitoso',
        monto: 696,
        metodoPago: 'tarjeta',
        fecha: '2026-02-19',
      });
    });

    it('debería retornar resultado de pago', () => {
      const datoPago: ProcesarPagoRequest = {
        reservaId: 'RES-001',
        metodoPago: 'tarjeta',
        montoTotal: 500,
        moneda: 'USD',
        email: 'user@hotel.com',
      };

      service.procesarPagoTarjeta(datoPago).subscribe((resultado) => {
        expect(resultado.estado).toBe('exitoso');
        expect(resultado.monto).toBe(500);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/pagos/procesar-tarjeta');
      req.flush({
        id: 'PAG-002',
        reservaId: 'RES-001',
        estado: 'exitoso',
        monto: 500,
        metodoPago: 'tarjeta',
        fecha: '2026-02-19',
      });
    });
  });

  describe('Procesar Pago Transferencia', () => {
    it('debería procesar pago con transferencia bancaria', () => {
      service.procesarPagoTransferencia('RES-001', 'juan@example.com').subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/pagos/procesar-transferencia');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.reservaId).toBe('RES-001');
      expect(req.request.body.email).toBe('juan@example.com');

      const mockResultado: ResultadoPago = {
        id: 'PAG-003',
        reservaId: 'RES-001',
        estado: 'pendiente',
        monto: 696,
        metodoPago: 'transferencia',
        fecha: '2026-02-19',
        mensaje: 'Transferencia en trámite',
      };

      req.flush(mockResultado);
    });
  });

  describe('Procesar Pago PayPal', () => {
    it('debería retornar URL de PayPal', () => {
      service.procesarPagoPayPal('RES-001', 'user@hotel.com').subscribe((respuesta) => {
        expect(respuesta.url).toBeDefined();
        expect(respuesta.url.includes('paypal')).toBeTruthy();
      });

      const req = httpMock.expectOne('http://localhost:3000/api/pagos/procesar-paypal');
      expect(req.request.method).toBe('POST');

      req.flush({ url: 'https://paypal.com/checkout?id=PAY-123' });
    });
  });

  describe('Historial de Pagos', () => {
    it('debería obtener historial de pagos del usuario', () => {
      service.obtenerHistorialPagos().subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/pagos/historial');
      expect(req.request.method).toBe('GET');

      req.flush([] as ResultadoPago[]);
    });

    it('debería retornar array de pagos históricos', () => {
      const mockHistorial: ResultadoPago[] = [
        {
          id: 'PAG-001',
          reservaId: 'RES-001',
          estado: 'exitoso',
          monto: 696,
          metodoPago: 'tarjeta',
          fecha: '2026-01-15',
        },
        {
          id: 'PAG-002',
          reservaId: 'RES-002',
          estado: 'exitoso',
          monto: 450,
          metodoPago: 'transferencia',
          fecha: '2026-01-10',
        },
      ];

      service.obtenerHistorialPagos().subscribe((pagos) => {
        expect(pagos.length).toBe(2);
        expect(pagos[0].estado).toBe('exitoso');
      });

      const req = httpMock.expectOne('http://localhost:3000/api/pagos/historial');
      req.flush(mockHistorial);
    });
  });

  describe('Verificar Estado de Pago', () => {
    it('debería obtener estado de pago por ID', () => {
      service.verificarEstadoPago('PAG-001').subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/pagos/PAG-001');
      expect(req.request.method).toBe('GET');

      const mockEstado: ResultadoPago = {
        id: 'PAG-001',
        reservaId: 'RES-001',
        estado: 'exitoso',
        monto: 696,
        metodoPago: 'tarjeta',
        fecha: '2026-02-19',
      };

      req.flush(mockEstado);
    });
  });

  describe('Validación de Tarjeta', () => {
    it('debería validar tarjeta válida', () => {
      // Número de tarjeta de prueba válida (Visa)
      const esValida = service.validarTarjeta('4532015112830366', '12', '2026', '123');
      expect(esValida).toBeTruthy();
    });

    it('debería rechazar tarjeta con número inválido', () => {
      const esValida = service.validarTarjeta('1234567890123456', '12', '2026', '123');
      expect(esValida).toBeFalsy();
    });

    it('debería rechazar tarjeta expirada', () => {
      const esValida = service.validarTarjeta('4532015112830366', '01', '2020', '123');
      expect(esValida).toBeFalsy();
    });

    it('debería rechazar CVV inválido', () => {
      const esValida = service.validarTarjeta('4532015112830366', '12', '2026', '12');
      expect(esValida).toBeFalsy();
    });
  });

  describe('Métodos Auxiliares', () => {
    it('debería obtener último pago en proceso', () => {
      const ultimo = service.getUltimoPago();
      expect(ultimo).toBeNull();
    });

    it('debería formatear número de tarjeta', () => {
      const numero = '4532015112830366';
      const formateado = service.formatearNumeroTarjeta(numero);
      expect(formateado).toMatch(/^(\d{4}\s){3}\d{4}$/);
    });

    it('debería obtener últimos 4 dígitos de tarjeta', () => {
      const numero = '4532015112830366';
      const ultimos = service.obtenerUltimosDigitos(numero);
      expect(ultimos).toBe('0366');
    });

    it('debería limpiar pago en proceso', () => {
      service.limpiarPago();
      expect(service.getUltimoPago()).toBeNull();
    });
  });

  describe('Manejo de Errores', () => {
    it('debería manejar error en procesamiento de pago', () => {
      const datoPago: ProcesarPagoRequest = {
        reservaId: 'RES-999',
        metodoPago: 'tarjeta',
        montoTotal: 696,
        moneda: 'USD',
        email: 'error@example.com',
      };

      service.procesarPagoTarjeta(datoPago).subscribe(
        () => {
          /* success */
        },
        (error) => {
          expect(error).toBeDefined();
        }
      );

      const req = httpMock.expectOne('http://localhost:3000/api/pagos/procesar-tarjeta');
      req.error(new ErrorEvent('Payment declined'), { status: 400 });
    });

    it('debería manejar error en obtener detalles de reserva', () => {
      service.obtenerDetallesReserva('RES-INVALID').subscribe(
        () => {
          /* success */
        },
        (error) => {
          expect(error).toBeDefined();
        }
      );

      const req = httpMock.expectOne('http://localhost:3000/api/pagos/reservas/RES-INVALID/detalles');
      req.error(new ErrorEvent('Not found'), { status: 404 });
    });
  });

  describe('Observable Management', () => {
    it('debería retornar observable en procesarPagoTarjeta', () => {
      const datoPago: ProcesarPagoRequest = {
        reservaId: 'RES-001',
        metodoPago: 'tarjeta',
        montoTotal: 696,
        moneda: 'USD',
        email: 'test@example.com',
      };

      const result = service.procesarPagoTarjeta(datoPago);
      expect(result.subscribe).toBeDefined();
    });

    it('debería emitir pago en proceso desde subject', () => {
      const pagoEnProcesoSub = service.pagoEnProceso$.subscribe();
      expect(pagoEnProcesoSub.closed).toBeFalsy();
    });
  });
});
