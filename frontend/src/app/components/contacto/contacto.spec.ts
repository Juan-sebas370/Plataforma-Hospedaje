import { ChangeDetectorRef } from '@angular/core';
import { Contacto } from './contacto';
import { ContactoService } from '../../services/contacto.service';

/** Validación del formulario de contacto (defecto D-W1 del plan de pruebas). */
describe('Contacto · validación del formulario', () => {
  let c: Contacto;

  beforeEach(() => {
    c = new Contacto({} as ContactoService, {} as ChangeDetectorRef);
    c.form = { ...c.form, nombre: 'Ana', email: 'ana@correo.com', asunto: 'reserva', mensaje: 'Hola', politica: true };
  });

  it('con todos los datos y un correo válido se puede enviar', () => {
    expect(c.emailInvalido).toBe(false);
    expect(c.formularioValido).toBe(true);
  });

  it('con un correo sin formato válido no se puede enviar', () => {
    for (const email of ['correo-sin-arroba', 'ana@', '@correo.com', 'ana@correo', 'ana correo@x.com']) {
      c.form.email = email;
      expect({ email, invalido: c.emailInvalido, valido: c.formularioValido }).toEqual({ email, invalido: true, valido: false });
    }
  });

  it('con el correo vacío no marca "correo inválido" pero tampoco deja enviar', () => {
    c.form.email = '   ';
    expect(c.emailInvalido).toBe(false);
    expect(c.formularioValido).toBe(false);
  });
});
