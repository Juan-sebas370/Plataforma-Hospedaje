import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icono } from '../../../shared/icono';
import { DatosHuesped, ReservaEstado } from '../reserva-estado';
import { INDICATIVOS } from '../indicativos';
import { AuthService } from '../../../services/auth.service';

/**
 * Paso 3: datos del responsable de la reserva. Se conservan aunque la persona
 * vuelva a pasos anteriores (y se guardan en la sesión del navegador), y si
 * inició sesión, nombre y correo ya vienen escritos.
 */
@Component({
  selector: 'app-paso-datos',
  imports: [FormsModule, Icono],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../ui/reservas-ui.css', './paso-datos.css'],
  templateUrl: './paso-datos.html',
})
export class PasoDatos {
  readonly estado = inject(ReservaEstado);
  readonly conSesion = !!inject(AuthService).getUser();
  readonly indicativos = INDICATIVOS;

  readonly documentos = [
    { id: 'CC', nombre: 'Cédula de ciudadanía' },
    { id: 'CE', nombre: 'Cédula de extranjería' },
    { id: 'PA', nombre: 'Pasaporte' },
    { id: 'TI', nombre: 'Tarjeta de identidad' },
    { id: 'NIT', nombre: 'NIT (empresa)' },
    { id: 'otros', nombre: 'Otro' },
  ];

  readonly paises = INDICATIVOS
    .map(p => ({ iso: p.iso, nombre: p.nombre }))
    .sort((a, b) => a.iso === 'CO' ? -1 : b.iso === 'CO' ? 1 : a.nombre.localeCompare(b.nombre, 'es'));

  private readonly tocados = signal<Set<keyof DatosHuesped>>(new Set());
  readonly verNotas = signal(!!this.estado.datos().observaciones);

  readonly datos = this.estado.datos;
  readonly completos = computed(() => !this.estado.problemaDatos());

  set<K extends keyof DatosHuesped>(campo: K, valor: DatosHuesped[K]): void {
    this.estado.actualizarDatos({ [campo]: valor } as Partial<DatosHuesped>);
  }

  tocar(campo: keyof DatosHuesped): void {
    if (!this.tocados().has(campo)) this.tocados.set(new Set([...this.tocados(), campo]));
  }

  /** El error de un campo se muestra cuando ya lo dejó, o si intentó continuar. */
  error(campo: keyof DatosHuesped): string {
    const visible = this.tocados().has(campo) || this.estado.intentoFallido() === 'datos';
    return visible ? this.estado.erroresDatos()[campo] ?? '' : '';
  }

  /** Cambiar el país de residencia sugiere su indicativo, si aún no lo cambió. */
  cambiarPais(iso: string): void {
    const d = this.datos();
    const anterior = INDICATIVOS.find(p => p.iso === d.pais)?.codigo;
    const nuevo = INDICATIVOS.find(p => p.iso === iso)?.codigo;
    const cambios: Partial<DatosHuesped> = { pais: iso };
    if (nuevo && (!d.telefono || d.codigoPais === anterior)) cambios.codigoPais = nuevo;
    this.estado.actualizarDatos(cambios);
  }
}
