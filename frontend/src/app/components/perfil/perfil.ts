import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  perfilForm!: FormGroup;
  loading = false;
  submitted = false;
  editando = false;
  usuario: any = null;
  errorMessage = '';
  successMessage = '';
  fotoPreview: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * Carga los datos del usuario actual
   */
  private cargarDatos(): void {
    this.usuario = this.authService.getUser();

    if (!this.usuario) {
      this.router.navigate(['/login']);
      return;
    }

    this.inicializarFormulario();
  }

  /**
   * Inicializa el formulario con los datos del usuario
   */
  private inicializarFormulario(): void {
    this.perfilForm = this.formBuilder.group({
      nombre: [
        this.usuario?.nombre || '',
        [Validators.required, Validators.minLength(3)],
      ],
      email: [
        this.usuario?.email || '',
        [Validators.required, Validators.email],
      ],
      telefono: [
        this.usuario?.telefono || '',
        [Validators.required, Validators.pattern(/^[0-9\s\-\+\(\)]{7,}$/)],
      ],
      ciudad: [this.usuario?.ciudad || '', Validators.required],
      pais: [this.usuario?.pais || '', Validators.required],
      fechaNacimiento: [this.usuario?.fechaNacimiento || ''],
      direccion: [this.usuario?.direccion || ''],
      bio: [this.usuario?.bio || '', Validators.maxLength(500)],
    });

    this.perfilForm.disable();
  }

  /**
   * Getter para acceder a los controles
   */
  get f() {
    return this.perfilForm.controls;
  }

  /**
   * Habilita la edición
   */
  habilitarEdicion(): void {
    this.editando = true;
    this.perfilForm.enable();
    this.errorMessage = '';
  }

  /**
   * Cancela la edición
   */
  cancelarEdicion(): void {
    this.editando = false;
    this.perfilForm.disable();
    this.inicializarFormulario();
    this.fotoPreview = null;
  }

  /**
   * Guarda los cambios del perfil
   */
  guardarCambios(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.perfilForm.invalid) {
      return;
    }

    this.loading = true;

    const datosActualizados = this.perfilForm.getRawValue();

    // Aquí iría la llamada al servicio para actualizar el perfil
    // this.usuarioService.actualizarPerfil(datosActualizados).subscribe(...)

    setTimeout(() => {
      this.loading = false;
      this.successMessage = 'Perfil actualizado exitosamente';
      this.editando = false;
      this.perfilForm.disable();
      this.submitted = false;

      // Actualizar datos locales
      this.usuario = { ...this.usuario, ...datosActualizados };
    }, 1500);
  }

  /**
   * Maneja la selección de foto de perfil
   */
  onFotoSeleccionada(event: any): void {
    const archivo = event.target.files[0];

    if (!archivo) return;

    // Validar tipo de archivo
    const tiposValidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!tiposValidos.includes(archivo.type)) {
      this.errorMessage = 'Solo se permiten imágenes (JPG, PNG, WebP)';
      return;
    }

    // Validar tamaño (máx 5MB)
    if (archivo.size > 5 * 1024 * 1024) {
      this.errorMessage = 'La imagen no debe superar 5MB';
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.fotoPreview = e.target?.result as string;
    };
    reader.readAsDataURL(archivo);

    // Aquí iría la carga de la foto al servidor
    // this.usuarioService.subirFoto(archivo).subscribe(...)
  }

  /**
   * Inicia el cambio de contraseña
   */
  irACambiarContrasena(): void {
    this.router.navigate(['/cambiar-contrasena']);
  }
}
