import { ChangeDetectorRef, Component } from '@angular/core';
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
  private solicitudPendiente = false;

  constructor(private contactoService: ContactoService, private cdr: ChangeDetectorRef) {}

  // ── Submit ────────────────────────────────────────────────
  enviarFormulario(): void {
    if (this.solicitudPendiente) {
      return;
    }

    if (!this.form.politica) {
      this.errorMensaje = 'Debes aceptar la política de privacidad para continuar.';
      return;
    }

    this.solicitudPendiente = true;
    this.estadoEnvio  = 'ok';
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

    // Confirmación optimista: la petición continúa en segundo plano. Se guarda
    // una copia para devolverle a la persona lo que escribió si el envío falla.
    const escrito = { ...this.form };
    this.limpiarFormulario();

    this.contactoService.enviar(payload).subscribe({
      next: () => {
        this.solicitudPendiente = false;
        // La app es zoneless: sin esto la vista no se actualiza al llegar la respuesta.
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.solicitudPendiente = false;
        this.form = escrito;
        this.estadoEnvio  = 'error';
        this.errorMensaje = err?.error?.message
          ?? 'Ocurrió un error al enviar el mensaje. Por favor intenta de nuevo.';
        this.cdr.detectChanges();
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
