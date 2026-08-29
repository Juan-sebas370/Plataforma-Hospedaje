import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HabitacionService, Habitacion } from '../../services/habitacion.service';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  standalone: true,
  selector: 'app-habitacion-detalle',
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './habitacion-detalle.html',
  styleUrl: './habitacion-detalle.css',
})
export class HabitacionDetalle implements OnInit {
  habitacion: Habitacion | null = null;
  selectedImage: string = '';
  cargando: boolean = false;
  error: string = '';
  private isBrowser = false;

  private datosEjemplo: Habitacion[] = [
    {
      id: 1,
      numero: '101',
      tipo: 'Doble',
      piso: 1,
      capacidad: 2,
      precioNoche: 120000,
      descripcion: 'Habitación doble con vistas a la ciudad. Cama king size, baño privado con ducha de lluvia.',
      servicios: ['WiFi gratis', 'Aire acondicionado', 'Smart TV', 'Minibar'],
      imagenes: ['assets/habitaciones/piso1/hab101.jpg'],
      estado: 'DISPONIBLE',
      climatizacion: true,
      television: true,
      wifi: true,
      bano: true,
      minibar: true
    },
    {
      id: 2,
      numero: '102',
      tipo: 'Doble',
      piso: 1,
      capacidad: 2,
      precioNoche: 120000,
      descripcion: 'Habitación doble acogedora con balcón. Ideal para parejas en viaje de negocios.',
      servicios: ['WiFi gratis', 'Aire acondicionado', 'Escritorio', 'Caja fuerte'],
      imagenes: ['assets/habitaciones/piso1/hab102.jpg'],
      estado: 'DISPONIBLE',
      climatizacion: true,
      television: true,
      wifi: true,
      bano: true,
      minibar: false
    },
    {
      id: 3,
      numero: '103',
      tipo: 'Familiar',
      piso: 1,
      capacidad: 4,
      precioNoche: 180000,
      descripcion: 'Espaciosa habitación familiar con dos camas matrimoniales y área de estar.',
      servicios: ['WiFi gratis', 'TV por cable', 'Sofá cama', 'Área de juegos'],
      imagenes: ['assets/habitaciones/piso1/hab103.jpg'],
      estado: 'DISPONIBLE',
      climatizacion: true,
      television: true,
      wifi: true,
      bano: true,
      minibar: false
    },
    {
      id: 4,
      numero: '201',
      tipo: 'Individual',
      piso: 2,
      capacidad: 4,
      precioNoche: 80000,
      descripcion: 'Habitación con cama doble y camarote. Baño privado, ideal para 4 personas en un ambiente acogedor y tranquilo.',
      servicios: ['WiFi gratis', 'Agua caliente', 'Cocina equipada', 'Lavandería'],
      imagenes: ['assets/habitaciones/piso2/hab201.jpeg'],
      estado: 'DISPONIBLE',
      climatizacion: false,
      television: false,
      wifi: true,
      bano: true,
      minibar: false
    },
    {
      id: 5,
      numero: '202',
      tipo: 'Doble',
      piso: 2,
      capacidad: 2,
      precioNoche: 110000,
      descripcion: 'Habitación doble acogedora con cama matrimonial. Comparte baño con la habitación 203. Perfecta para parejas.',
      servicios: ['WiFi gratis', 'Agua caliente', 'Cocina equipada'],
      imagenes: ['assets/habitaciones/piso2/hab202.jpeg'],
      estado: 'DISPONIBLE',
      climatizacion: false,
      television: false,
      wifi: true,
      bano: false,
      minibar: false
    },
    {
      id: 6,
      numero: '203',
      tipo: 'Doble',
      piso: 2,
      capacidad: 2,
      precioNoche: 110000,
      descripcion: 'Habitación doble con cama matrimonial y ambiente tranquilo. Comparte baño con la habitación 202.',
      servicios: ['WiFi gratis', 'Agua caliente', 'Cocina equipada', 'Lavandería'],
      imagenes: ['assets/habitaciones/piso2/hab203.jpg'],
      estado: 'DISPONIBLE',
      climatizacion: false,
      television: false,
      wifi: true,
      bano: false,
      minibar: false
    },
    {
      id: 7,
      numero: '204',
      tipo: 'Individual',
      piso: 2,
      capacidad: 4,
      precioNoche: 80000,
      descripcion: 'Habitación con cama doble y camarote. Baño privado, ideal para 4 personas en un ambiente acogedor y tranquilo.',
      servicios: ['WiFi gratis', 'Agua caliente', 'Cocina equipada', 'Lavandería'],
      imagenes: ['assets/habitaciones/piso2/hab204.jpg'],
      estado: 'DISPONIBLE',
      climatizacion: false,
      television: false,
      wifi: true,
      bano: true,
      minibar: false
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private habitacionService: HabitacionService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.cargarHabitacion();
  }

  cargarHabitacion() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || Number.isNaN(id)) {
      this.error = 'Habitación inválida';
      this.cargando = false;
      return;
    }

    const habitacionEjemplo = this.datosEjemplo.find((item) => item.id === id);
    if (habitacionEjemplo) {
      this.habitacion = habitacionEjemplo;
      this.selectedImage = habitacionEjemplo.imagenes[0] || '';
      this.cargando = false;
      this.error = '';
    } else {
      this.cargando = true;
      this.error = '';
    }

    this.habitacionService.obtenerPorId(id).subscribe({
      next: (habitacion) => {
        this.habitacion = habitacion;
        this.selectedImage = habitacion.imagenes[0] || '';
        this.cargando = false;
      },
      error: () => {
        if (!habitacionEjemplo) {
          this.error = 'No se pudo cargar la habitación. Intenta nuevamente.';
          this.habitacion = null;
        }
        this.cargando = false;
      }
    });
  }

  elegirImagen(imagen: string) {
    this.selectedImage = imagen;
  }

  reservarAhora() {
    if (!this.habitacion) {
      return;
    }
    this.router.navigate(['/reservas'], {
      queryParams: { habitacionId: this.habitacion.id }
    });
  }

  reservarWhatsapp() {
    if (!this.habitacion || !this.isBrowser) {
      return;
    }
    const telefono = '573001234567';
    const mensaje = `Hola, quiero reservar la habitación ${this.habitacion.numero}.`;
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  precioDesde(): string {
    if (!this.habitacion) {
      return '';
    }
    const personas = this.habitacion.capacidad > 0 ? this.habitacion.capacidad : 1;
    const precioPersona = Math.round(this.habitacion.precioNoche / personas);
    return `Desde ${this.formatearPrecio(precioPersona)} por persona`;
  }

  tipoCama(tipo: string): string {
    switch ((tipo || '').toLowerCase()) {
      case 'individual':
        return 'Cama individual';
      case 'doble':
        return 'Cama doble';
      case 'suite':
        return 'Cama king size';
      case 'familiar':
        return 'Cama doble + sofá cama';
      default:
        return 'Cama estándar';
    }
  }

  tipoBano(): string {
    return this.habitacion?.bano ? 'Baño privado' : 'Baño compartido';
  }

  tieneCocinaCompartida(): boolean {
    return this.habitacion?.servicios?.some((servicio) => /cocina/i.test(servicio)) ?? false;
  }

  estadoClase(): string {
    if (!this.habitacion) {
      return 'estado-desconocido';
    }
    switch ((this.habitacion.estado || '').toUpperCase()) {
      case 'DISPONIBLE':
        return 'estado-disponible';
      case 'RESERVADA':
        return 'estado-reservada';
      case 'OCUPADA':
        return 'estado-ocupada';
      default:
        return 'estado-desconocido';
    }
  }
}
