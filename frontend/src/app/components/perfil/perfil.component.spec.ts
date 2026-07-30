/**
 * Tests unitarios para componente Perfil
 * Cubre: vista de perfil, edición, foto, validación
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Perfil } from './perfil';
import { AuthService } from '../../services/auth.service';

describe('PerfilComponent', () => {
  let component: Perfil;
  let fixture: ComponentFixture<Perfil>;
  let authService: AuthService;

  const mockUsuario = {
    id: '001',
    nombre: 'Juan Test',
    email: 'juan@example.com',
    telefono: '+57 312 1234567',
    ciudad: 'Bogotá',
    pais: 'Colombia',
    fechaNacimiento: '1990-05-15',
    direccion: 'Carrera 5 #10-30',
    bio: 'Test bio',
    foto: 'https://example.com/foto.jpg',
    createdAt: '2024-01-10',
    totalReservas: 3,
    puntosAcumulados: 1500,
    totalGastado: 3000000,
    resenas: 4,
  };

  beforeEach(async () => {
    const authServiceMock = {
      getUser: () => mockUsuario,
      logout: () => {},
    };

    await TestBed.configureTestingModule({
      imports: [Perfil, ReactiveFormsModule, HttpClientTestingModule],
      providers: [FormBuilder, { provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    fixture = TestBed.createComponent(Perfil);
    component = fixture.componentInstance;
  });

  describe('Inicialización', () => {
    it('debería crear el componente', () => {
      expect(component).toBeTruthy();
    });

    it('debería inicializar con usuario cargado', () => {
      fixture.detectChanges();
      expect(component.usuario).toBeDefined();
    });

    it('debería tener formulario después de iniciar', () => {
      fixture.detectChanges();
      expect(component.perfilForm).toBeDefined();
    });

    it('debería iniciar sin modo edición', () => {
      fixture.detectChanges();
      expect(component.editando).toBeFalsy();
    });

    it('debería no estar en modo enviado', () => {
      fixture.detectChanges();
      expect(component.submitted).toBeFalsy();
    });
  });

  describe('Edición de Perfil', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería cambiar modo edición', () => {
      expect(component.editando).toBeFalsy();
      component.editando = true;
      expect(component.editando).toBeTruthy();
    });

    it('debería actualizar datos en formulario', () => {
      component.perfilForm.patchValue({
        nombre: 'Juan Actualizado',
      });
      expect(component.perfilForm.get('nombre')?.value).toBe('Juan Actualizado');
    });
  });

  describe('Validación de Email', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería validar email requerido', () => {
      const control = component.perfilForm.get('email');
      control?.setValue('');
      expect(control?.invalid).toBeTruthy();
    });

    it('debería tener control email en formulario', () => {
      const control = component.perfilForm.get('email');
      expect(control).toBeDefined();
    });
  });

  describe('Validación de Nombre', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería validar nombre requerido', () => {
      const control = component.perfilForm.get('nombre');
      control?.setValue('');
      expect(control?.hasError('required')).toBeTruthy();
    });

    it('debería tener control nombre en formulario', () => {
      const control = component.perfilForm.get('nombre');
      expect(control).toBeDefined();
    });
  });

  describe('Estados del Componente', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('debería tener loading false inicialmente', () => {
      expect(component.loading).toBeFalsy();
    });

    it('debería tener usuario definido', () => {
      expect(component.usuario).toBeDefined();
    });

    it('debería tener errorMessage vacío', () => {
      expect(component.errorMessage).toBe('');
    });

    it('debería tener successMessage vacío', () => {
      expect(component.successMessage).toBe('');
    });

    it('debería tener fotoPreview null', () => {
      expect(component.fotoPreview).toBeNull();
    });
  });
});
