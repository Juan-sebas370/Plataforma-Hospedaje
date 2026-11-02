import { ChangeDetectorRef, Component, OnInit, PLATFORM_ID, Inject, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HabitacionService, Habitacion } from '../../services/habitacion.service';
import { TranslatePipe } from '../../shared/translate.pipe';
import { TranslateService } from '../../services/translate.service';

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
      id: 7,
      numero: '101',
      tipo: 'Doble',
      piso: 1,
      capacidad: 4,
      precioNoche: 120000,
      descripcion: 'Habitación principal del piso 1 con cama doble y camarote. Baño privado, ideal para 4 personas en un ambiente acogedor.',
      servicios: ['WiFi gratis', 'Agua caliente', 'Cocina equipada', 'Lavandería'],
      imagenes: ['assets/habitaciones/piso1/hab101-v2.jpg', 'assets/habitaciones/piso1/hab101-bano.jpg'],
      estado: 'DISPONIBLE',
      climatizacion: false,
      television: false,
      wifi: true,
      bano: true,
      minibar: false
    },
    {
      id: 8,
      numero: '102',
      tipo: 'Doble',
      piso: 1,
      capacidad: 2,
      precioNoche: 100000,
      descripcion: 'Habitación doble con cama matrimonial. Comparte baño con la habitación 103. Cómoda y tranquila.',
      servicios: ['WiFi gratis', 'Agua caliente', 'Cocina equipada'],
      imagenes: ['assets/habitaciones/piso1/hab102-v2.jpg', 'assets/habitaciones/piso1/hab102-103-bano.jpg'],
      estado: 'DISPONIBLE',
      climatizacion: false,
      television: false,
      wifi: true,
      bano: false,
      minibar: false
    },
    {
      id: 9,
      numero: '103',
      tipo: 'Doble',
      piso: 1,
      capacidad: 2,
      precioNoche: 100000,
      descripcion: 'Habitación doble con cama matrimonial. Comparte baño con la habitación 102. Ambiente tranquilo y acogedor.',
      servicios: ['WiFi gratis', 'Agua caliente', 'Cocina equipada', 'Lavandería'],
      imagenes: ['assets/habitaciones/piso1/hab103-v2.jpg', 'assets/habitaciones/piso1/hab102-103-bano.jpg'],
      estado: 'DISPONIBLE',
      climatizacion: false,
      television: false,
      wifi: true,
      bano: false,
      minibar: false
    },
    {
      id: 10,
      numero: '201',
      tipo: 'Individual',
      piso: 2,
      capacidad: 4,
      precioNoche: 80000,
      descripcion: 'Habitación con cama doble y camarote. Baño privado, ideal para 4 personas en un ambiente acogedor y tranquilo.',
      servicios: ['WiFi gratis', 'Agua caliente', 'Cocina equipada', 'Lavandería'],
      imagenes: ['assets/habitaciones/piso2/hab201.jpg', 'assets/habitaciones/piso2/hab201-bano.jpg'],
      estado: 'DISPONIBLE',
      climatizacion: false,
      television: false,
      wifi: true,
      bano: true,
      minibar: false
    },
    {
      id: 11,
      numero: '202',
      tipo: 'Doble',
      piso: 2,
      capacidad: 2,
      precioNoche: 110000,
      descripcion: 'Habitación doble acogedora con cama matrimonial. Comparte baño con la habitación 203. Perfecta para parejas.',
      servicios: ['WiFi gratis', 'Agua caliente', 'Cocina equipada'],
      imagenes: ['assets/habitaciones/piso2/hab202.jpg', 'assets/habitaciones/piso2/hab202-203-bano.jpg'],
      estado: 'DISPONIBLE',
      climatizacion: false,
      television: false,
      wifi: true,
      bano: false,
      minibar: false
    },
    {
      id: 12,
      numero: '203',
      tipo: 'Doble',
      piso: 2,
      capacidad: 2,
      precioNoche: 110000,
      descripcion: 'Habitación doble con cama matrimonial y ambiente tranquilo. Comparte baño con la habitación 202.',
      servicios: ['WiFi gratis', 'Agua caliente', 'Cocina equipada', 'Lavandería'],
      imagenes: ['assets/habitaciones/piso2/hab203-v2.jpg', 'assets/habitaciones/piso2/hab202-203-bano.jpg'],
      estado: 'DISPONIBLE',
      climatizacion: false,
      television: false,
      wifi: true,
      bano: false,
      minibar: false
    },
    {
      id: 13,
      numero: '204',
      tipo: 'Individual',
      piso: 2,
      capacidad: 4,
      precioNoche: 80000,
      descripcion: 'Habitación con cama doble y camarote. Baño privado, ideal para 4 personas en un ambiente acogedor y tranquilo.',
      servicios: ['WiFi gratis', 'Agua caliente', 'Cocina equipada', 'Lavandería'],
      imagenes: ['assets/habitaciones/piso2/hab204-v2.jpg', 'assets/habitaciones/piso2/hab204-bano.jpg'],
      estado: 'DISPONIBLE',
      climatizacion: false,
      television: false,
      wifi: true,
      bano: true,
      minibar: false
    }
  ];

  private readonly i18n = inject(TranslateService);

  constructor(
    private route: ActivatedRoute,
    private habitacionService: HabitacionService,
    private router: Router,
    private cdr: ChangeDetectorRef,
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
      this.error = 'habs.invalida';
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
        // Las habitaciones creadas en SOGO pueden no traer fotos: se usan las del catálogo,
        // buscadas por número porque el id depende de la base de datos.
        const delCatalogo = this.datosEjemplo.find((item) => item.numero === habitacion.numero);
        const imagenes = habitacion.imagenes?.length ? habitacion.imagenes : (delCatalogo?.imagenes ?? []);
        this.habitacion = { ...habitacion, imagenes, servicios: habitacion.servicios ?? delCatalogo?.servicios ?? [] };
        this.selectedImage = imagenes[0] || '';
        this.cargando = false;
        // La app es zoneless: sin esto la vista no se actualiza al llegar la respuesta.
        this.cdr.detectChanges();
      },
      error: () => {
        if (!habitacionEjemplo) {
          this.error = 'habs.errorCarga';
          this.habitacion = null;
        }
        this.cargando = false;
        this.cdr.detectChanges();
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
    const telefono = '573147556717';
    const mensaje = this.i18n.translate('habs.mensajeWhatsapp', { n: this.habitacion.numero });
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  /** "Doble" / "Individual" en el idioma elegido. */
  tipoHab(tipo: string): string {
    const clave = { doble: 'habs.tipoDoble', individual: 'habs.tipoIndividual' }[tipo?.toLowerCase()] ?? 'habs.tipoHab';
    return this.i18n.translate(clave);
  }

  /** Descripción en el idioma elegido (por número de habitación); si no hay traducción, la original. */
  descripcionHab(): string {
    if (!this.habitacion) return '';
    const clave = `cuartos.h${this.habitacion.numero}`;
    const traducida = this.i18n.translate(clave);
    return traducida === clave ? this.habitacion.descripcion : traducida;
  }

  /** Nombre de un servicio de la habitación en el idioma elegido; si no hay traducción, el original. */
  servicioHab(servicio: string): string {
    const clave = `servicioHab.${servicio}`;
    const traducido = this.i18n.translate(clave);
    return traducido === clave ? servicio : traducido;
  }

  precioDesde(): string {
    if (!this.habitacion) {
      return '';
    }
    const personas = this.habitacion.capacidad > 0 ? this.habitacion.capacidad : 1;
    const precioPersona = Math.round(this.habitacion.precioNoche / personas);
    return this.i18n.translate('habs.precioPersona', { precio: this.formatearPrecio(precioPersona) });
  }

  tipoCama(tipo: string): string {
    switch ((tipo || '').toLowerCase()) {
      case 'individual':
        return this.i18n.translate('habs.camaIndividual');
      case 'doble':
        return this.i18n.translate('habs.camaDoble');
      case 'suite':
        return this.i18n.translate('habs.camaKing');
      case 'familiar':
        return this.i18n.translate('habs.camaSofa');
      default:
        return this.i18n.translate('habs.camaEstandar');
    }
  }

  tipoBano(): string {
    return this.i18n.translate(this.habitacion?.bano ? 'habs.banoPrivado' : 'habs.banoCompartido');
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
