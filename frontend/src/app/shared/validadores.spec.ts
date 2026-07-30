/**
 * Tests unitarios para Validadores
 * Cubre: ValidadorUtils, FormatoUtils, AlmacenamientoUtils
 */

import { TestBed } from '@angular/core/testing';
import {
  ValidadorUtils,
  FormatoUtils,
  AlmacenamientoUtils,
} from '../utils/validadores';

describe('Validadores Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // ========================================
  // VALIDADOR UTILS TESTS
  // ========================================

  describe('ValidadorUtils', () => {
    describe('validarEmail', () => {
      it('debería validar email válido', () => {
        expect(ValidadorUtils.validarEmail('test@example.com')).toBeTruthy();
        expect(ValidadorUtils.validarEmail('user.name+tag@example.co.uk')).toBeTruthy();
      });

      it('debería rechazar email inválido', () => {
        expect(ValidadorUtils.validarEmail('invalid-email')).toBeFalsy();
        expect(ValidadorUtils.validarEmail('test@')).toBeFalsy();
        expect(ValidadorUtils.validarEmail('@example.com')).toBeFalsy();
        expect(ValidadorUtils.validarEmail('')).toBeFalsy();
      });

      it('debería rechazar email con espacios', () => {
        expect(ValidadorUtils.validarEmail('test @example.com')).toBeFalsy();
      });
    });

    describe('validarTelefono', () => {
      it('debería validar teléfono válido', () => {
        expect(ValidadorUtils.validarTelefono('+573121234567')).toBeTruthy();
        expect(ValidadorUtils.validarTelefono('3121234567')).toBeTruthy();
        expect(ValidadorUtils.validarTelefono('+57 312 1234567')).toBeTruthy();
      });

      it('debería rechazar teléfono inválido', () => {
        expect(ValidadorUtils.validarTelefono('123')).toBeFalsy();
        expect(ValidadorUtils.validarTelefono('')).toBeFalsy();
      });

      it('debería ignorar caracteres no numéricos', () => {
        expect(ValidadorUtils.validarTelefono('+57-312-1234567')).toBeTruthy();
      });
    });

    describe('validarContraseniaFuerte', () => {
      it('debería validar contraseña fuerte', () => {
        const resultado = ValidadorUtils.validarContraseniaFuerte('MyPassword123!@#');
        expect(resultado.esValida).toBeTruthy();
        expect(resultado.requisitos.mayusculas).toBeTruthy();
        expect(resultado.requisitos.minusculas).toBeTruthy();
        expect(resultado.requisitos.numeros).toBeTruthy();
        expect(resultado.requisitos.caracteresespeciales).toBeTruthy();
      });

      it('debería rechazar contraseña sin mayúsculas', () => {
        const resultado = ValidadorUtils.validarContraseniaFuerte('mypassword123!@#');
        expect(resultado.esValida).toBeFalsy();
        expect(resultado.requisitos.mayusculas).toBeFalsy();
      });

      it('debería rechazar contraseña sin minúsculas', () => {
        const resultado = ValidadorUtils.validarContraseniaFuerte('MYPASSWORD123!@#');
        expect(resultado.esValida).toBeFalsy();
        expect(resultado.requisitos.minusculas).toBeFalsy();
      });

      it('debería rechazar contraseña sin números', () => {
        const resultado = ValidadorUtils.validarContraseniaFuerte('MyPassword!@#');
        expect(resultado.esValida).toBeFalsy();
        expect(resultado.requisitos.numeros).toBeFalsy();
      });

      it('debería rechazar contraseña sin caracteres especiales', () => {
        const resultado = ValidadorUtils.validarContraseniaFuerte('MyPassword123');
        expect(resultado.esValida).toBeFalsy();
        expect(resultado.requisitos.caracteresespeciales).toBeFalsy();
      });

      it('debería rechazar contraseña muy corta', () => {
        const resultado = ValidadorUtils.validarContraseniaFuerte('Pass1!');
        expect(resultado.esValida).toBeFalsy();
        expect(resultado.requisitos.longitud).toBeFalsy();
      });
    });

    describe('calcularFortaleza', () => {
      it('debería retornar 0 para contraseña vacía', () => {
        expect(ValidadorUtils.calcularFortaleza('')).toBe(0);
      });

      it('debería calcular fortaleza baja para contraseña simple', () => {
        const fortaleza = ValidadorUtils.calcularFortaleza('abc');
        expect(fortaleza).toBeLessThan(30);
      });

      it('debería calcular fortaleza alta para contraseña fuerte', () => {
        const fortaleza = ValidadorUtils.calcularFortaleza('MyPassword123!@#123');
        expect(fortaleza).toBeGreaterThanOrEqual(80);
      });

      it('debería retornar valor entre 0 y 100', () => {
        const resultado = ValidadorUtils.calcularFortaleza('TestPassword123!@#');
        expect(resultado).toBeGreaterThanOrEqual(0);
        expect(resultado).toBeLessThanOrEqual(100);
      });
    });

    describe('validarNombre', () => {
      it('debería validar nombre válido', () => {
        expect(ValidadorUtils.validarNombre('Juan')).toBeTruthy();
        expect(ValidadorUtils.validarNombre('Juan Sebastian')).toBeTruthy();
      });

      it('debería rechazar nombre muy corto', () => {
        expect(ValidadorUtils.validarNombre('Jo')).toBeFalsy();
      });

      it('debería rechazar nombre vacío', () => {
        expect(ValidadorUtils.validarNombre('')).toBeFalsy();
      });

      it('debería permitir hasta 100 caracteres', () => {
        const nombreLargo = 'A'.repeat(100);
        expect(ValidadorUtils.validarNombre(nombreLargo)).toBeTruthy();

        const nombreMuyLargo = 'A'.repeat(101);
        expect(ValidadorUtils.validarNombre(nombreMuyLargo)).toBeFalsy();
      });

      it('debería rechazar nombre con solo espacios', () => {
        expect(ValidadorUtils.validarNombre('   ')).toBeFalsy();
      });
    });

    describe('validarCiudad', () => {
      it('debería validar ciudad válida', () => {
        expect(ValidadorUtils.validarCiudad('Bogotá')).toBeTruthy();
        expect(ValidadorUtils.validarCiudad('Santa Marta')).toBeTruthy();
      });

      it('debería rechazar ciudad muy corta', () => {
        expect(ValidadorUtils.validarCiudad('LA')).toBeFalsy();
      });

      it('debería rechazar ciudad vacía', () => {
        expect(ValidadorUtils.validarCiudad('')).toBeFalsy();
      });

      it('debería permitir hasta 50 caracteres', () => {
        const ciudadLarga = 'A'.repeat(50);
        expect(ValidadorUtils.validarCiudad(ciudadLarga)).toBeTruthy();

        const ciudadMuyLarga = 'A'.repeat(51);
        expect(ValidadorUtils.validarCiudad(ciudadMuyLarga)).toBeFalsy();
      });
    });

    describe('validarPais', () => {
      it('debería validar país válido', () => {
        expect(ValidadorUtils.validarPais('Colombia')).toBeTruthy();
        expect(ValidadorUtils.validarPais('España')).toBeTruthy();
      });

      it('debería rechazar país muy corto', () => {
        expect(ValidadorUtils.validarPais('AB')).toBeFalsy();
      });

      it('debería permitir hasta 50 caracteres', () => {
        const paisLargo = 'A'.repeat(50);
        expect(ValidadorUtils.validarPais(paisLargo)).toBeTruthy();
      });
    });

    describe('validarURL', () => {
      it('debería validar URL válida', () => {
        expect(ValidadorUtils.validarURL('https://example.com')).toBeTruthy();
        expect(ValidadorUtils.validarURL('https://www.example.com/path')).toBeTruthy();
        expect(ValidadorUtils.validarURL('http://localhost:3000')).toBeTruthy();
      });

      it('debería rechazar URL inválida', () => {
        expect(ValidadorUtils.validarURL('not a url')).toBeFalsy();
        expect(ValidadorUtils.validarURL('ht://invalid')).toBeFalsy();
        expect(ValidadorUtils.validarURL('')).toBeFalsy();
      });
    });

    describe('validarFechaNacimiento', () => {
      it('debería validar fecha de nacimiento válida', () => {
        const resultado = ValidadorUtils.validarFechaNacimiento('1990-05-15');
        expect(resultado.valida).toBeTruthy();
        expect(resultado.edad).toBeGreaterThanOrEqual(34);
      });

      it('debería rechazar fecha futura', () => {
        const futuro = new Date();
        futuro.setFullYear(futuro.getFullYear() + 1);
        const fechaFutura = futuro.toISOString().split('T')[0];
        const resultado = ValidadorUtils.validarFechaNacimiento(fechaFutura);
        expect(resultado.valida).toBeFalsy();
        expect(resultado.error).toContain('futura');
      });

      it('debería calcular edad correctamente', () => {
        const resultado = ValidadorUtils.validarFechaNacimiento('2000-01-01');
        expect(resultado.edad).toBeGreaterThanOrEqual(24);
      });

      it('debería rechazar menores de 18 años', () => {
        const unAnoAtras = new Date();
        unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 16);
        const fechaMenor = unAnoAtras.toISOString().split('T')[0];
        const resultado = ValidadorUtils.validarFechaNacimiento(fechaMenor);
        expect(resultado.valida).toBeFalsy();
        expect(resultado.error).toContain('mayor de 18');
      });

      it('debería rechazar fecha tán antigua', () => {
        const resultado = ValidadorUtils.validarFechaNacimiento('1800-01-01');
        expect(resultado.valida).toBeFalsy();
      });
    });

    describe('formatearTelefono', () => {
      it('debería formatear teléfono a formato XXX-XXX-XXXX', () => {
        const resultado = ValidadorUtils.formatearTelefono('3121234567');
        expect(resultado).toBe('312-123-4567');
      });

      it('debería manejar teléfono con espacios', () => {
        const resultado = ValidadorUtils.formatearTelefono('312 123 4567');
        expect(resultado).toContain('-');
      });

      it('debería manejar teléfono vacío', () => {
        expect(ValidadorUtils.formatearTelefono('')).toBe('');
      });

      it('debería manejar teléfono corto', () => {
        const resultado = ValidadorUtils.formatearTelefono('123');
        expect(resultado).toBe('123');
      });
    });

    describe('sanitizar', () => {
      it('debería prevenir XSS attack', () => {
        const conScriptInjection = '<script>alert("XSS")</script>';
        const sanitizado = ValidadorUtils.sanitizar(conScriptInjection);
        expect(sanitizado).not.toContain('<script>');
        expect(sanitizado).toContain('&lt;');
      });

      it('debería sanitizar HTML especial', () => {
        const conHTML = '<b>Bold</b>';
        const sanitizado = ValidadorUtils.sanitizar(conHTML);
        expect(sanitizado).toContain('&lt;');
      });

      it('debería preservar texto normal', () => {
        const textoNormal = 'Texto normal sin HTML';
        const sanitizado = ValidadorUtils.sanitizar(textoNormal);
        expect(sanitizado).toBe(textoNormal);
      });

      it('debería escapar comillas', () => {
        const conComillas = 'Texto con "comillas" y \'apóstrofos\'';
        const sanitizado = ValidadorUtils.sanitizar(conComillas);
        expect(sanitizado).toContain('&quot;');
        expect(sanitizado).toContain('&#039;');
      });
    });

    describe('generarMensajeError', () => {
      it('debería generar mensaje para error 400', () => {
        const mensaje = ValidadorUtils.generarMensajeError(400);
        expect(mensaje).toContain('inválida');
      });

      it('debería generar mensaje para error 401', () => {
        const mensaje = ValidadorUtils.generarMensajeError('401');
        expect(mensaje).toContain('autenticado');
      });

      it('debería generar mensaje para error network', () => {
        const mensaje = ValidadorUtils.generarMensajeError('network');
        expect(mensaje).toContain('conexión');
      });

      it('debería retornar mensaje genérico para error desconocido', () => {
        const mensaje = ValidadorUtils.generarMensajeError('999');
        expect(mensaje).toContain('inesperado');
      });
    });

    describe('validarArchivo', () => {
      it('debería validar archivo de imagen', () => {
        const archivo = new File(['contenido'], 'imagen.jpg', { type: 'image/jpeg' });
        const resultado = ValidadorUtils.validarArchivo(archivo, ['image/jpeg', 'image/png']);
        expect(resultado.valido).toBeTruthy();
      });

      it('debería rechazar tipo de archivo no permitido', () => {
        const archivo = new File(['contenido'], 'documento.pdf', { type: 'application/pdf' });
        const resultado = ValidadorUtils.validarArchivo(archivo, ['image/jpeg', 'image/png']);
        expect(resultado.valido).toBeFalsy();
        expect(resultado.error).toContain('no permitido');
      });

      it('debería rechazar archivo demasiado grande', () => {
        const blob = new Blob([new ArrayBuffer(10 * 1024 * 1024)]);
        const archivo = new File([blob], 'grande.jpg', { type: 'image/jpeg' });
        const resultado = ValidadorUtils.validarArchivo(archivo, ['image/jpeg'], 5);
        expect(resultado.valido).toBeFalsy();
        expect(resultado.error).toContain('tamaño');
      });

      it('debería usar tipos por defecto si no se proporcionan', () => {
        const archivo = new File(['contenido'], 'imagen.jpg', { type: 'image/jpeg' });
        const resultado = ValidadorUtils.validarArchivo(archivo);
        expect(resultado.valido).toBeTruthy();
      });
    });
  });

  // ========================================
  // FORMATO UTILS TESTS
  // ========================================

  describe('FormatoUtils', () => {
    describe('formatearMoneda', () => {
      it('debería formatear moneda en COP', () => {
        const resultado = FormatoUtils.formatearMoneda(1500000, 'COP');
        expect(resultado).toContain('1');
      });

      it('debería usar COP por defecto', () => {
        const resultado = FormatoUtils.formatearMoneda(1000);
        expect(typeof resultado).toBe('string');
      });

      it('debería manejar moneda USD', () => {
        const resultado = FormatoUtils.formatearMoneda(1000, 'USD');
        expect(typeof resultado).toBe('string');
      });
    });

    describe('formatearFecha', () => {
      it('debería formatear fecha en español', () => {
        const fecha = new Date('2024-11-25');
        const resultado = FormatoUtils.formatearFecha(fecha);
        expect(resultado).toBeDefined();
        expect(resultado).toContain('2024');
      });

      it('debería manejar string de fecha', () => {
        const resultado = FormatoUtils.formatearFecha('2024-11-25');
        expect(resultado).toBeDefined();
      });
    });

    describe('formatearHora', () => {
      it('debería formatear hora en HH:mm', () => {
        const fecha = new Date('2024-11-25T14:30:00');
        const resultado = FormatoUtils.formatearHora(fecha);
        expect(resultado).toMatch(/\d{2}:\d{2}/);
      });

      it('debería manejar string de fecha', () => {
        const resultado = FormatoUtils.formatearHora('2024-11-25T14:30:00');
        expect(resultado).toBeDefined();
      });
    });

    describe('capitalizarNombre', () => {
      it('debería capitalizar nombre correctamente', () => {
        expect(FormatoUtils.capitalizarNombre('juan')).toContain('Juan');
        expect(FormatoUtils.capitalizarNombre('JUAN')).toContain('Juan');
      });

      it('debería manejar nombres compuestos', () => {
        const resultado = FormatoUtils.capitalizarNombre('juan sebastian');
        expect(resultado).toContain('Juan');
        expect(resultado).toContain('Sebastian');
      });
    });

    describe('obtenerIniciales', () => {
      it('debería obtener iniciales de nombre', () => {
        expect(FormatoUtils.obtenerIniciales('Juan Sebastian')).toBe('JS');
        expect(FormatoUtils.obtenerIniciales('María González')).toBe('MG');
      });

      it('debería manejar nombre singular', () => {
        expect(FormatoUtils.obtenerIniciales('Juan')).toBe('J');
      });

      it('debería limitar a 2 iniciales máximo', () => {
        const resultado = FormatoUtils.obtenerIniciales('Juan Carlos Rodriguez');
        expect(resultado.length).toBeLessThanOrEqual(2);
      });
    });

    describe('formatearTarjeta', () => {
      it('debería formatear número de tarjeta', () => {
        const resultado = FormatoUtils.formatearTarjeta('4532015112830366');
        expect(resultado).toBe('4532 0151 1283 0366');
      });

      it('debería manejar tarjeta incompleta', () => {
        const resultado = FormatoUtils.formatearTarjeta('4532');
        expect(resultado).toBeDefined();
      });

      it('debería ignorar espacios previos', () => {
        const resultado = FormatoUtils.formatearTarjeta('4532 0151 1283 0366');
        expect(resultado).toBe('4532 0151 1283 0366');
      });
    });

    describe('obtenerUltimosDigitos', () => {
      it('debería obtener últimos 4 dígitos', () => {
        expect(FormatoUtils.obtenerUltimosDigitos('4532015112830366')).toBe('0366');
      });

      it('debería manejar cadena corta', () => {
        const resultado = FormatoUtils.obtenerUltimosDigitos('123');
        expect(resultado).toBe('123');
      });

      it('debería ignorar espacios', () => {
        expect(FormatoUtils.obtenerUltimosDigitos('4532 0151 1283 0366')).toBe('0366');
      });
    });

    describe('formatearPorcentaje', () => {
      it('debería formatear porcentaje', () => {
        expect(FormatoUtils.formatearPorcentaje(75.5)).toContain('75');
        expect(FormatoUtils.formatearPorcentaje(0.5)).toContain('0.5');
      });

      it('debería respetar precisión decimal', () => {
        const resultado = FormatoUtils.formatearPorcentaje(75.456, 2);
        expect(resultado).toContain('75.46');
      });

      it('debería incluir el símbolo %', () => {
        const resultado = FormatoUtils.formatearPorcentaje(50);
        expect(resultado).toContain('%');
      });
    });

    describe('tiempoTranscurrido', () => {
      it('debería calcular hace segundos', () => {
        const hace10Segundos = new Date(Date.now() - 10000);
        const resultado = FormatoUtils.tiempoTranscurrido(hace10Segundos);
        expect(resultado).toContain('s');
      });

      it('debería calcular hace minutos', () => {
        const hace5Minutos = new Date(Date.now() - 5 * 60 * 1000);
        const resultado = FormatoUtils.tiempoTranscurrido(hace5Minutos);
        expect(resultado).toContain('m');
      });

      it('debería calcular hace horas', () => {
        const hace2Horas = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const resultado = FormatoUtils.tiempoTranscurrido(hace2Horas);
        expect(resultado).toContain('h');
      });

      it('debería manejar string de fecha', () => {
        const resultado = FormatoUtils.tiempoTranscurrido(new Date().toISOString());
        expect(resultado).toBeDefined();
      });
    });
  });

  // ========================================
  // ALMACENAMIENTO UTILS TESTS
  // ========================================

  describe('AlmacenamientoUtils', () => {
    describe('localStorage', () => {
      it('debería almacenar y obtener datos', () => {
        const datos = { nombre: 'Juan', edad: 30 };
        AlmacenamientoUtils.almacenar('usuario', datos);

        const recuperados = AlmacenamientoUtils.obtener('usuario');
        expect(recuperados).toEqual(datos);
      });

      it('debería eliminar datos', () => {
        AlmacenamientoUtils.almacenar('test', { datos: 'test' });
        AlmacenamientoUtils.eliminar('test');

        const resultado = AlmacenamientoUtils.obtener('test');
        expect(resultado).toBeNull();
      });

      it('debería retornar null para clave inexistente', () => {
        const resultado = AlmacenamientoUtils.obtener('no-existe');
        expect(resultado).toBeNull();
      });

      it('debería limpiar todo localStorage', () => {
        AlmacenamientoUtils.almacenar('test1', 'valor1');
        AlmacenamientoUtils.almacenar('test2', 'valor2');
        AlmacenamientoUtils.limpiar();

        expect(localStorage.length).toBe(0);
      });

      it('debería preservar tipo de datos', () => {
        const array = [1, 2, 3, 4, 5];
        AlmacenamientoUtils.almacenar('array', array);
        const recuperado = AlmacenamientoUtils.obtener('array');
        expect(Array.isArray(recuperado)).toBeTruthy();
        expect(recuperado).toEqual(array);
      });

      it('debería almacenar objetos complejos', () => {
        const objeto = {
          nombre: 'Juan',
          edad: 30,
          activo: true,
          calificaciones: [8, 9, 7],
        };
        AlmacenamientoUtils.almacenar('objeto', objeto);
        const recuperado = AlmacenamientoUtils.obtener('objeto');
        expect(recuperado).toEqual(objeto);
      });
    });

    describe('sessionStorage', () => {
      it('debería almacenar y obtener datos de sesión', () => {
        const datos = { token: 'abc123' };
        AlmacenamientoUtils.almacenarSesion('auth', datos);

        const recuperados = AlmacenamientoUtils.obtenerSesion('auth');
        expect(recuperados).toEqual(datos);
      });

      it('debería almacenar y recuperar de sessionStorage', () => {
        const testData = { data: 'test' };
        AlmacenamientoUtils.almacenarSesion('test', testData);
        const resultado = AlmacenamientoUtils.obtenerSesion('test');
        expect(resultado).toEqual(testData);
      });

      it('debería retornar null para sesión inexistente', () => {
        const resultado = AlmacenamientoUtils.obtenerSesion('no-existe');
        expect(resultado).toBeNull();
      });

      it('debería preservar tipos en sessionStorage', () => {
        const numero = 42;
        AlmacenamientoUtils.almacenarSesion('numero', numero);
        const recuperado = AlmacenamientoUtils.obtenerSesion('numero');
        expect(recuperado).toBe(numero);
        expect(typeof recuperado).toBe('number');
      });
    });
  });
});
