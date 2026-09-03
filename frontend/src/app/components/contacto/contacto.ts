import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../shared/translate.pipe';
import { ContactoService, ContactoRequest } from '../../services/contacto.service';

type EstadoEnvio = 'idle' | 'enviando' | 'ok' | 'error';

@Component({
  selector: 'app-contacto',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
})
export class Contacto {

  // ── Modelo del formulario ─────────────────────────────────
  form: ContactoRequest & { codigoPais: string; politica: boolean } = {
    nombre:     '',
    email:      '',
    telefono:   '',
    codigoPais: '+57',
    asunto:     '',
    mensaje:    '',
    categoria:  '',
    politica:   false,
  };

  estadoEnvio: EstadoEnvio = 'idle';
  errorMensaje = '';

  constructor(private contactoService: ContactoService) {}

  // ── Submit ────────────────────────────────────────────────
  enviarFormulario(): void {
    if (!this.form.politica) {
      this.errorMensaje = 'Debes aceptar la política de privacidad para continuar.';
      return;
    }

    this.estadoEnvio  = 'enviando';
    this.errorMensaje = '';

    // Combina código de país + número antes de enviar
    const payload: ContactoRequest = {
      nombre:    this.form.nombre.trim(),
      email:     this.form.email.trim(),
      telefono:  this.form.telefono
                   ? `${this.form.codigoPais} ${this.form.telefono.trim()}`
                   : undefined,
      asunto:    this.form.asunto,
      mensaje:   this.form.mensaje.trim(),
      categoria: this.form.asunto,   // usa el valor del select como categoría
    };

    this.contactoService.enviar(payload).subscribe({
      next: () => {
        this.estadoEnvio = 'ok';
        this.limpiarFormulario();
      },
      error: (err) => {
        this.estadoEnvio  = 'error';
        this.errorMensaje = err?.error?.message
          ?? 'Ocurrió un error al enviar el mensaje. Por favor intenta de nuevo.';
      },
    });
  }

  // ── Limpiar ───────────────────────────────────────────────
  limpiarFormulario(): void {
    this.form = {
      nombre:     '',
      email:      '',
      telefono:   '',
      codigoPais: '+57',
      asunto:     '',
      mensaje:    '',
      categoria:  '',
      politica:   false,
    };
    if (this.estadoEnvio !== 'ok') {
      this.estadoEnvio  = 'idle';
      this.errorMensaje = '';
    }
  }

  get enviando(): boolean  { return this.estadoEnvio === 'enviando'; }
  get enviado():  boolean  { return this.estadoEnvio === 'ok';       }
  get hayError(): boolean  { return this.estadoEnvio === 'error';    }

  // ── Formulario válido ─────────────────────────────────────
  get formularioValido(): boolean {
    return !!(
      this.form.nombre.trim() &&
      this.form.email.trim()  &&
      this.form.asunto        &&
      this.form.mensaje.trim() &&
      this.form.politica
    );
  }
}
