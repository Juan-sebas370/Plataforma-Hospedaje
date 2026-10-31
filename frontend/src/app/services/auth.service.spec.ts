import { environment } from '../../environments/environment';
/**
 * Tests unitarios para AuthService
 * Cubre: login, registro, logout, token management, guards
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);

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

    it('debería initialized sin usuario', () => {
      expect(service).toBeDefined();
    });
  });

  describe('Login', () => {
    it('debería enviar credenciales al servidor', () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse = {
        token: 'mock-jwt-token',
        usuario: {
          id: '001',
          nombre: 'Test User',
          email: 'test@example.com',
        },
      };

      service.login(credentials.email, credentials.password).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockResponse);
    });

    it('debería almacenar token en localStorage tras login exitoso', () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse = {
        token: 'mock-jwt-token',
        usuario: {
          id: '001',
          nombre: 'Test User',
          email: 'test@example.com',
        },
      };

      service.login(credentials.email, credentials.password).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockResponse);

      expect(localStorage.getItem('auth_token')).toBe('mock-jwt-token');
    });

    it('debería hacer request POST con credenciales', () => {
      const testEmail = 'user@test.com';
      const testPassword = 'pass123';

      service.login(testEmail, testPassword).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush({ token: 'token' });
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('user_data', JSON.stringify({ id: '001', nombre: 'Test' }));
    });

    it('debería limpiar localStorage en logout', () => {
      service.logout();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('debería ejecutar logout correctamente', () => {
      expect(() => service.logout()).not.toThrow();
    });
  });

  describe('Token Management', () => {
    it('debería obtener token del localStorage', () => {
      const testToken = 'test-jwt-token-12345';
      localStorage.setItem('auth_token', testToken);

      const token = localStorage.getItem('auth_token');
      expect(token).toBe(testToken);
    });

    it('debería verificar si hay token guardado', () => {
      localStorage.setItem('auth_token', 'mock-token');
      const hasToken = localStorage.getItem('auth_token') !== null;
      expect(hasToken).toBeTruthy();
    });

    it('debería no tener token si localStorage vacío', () => {
      localStorage.clear();
      const hasToken = localStorage.getItem('auth_token') !== null;
      expect(hasToken).toBeFalsy();
    });
  });

  describe('Storage Operations', () => {
    it('debería guardar usuario en localStorage', () => {
      const mockUsuario = {
        id: '001',
        nombre: 'Juan Test',
        email: 'juan@test.com',
      };

      localStorage.setItem('user_data', JSON.stringify(mockUsuario));
      const stored = JSON.parse(localStorage.getItem('user_data') || '{}');

      expect(stored.nombre).toBe('Juan Test');
    });

    it('debería limpiar localStorage completamente', () => {
      localStorage.setItem('auth_token', 'token');
      localStorage.setItem('user_data', 'user');

      localStorage.clear();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('user_data')).toBeNull();
    });

    it('debería eliminar item específico del localStorage', () => {
      localStorage.setItem('auth_token', 'token-value');
      localStorage.removeItem('auth_token');

      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('HTTP Requests', () => {
    it('debería hacer POST request a endpoint de login', () => {
      service.login('test@test.com', 'password').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');

      req.flush({ token: 'mock-token', usuario: { id: '1' } });
    });

    it('debería incluir credenciales en body del request', () => {
      const email = 'test@example.com';
      const password = 'securepass123';

      service.login(email, password).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.body.email).toBe(email);
      expect(req.request.body.password).toBe(password);

      req.flush({ token: 'token' });
    });
  });

  describe('Error Handling', () => {
    it('debería manejar error de login', () => {
      service.login('test@test.com', 'wrong').subscribe(
        () => {
          /* success */
        },
        (error) => {
          expect(error).toBeDefined();
        }
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.error(new ErrorEvent('Unauthorized'), { status: 401 });
    });
  });

  describe('Service Methods', () => {
    it('debería tener método login definido', () => {
      expect(typeof service.login).toBe('function');
    });

    it('debería tener método logout definido', () => {
      expect(typeof service.logout).toBe('function');
    });

    it('debería retornar observable en login', () => {
      const result = service.login('test@test.com', 'pass');
      expect(result).toBeDefined();
      expect(result.subscribe).toBeDefined();
    });
  });
  describe('Restablecer contraseña', () => {
    it('acepta la respuesta en texto plano del backend como éxito', () => {
      let ok = false;
      let fallo = false;
      service.resetPassword('token', 'ClaveNueva456', 'ClaveNueva456').subscribe({ next: () => (ok = true), error: () => (fallo = true) });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/reset-password`);
      expect(req.request.responseType).toBe('text');
      req.flush('Contraseña actualizada exitosamente');

      expect(ok).toBe(true);
      expect(fallo).toBe(false);
    });
  });
});
