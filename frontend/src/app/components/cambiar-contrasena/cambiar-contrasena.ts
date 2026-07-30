import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cambiar-contrasena',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cambiar-contrasena.html',
  styleUrl: './cambiar-contrasena.css',
})
export class CambiarContrasena implements OnInit {
  cambioForm!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';
  
  // Indicadores de visibilidad
  mostrarActual = false;
  mostrarNueva = false;
  mostrarConfirmar = false;

  // Indicador de fortaleza
  fortalezaContrasena = 0;
  fortalezaTexto = '';
  fortalezaColor = '';
  private isBrowser = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  /**
   * Inicializa el formulario de cambio de contraseña
   */
  private inicializarFormulario(): void {
    this.cambioForm = this.formBuilder.group({
      contraseniaActual: ['', [Validators.required, Validators.minLength(6)]],
      contraseniaNueva: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          this.validarFortalezaContrasena.bind(this),
        ],
      ],
      confirmarContrasena: ['', Validators.required],
    });

    // Only set custom validators in browser environment to avoid SSR issues
    if (this.isBrowser) {
      // Validador personalizado para confirmar contraseña
      this.cambioForm.setValidators(this.validarCoincidenciaContrasenas());

      // Escuchar cambios en contraseña nueva para calcular fortaleza
      this.cambioForm
        .get('contraseniaNueva')
        ?.valueChanges.subscribe((valor) => {
          this.calcularFortaleza(valor);
        });
    }
  }

  /**
   * Getter para acceder a los controles
   */
  get f() {
    return this.cambioForm.controls;
  }

  /**
   * Validadores de requisitos de contraseña - Métodos expuestos para el template
   */
  tieneMinuscula(): boolean {
    const valor = this.cambioForm.get('contraseniaNueva')?.value || '';
    return /[a-z]/.test(valor);
  }

  tieneMayuscula(): boolean {
    const valor = this.cambioForm.get('contraseniaNueva')?.value || '';
    return /[A-Z]/.test(valor);
  }

  tieneNumero(): boolean {
    const valor = this.cambioForm.get('contraseniaNueva')?.value || '';
    return /[0-9]/.test(valor);
  }

  tieneCaracterEspecial(): boolean {
    const valor = this.cambioForm.get('contraseniaNueva')?.value || '';
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(valor);
  }

  tieneMinimo8(): boolean {
    const valor = this.cambioForm.get('contraseniaNueva')?.value || '';
    return valor.length >= 8;
  }

  /**
   * Validador de fortaleza de contraseña
   */
  private validarFortalezaContrasena(
    control: AbstractControl
  ): ValidationErrors | null {
    const valor = control.value;

    if (!valor) return null;

    const tieneMinuscula = /[a-z]/.test(valor);
    const tieneMayuscula = /[A-Z]/.test(valor);
    const tieneNumero = /[0-9]/.test(valor);
    const tieneCaracterEspecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      valor
    );

    const esValida =
      tieneMinuscula && tieneMayuscula && tieneNumero && tieneCaracterEspecial;

    return esValida ? null : { fortalezaInsuficiente: true };
  }

  /**
   * Calcula la fortaleza de la contraseña
   */
  private calcularFortaleza(contrasena: string): void {
    if (!contrasena) {
      this.fortalezaContrasena = 0;
      this.fortalezaTexto = '';
      this.fortalezaColor = '';
      return;
    }

    let fortaleza = 0;

    if (contrasena.length >= 8) fortaleza += 20;
    if (contrasena.length >= 12) fortaleza += 10;
    if (contrasena.length >= 16) fortaleza += 10;
    if (/[a-z]/.test(contrasena)) fortaleza += 15;
    if (/[A-Z]/.test(contrasena)) fortaleza += 15;
    if (/[0-9]/.test(contrasena)) fortaleza += 15;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(contrasena))
      fortaleza += 15;

    this.fortalezaContrasena = Math.min(fortaleza, 100);

    if (this.fortalezaContrasena < 30) {
      this.fortalezaTexto = 'Muy débil';
      this.fortalezaColor = '#e74c3c';
    } else if (this.fortalezaContrasena < 50) {
      this.fortalezaTexto = 'Débil';
      this.fortalezaColor = '#f39c12';
    } else if (this.fortalezaContrasena < 70) {
      this.fortalezaTexto = 'Regular';
      this.fortalezaColor = '#f1c40f';
    } else if (this.fortalezaContrasena < 90) {
      this.fortalezaTexto = 'Fuerte';
      this.fortalezaColor = '#27ae60';
    } else {
      this.fortalezaTexto = 'Muy fuerte';
      this.fortalezaColor = '#16a085';
    }
  }

  /**
   * Validador de coincidencia de contraseñas
   */
  private validarCoincidenciaContrasenas() {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const nueva = formGroup.get('contraseniaNueva');
      const confirmar = formGroup.get('confirmarContrasena');

      if (!nueva || !confirmar) return null;

      if (confirmar.errors && !confirmar.errors['noCoinciden']) {
        return null;
      }

      if (nueva.value !== confirmar.value) {
        confirmar.setErrors({ noCoinciden: true });
        return { noCoinciden: true };
      } else {
        confirmar.setErrors(null);
        return null;
      }
    };
  }

  /**
   * Alterna la visibilidad de la contraseña actual
   */
  toggleMostrarActual(): void {
    this.mostrarActual = !this.mostrarActual;
  }

  /**
   * Alterna la visibilidad de la contraseña nueva
   */
  toggleMostrarNueva(): void {
    this.mostrarNueva = !this.mostrarNueva;
  }

  /**
   * Alterna la visibilidad de la contraseña de confirmación
   */
  toggleMostrarConfirmar(): void {
    this.mostrarConfirmar = !this.mostrarConfirmar;
  }

  /**
   * Verifica si la contraseña actual es válida
   */
  verificarContraseñaActual(): void {
    const contrasenahActual = this.cambioForm.get(
      'contraseniaActual'
    )?.value;

    if (!contrasenahActual) {
      this.errorMessage = 'Ingresa tu contraseña actual';
      return;
    }

    // Aquí iría la llamada al backend para verificar
    // this.authService.verificarContrasena(contraseniaActual).subscribe(...)
  }

  /**
   * Cambia la contraseña
   */
  cambiarContrasena(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.cambioForm.invalid) {
      return;
    }

    this.loading = true;

    const datos = {
      contraseniaActual: this.cambioForm.get('contraseniaActual')?.value,
      contraseniaNueva: this.cambioForm.get('contraseniaNueva')?.value,
    };

    // Aquí iría la llamada al servicio real
    // this.authService.cambiarContrasena(datos).subscribe(
    //   (response) => {
    //     this.loading = false;
    //     this.successMessage = '✅ Contraseña cambiada correctamente';
    //     setTimeout(() => this.router.navigate(['/perfil']), 2000);
    //   },
    //   (error) => {
    //     this.loading = false;
    //     this.errorMessage = error.error?.mensaje || 'Error al cambiar la contraseña';
    //   }
    // );

    // Simulación temporal
    setTimeout(() => {
      this.loading = false;
      this.successMessage = '✅ Contraseña cambiada correctamente';
      this.cambioForm.reset();
      this.submitted = false;
      setTimeout(() => this.router.navigate(['/perfil']), 2000);
    }, 1500);
  }

  /**
   * Vuelve al perfil sin cambios
   */
  volver(): void {
    this.router.navigate(['/perfil']);
  }
}
