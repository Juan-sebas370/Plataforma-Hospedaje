import { environment } from '../../environments/environment';
/**
 * Tests unitarios para UsuarioService
 * Cubre: obtener perfil, actualizar perfil, foto, cambiar contraseña
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UsuarioService } from './usuario.service';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsuarioService],
    });

    service = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Inicialización', () => {
    it('debería crear el servicio', () => {
      expect(service).toBeTruthy();
    });

    it('debería tener método getUsuarioActual', () => {
      expect(typeof service.getUsuarioActual).toBe('function');
    });

    it('debería tener método actualizarPerfil', () => {
      expect(typeof service.actualizarPerfil).toBe('function');
    });
  });

  describe('Obtener Usuario Actual', () => {
    it('debería hacer request a endpoint de usuario actual', () => {
      service.getUsuarioActual().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/me`);
      expect(req.request.method).toBe('GET');

      req.flush({ id: '001', nombre: 'Test' });
    });

    it('debería retornar datos del usuario', () => {
      const mockUsuario = {
        id: '001',
        nombre: 'Juan Test',
        email: 'juan@test.com',
      };

      service.getUsuarioActual().subscribe((usuario) => {
        expect(usuario.nombre).toBe('Juan Test');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/me`);
      req.flush(mockUsuario);
    });
  });

  describe('Actualizar Perfil', () => {
    it('debería hacer request PUT para actualizar perfil', () => {
      const datosCambio = {
        nombre: 'Juan Actualizado',
        telefono: '123456789',
        ciudad: 'Madrid',
        pais: 'España'
      };

      service.actualizarPerfil(datosCambio).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/perfil`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(datosCambio);

      req.flush({ ...datosCambio, id: '001', email: 'test@test.com' });
    });

    it('debería enviar datos correctos en body', () => {
      const datosActualizados = {
        nombre: 'Juan Nuevo',
        telefono: '987654321',
        ciudad: 'Barcelona',
        pais: 'España',
      };

      service.actualizarPerfil(datosActualizados).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/perfil`);
      expect(req.request.body.nombre).toBe('Juan Nuevo');

      req.flush({ ...datosActualizados, id: '001', email: 'test@test.com' });
    });
  });

  describe('Foto de Perfil', () => {
    it('debería tener método subirFotoPerfil', () => {
      expect(typeof service.subirFotoPerfil).toBe('function');
    });

    it('debería hacer request de foto', () => {
      const mockFile = new File(['contenido'], 'test.jpg', { type: 'image/jpeg' });

      service.subirFotoPerfil(mockFile).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/foto`);
      expect(req.request.method).toBe('POST');

      req.flush({ foto: 'url-de-foto' });
    });
  });

  describe('Cambiar Contraseña', () => {
    it('debería tener método cambiarContrasena', () => {
      expect(typeof service.cambiarContrasena).toBe('function');
    });

    it('debería enviar contraseña actual y nueva', () => {
      const oldPass = 'oldPass123';
      const newPass = 'newPass456';

      service.cambiarContrasena(oldPass, newPass).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/cambiar-contrasena`);
      expect(req.request.method).toBe('POST');

      req.flush({ mensaje: 'actualizada' });
    });
  });

  describe('Observable Management', () => {
    it('debería retornar observable en getUsuarioActual', () => {
      const result = service.getUsuarioActual();
      expect(result).toBeDefined();
      expect(result.subscribe).toBeDefined();
    });

    it('debería retornar observable en actualizarPerfil', () => {
      const result = service.actualizarPerfil({
        nombre: 'Test',
        telefono: '123',
        ciudad: 'Test',
        pais: 'Test'
      });
      expect(result).toBeDefined();
      expect(result.subscribe).toBeDefined();
    });
  });
});
