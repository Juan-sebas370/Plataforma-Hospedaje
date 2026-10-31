import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { provideAuthInterceptor } from '../app.config';

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let navegar: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideAuthInterceptor(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('agrega el token de sesión a las peticiones', () => {
    localStorage.setItem('auth_token', 'abc');
    http.get('/api/reservas/usuario/1').subscribe();

    const req = httpMock.expectOne('/api/reservas/usuario/1');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
    req.flush([]);
  });

  it('sin sesión no agrega el encabezado', () => {
    http.get('/api/habitaciones').subscribe();

    const req = httpMock.expectOne('/api/habitaciones');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('con 401 cierra la sesión y vuelve al inicio', () => {
    localStorage.setItem('auth_token', 'vencido');
    http.get('/api/reservas/usuario/1').subscribe({ error: () => {} });

    httpMock.expectOne('/api/reservas/usuario/1').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(navegar).toHaveBeenCalledWith(['/']);
  });

  it('un login fallido (401) no redirige', () => {
    http.post('/api/auth/login', {}).subscribe({ error: () => {} });

    httpMock.expectOne('/api/auth/login').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(navegar).not.toHaveBeenCalled();
  });
});
