import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PagoService, WompiCheckout } from './pago.service';
import { environment } from '../../environments/environment';

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
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debería pedir el checkout de Wompi para una reserva', () => {
    const mockCheckout: WompiCheckout = {
      publicKey: 'pub_test_abc',
      reference: 'HS-42-abcd1234',
      amountInCents: 55000000,
      currency: 'COP',
      signature: 'firma-simulada',
    };

    service.iniciarCheckoutWompi(42, "ABC123").subscribe((checkout) => {
      expect(checkout).toEqual(mockCheckout);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/reservas/42/checkout-wompi?codigo=ABC123`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCheckout);
  });
});
