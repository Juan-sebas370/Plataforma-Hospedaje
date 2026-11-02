import {
  Component,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
  ChangeDetectorRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/translate.pipe';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusquedaDisponibilidadService } from '../../services/busqueda-disponibilidad.service';
import { AccesibilidadService } from '../../services/accesibilidad.service';
import { SobreProyecto } from '../sobre-proyecto/sobre-proyecto';
import { GuiaTuristica } from '../guia-turistica/guia-turistica';

export interface Piso {
  numero: number;
  nombre: string;
  ver: string;
  descripcion: string;
  capacidadMin: number;
  capacidadMax: number;
  habitaciones: number;
  camasDobles: number;
  camarotes: number;
}

export interface TipoReserva {
  id: string;
  nombre: string;
  descripcion: string;
  precio: string;
  icon: string;
  destacado?: boolean;
}

export interface Testimonio {
  nombre: string;
  ciudad: string;
  texto: string;
  estrellas: number;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, TranslatePipe, CommonModule, FormsModule, SobreProyecto, GuiaTuristica],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {

  // ── Carousel ───────────────────────────────────────────────
  /**
   * Fotos de la portada (carpeta assets/principal): Filandia y el hospedaje.
   * `encuadre` ajusta qué parte de cada foto se ve dentro del marco.
   */
  readonly fotosPortada = [
    { src: '/assets/principal/imagen1.jpg', etiqueta: 'inicio.portada.etFilandia', encuadre: '50% 45%',
      alt: 'inicio.portada.iglesia' },
    { src: '/assets/principal/WhatsApp%20Image%202026-08-18%20at%202.29.34%20PM.jpeg', etiqueta: 'inicio.portada.etSala', encuadre: '50% 60%',
      alt: 'inicio.portada.sala1' },
    { src: '/assets/principal/imagen2.jpg', etiqueta: 'inicio.portada.etCalles', encuadre: '50% 50%',
      alt: 'inicio.portada.calle' },
    { src: '/assets/principal/WhatsApp%20Image%202026-08-18%20at%202.29.33%20PM.jpeg', etiqueta: 'inicio.portada.etSala', encuadre: '50% 55%',
      alt: 'inicio.portada.sala2' },
    { src: '/assets/principal/imagen4.jpg', etiqueta: 'inicio.portada.etFilandia', encuadre: '50% 50%',
      alt: 'inicio.portada.interior' },
  ];
  readonly images = this.fotosPortada.map(f => f.src);
  currentImageIndex = 0;
  private intervalId: any;

  // Carrusel: se puede pausar (WCAG 2.2.2), se detiene con el mouse o el foco
  // encima, y no avanza solo si la persona pidió reducir el movimiento.
  private readonly accesibilidad = inject(AccesibilidadService);
  readonly pausadoPorUsuario = signal(false);
  readonly pausaTemporal = signal(false);
  private readonly reanudadoPorUsuario = signal(false);
  readonly carruselActivo = computed(() =>
    !this.pausadoPorUsuario() && (this.reanudadoPorUsuario() || !this.accesibilidad.movimientoReducido()));

  alternarCarrusel(): void {
    const activo = this.carruselActivo();
    this.pausadoPorUsuario.set(activo);
    this.reanudadoPorUsuario.set(!activo);
  }
  private isBrowser = false;

  // ── Buscador ───────────────────────────────────────────────
  busqueda = {
    fechaEntrada: '',
    fechaSalida: '',
    adultos: 2,
    ninos: 0,
    tipoReserva: 'individual',
  };
  fechaMinima = '';
  errorBusqueda = '';

  // ── Tipos de reserva ───────────────────────────────────────
  tiposReserva: TipoReserva[] = [
    {
      id: 'individual',
      nombre: 'inicio.tipos.individual.nombre',
      descripcion: 'inicio.tipos.individual.desc',
      precio: 'inicio.tipos.individual.precio',
      icon: 'user',
    },
    {
      id: 'familiar',
      nombre: 'inicio.tipos.familiar.nombre',
      descripcion: 'inicio.tipos.familiar.desc',
      precio: 'inicio.tipos.familiar.precio',
      icon: 'users',
      destacado: true,
    },
    {
      id: 'pasadia',
      nombre: 'inicio.tipos.pasadia.nombre',
      descripcion: 'inicio.tipos.pasadia.desc',
      precio: 'inicio.tipos.pasadia.precio',
      icon: 'sun',
    },
    {
      id: 'grupal',
      nombre: 'inicio.tipos.grupal.nombre',
      descripcion: 'inicio.tipos.grupal.desc',
      precio: 'inicio.tipos.grupal.precio',
      icon: 'briefcase',
    },
  ];

  // ── Pisos ──────────────────────────────────────────────────
  pisos: Piso[] = [
    {
      numero: 1,
      nombre: 'inicio.pisos.piso1',
      ver: 'inicio.pisos.verPiso1',
      descripcion: 'inicio.pisos.desc1',
      capacidadMin: 6,
      capacidadMax: 8,
      habitaciones: 3,
      camasDobles: 3,
      camarotes: 1,
    },
    {
      numero: 2,
      nombre: 'inicio.pisos.piso2',
      ver: 'inicio.pisos.verPiso2',
      descripcion: 'inicio.pisos.desc2',
      capacidadMin: 8,
      capacidadMax: 12,
      habitaciones: 4,
      camasDobles: 4,
      camarotes: 2,
    },
  ];

  // ── Galería del hospedaje ──────────────────────────────────
  galeriaFotos = [
    { src: 'assets/habitaciones/piso2/hab201.jpg',   alt: 'inicio.galeria.habitacion', n: '201' },
    { src: 'assets/habitaciones/piso2/hab202.jpg',   alt: 'inicio.galeria.habitacion', n: '202' },
    { src: 'assets/habitaciones/piso2/hab203-v2.jpg',    alt: 'inicio.galeria.habitacion', n: '203' },
    { src: 'assets/habitaciones/piso1/hab101-v2.jpg',    alt: 'inicio.galeria.habitacion', n: '101' },
    { src: 'assets/habitaciones/espacios/mezanine.jpg', alt: 'inicio.galeria.mezanine', n: '' },
    { src: 'assets/habitaciones/piso1/hab102-v2.jpg',    alt: 'inicio.galeria.habitacion', n: '102' },
  ];

  // ── Servicios ──────────────────────────────────────────────
  servicios = [
    { nombre: 'WiFi Gratuito',   icono: 'wifi',    descripcion: 'Conectividad de alta velocidad en todas las áreas' },
    { nombre: 'Agua Caliente',   icono: 'droplet', descripcion: 'Duchas con agua caliente disponibles las 24 horas' },
    { nombre: 'Lavandería',      icono: 'wash',    descripcion: 'Servicio de lavado para que viajes ligero y cómodo' },
    { nombre: 'Cocina Equipada', icono: 'kitchen', descripcion: 'Cocina completa con utensilios para preparar tus alimentos' },
    { nombre: 'Lencería completa', icono: 'bed',   descripcion: 'Sábanas, cobijas, almohadas y toallas incluidas' },
    { nombre: 'inicio.portada.etSala',   icono: 'tv',      descripcion: 'Espacio común para descansar y compartir con televisor' },
  ];

  // ── Testimonios ───────────────────────────────────────────
  testimonios: Testimonio[] = [
    {
      nombre: 'Laura Gómez',
      ciudad: 'Bogotá',
      texto: 'inicio.opiniones.t1',
      estrellas: 5,
    },
    {
      nombre: 'inicio.opiniones.familia',
      ciudad: 'Medellín',
      texto: 'inicio.opiniones.t2',
      estrellas: 5,
    },
    {
      nombre: 'inicio.opiniones.equipo',
      ciudad: 'Cali',
      texto: 'inicio.opiniones.t3',
      estrellas: 5,
    },
  ];

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private busquedaService: BusquedaDisponibilidadService,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.fechaMinima = this.fechaLocal(new Date());
    if (this.isBrowser) {
      this.intervalId = setInterval(() => {
        if (!this.carruselActivo() || this.pausaTemporal()) return;
        this.goToImage((this.currentImageIndex + 1) % this.images.length);
      }, 6000);

      const hoy    = new Date();
      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);
      this.busqueda.fechaEntrada = this.formatDate(hoy);
      this.busqueda.fechaSalida  = this.formatDate(manana);
    }
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  fotoAnterior() {
    this.goToImage((this.currentImageIndex - 1 + this.images.length) % this.images.length);
  }

  fotoSiguiente() {
    this.goToImage((this.currentImageIndex + 1) % this.images.length);
  }

  goToImage(index: number) {
    this.currentImageIndex = index;
    try { this.cdr.detectChanges(); } catch { /* noop */ }
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  private fechaLocal(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getRange(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  buscarDisponibilidad(): void {
    if (!this.validarFechas()) return;

    this.busquedaService.guardar({
      fechaEntrada: this.busqueda.fechaEntrada,
      fechaSalida: this.busqueda.fechaSalida,
      adultos: this.busqueda.adultos,
      ninos3: 0,
      ninos10: this.busqueda.ninos,
      ninos11: 0,
      tipoReserva: this.busqueda.tipoReserva as 'individual' | 'familiar' | 'pasadia' | 'grupal',
    });

    // Directo al proceso de reserva: con fechas y personas ya llenas, el
    // asistente salta a mostrar los espacios disponibles y la recomendación.
    this.router.navigate(['/reservas'], {
      queryParams: {
        fechaEntrada: this.busqueda.fechaEntrada,
        fechaSalida: this.busqueda.fechaSalida,
        adultos: this.busqueda.adultos,
        ninos10: this.busqueda.ninos || undefined,
        tipo: this.busqueda.tipoReserva,
      },
    });
  }

  validarFechas(): boolean {
    this.errorBusqueda = '';

    if (!this.busqueda.fechaEntrada || !this.busqueda.fechaSalida) {
      this.errorBusqueda = 'inicio.buscador.errorFechas';
      return false;
    }

    if (this.busqueda.fechaEntrada < this.fechaMinima) {
      this.errorBusqueda = 'inicio.buscador.errorPasado';
      return false;
    }

    if (this.busqueda.fechaSalida <= this.busqueda.fechaEntrada) {
      this.errorBusqueda = 'inicio.buscador.errorSalida';
      return false;
    }

    return true;
  }
}
