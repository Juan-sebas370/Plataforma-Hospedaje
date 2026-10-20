import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Icono } from '../../shared/icono';

type Estado = 'validando' | 'invalido' | 'formulario' | 'enviando' | 'listo';

const MINIMO = 8;
const ENLACE_VENCIDO = 'Este enlace ya venció: dura 24 horas. Solicita uno nuevo.';
const ENLACE_INVALIDO = 'Este enlace no es válido o ya se usó. Solicita uno nuevo.';

/**
 * Página que abre el enlace del correo de recuperación (/reset-password?token=…):
 * valida el enlace con el backend y permite elegir una contraseña nueva.
 */
@Component({
  selector: 'app-restablecer-contrasena',
  imports: [FormsModule, RouterLink, Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './restablecer-contrasena.html',
  styleUrl: './restablecer-contrasena.css',
})
export class RestablecerContrasena implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly minimo = MINIMO;
  readonly estado = signal<Estado>('validando');
  readonly email = signal('');
  readonly motivo = signal('');
  readonly nueva = signal('');
  readonly confirmacion = signal('');
  readonly verClave = signal(false);
  readonly intento = signal(false);
  readonly errorServidor = signal('');
  private token = '';

  readonly largoOk = computed(() => this.nueva().length >= MINIMO);
  readonly coinciden = computed(() => this.confirmacion().length > 0 && this.nueva() === this.confirmacion());
  readonly errorNueva = computed(() =>
    this.intento() && !this.largoOk() ? `La contraseña debe tener al menos ${MINIMO} caracteres.` : '');
  readonly errorConfirmacion = computed(() =>
    this.intento() && !this.coinciden() ? 'Las dos contraseñas no coinciden.' : '');

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.invalido('El enlace no trae el código de recuperación. Ábrelo directamente desde el correo.');
      return;
    }
    this.auth.validateResetToken(this.token).subscribe({
      next: r => {
        this.email.set(r?.email ?? '');
        this.estado.set('formulario');
      },
      error: e => this.invalido(this.mensaje(e, 'invalido')),
    });
  }

  guardar(evento: Event): void {
    evento.preventDefault();
    this.intento.set(true);
    this.errorServidor.set('');
    if (!this.largoOk() || !this.coinciden()) return;
    this.estado.set('enviando');
    this.auth.resetPassword(this.token, this.nueva(), this.confirmacion()).subscribe({
      next: () => this.estado.set('listo'),
      error: e => {
        const texto = this.mensaje(e, 'guardar');
        if (texto === ENLACE_VENCIDO || texto === ENLACE_INVALIDO) {
          this.invalido(texto);
        } else {
          this.errorServidor.set(texto);
          this.estado.set('formulario');
        }
      },
    });
  }

  private invalido(motivo: string): void {
    this.motivo.set(motivo);
    this.estado.set('invalido');
  }

  /** Traduce la respuesta del backend a un mensaje claro para la persona. */
  private mensaje(e: any, contexto: 'invalido' | 'guardar'): string {
    const crudo = String(e?.error?.message ?? e?.error?.error ?? (typeof e?.error === 'string' ? e.error : ''));
    if (/expirad/i.test(crudo)) return ENLACE_VENCIDO;
    if (/inválid|invalid/i.test(crudo)) return ENLACE_INVALIDO;
    if (e?.status === 0) return 'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.';
    if (crudo) return crudo;
    return contexto === 'invalido'
      ? 'No pudimos validar el enlace. Intenta de nuevo en un momento.'
      : 'No pudimos guardar la contraseña. Intenta de nuevo en un momento.';
  }
}
