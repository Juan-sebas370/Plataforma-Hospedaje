import {
  Component,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
  ChangeDetectorRef,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/translate.pipe';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Piso {
  nombre: string;
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
  imports: [RouterLink, TranslatePipe, CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {

  // ── Carousel ───────────────────────────────────────────────
  images = [
    '/assets/principal/imagen1.jpg',
    '/assets/principal/imagen2.jpg',
    '/assets/principal/imagen3.jpg',
    '/assets/principal/imagen4.jpg',
  ];
  currentImageIndex = 0;
  private intervalId: any;
  private isBrowser = false;

  // ── Buscador ───────────────────────────────────────────────
  busqueda = {
    fechaEntrada: '',
    fechaSalida: '',
    huespedes: 2,
    ninos: 0,
    tipoReserva: 'individual',
  };
  mostrarInfoNinos = false;

  // ── Tipos de reserva ───────────────────────────────────────
  tiposReserva: TipoReserva[] = [
    {
      id: 'individual',
      nombre: 'Individual',
      descripcion: 'Para grupos pequeños o familias. Alquila el piso que necesites con horario de ingreso entre 3:00 p.m. y 10:00 p.m.',
      precio: 'Desde $65.000 por persona',
      icon: 'user',
    },
    {
      id: 'familiar',
      nombre: 'Grupo Familiar',
      descripcion: 'Para familias que desean la casa completa o un piso entero. Ideal para disfrutar juntos sin restricciones.',
      precio: 'Desde $51.000 por persona',
      icon: 'users',
      destacado: true,
    },
    {
      id: 'pasadia',
      nombre: 'Pasadía',
      descripcion: 'Disfruta las instalaciones sin hospedarte. Ideal para cumpleaños, reuniones e integraciones familiares.',
      precio: '10 a 15 personas',
      icon: 'sun',
    },
    {
      id: 'grupal',
      nombre: 'Reuniones de Grupo',
      descripcion: 'Para empresas, colegios o equipos de trabajo. Espacios habilitados para conferencias y talleres.',
      precio: 'Ideal para equipos',
      icon: 'briefcase',
    },
  ];

  // ── Pisos ──────────────────────────────────────────────────
  pisos: Piso[] = [
    {
      nombre: 'Piso 1',
      descripcion: 'Acogedor y perfecto para grupos pequeños. Tres habitaciones distribuidas en un espacio cálido y confortable.',
      capacidadMin: 6,
      capacidadMax: 8,
      habitaciones: 3,
      camasDobles: 3,
      camarotes: 1,
    },
    {
      nombre: 'Piso 2',
      descripcion: 'Amplio y equipado para grupos medianos. Cuatro habitaciones con vistas al paisaje cafetero de Filandia.',
      capacidadMin: 8,
      capacidadMax: 12,
      habitaciones: 4,
      camasDobles: 4,
      camarotes: 2,
    },
  ];

  // ── Galería del hospedaje ──────────────────────────────────
  galeriaFotos = [
    { src: 'assets/habitaciones/piso2/hab201.jpeg',   alt: 'Habitación 201' },
    { src: 'assets/habitaciones/piso2/hab202.jpeg',   alt: 'Habitación 202' },
    { src: 'assets/habitaciones/piso2/hab201-2.jpeg', alt: 'Habitación piso 2' },
    { src: 'assets/habitaciones/piso1/hab101.jpg',    alt: 'Habitación 101' },
    { src: 'assets/habitaciones/espacios/mezanine.png', alt: 'Mezanine' },
    { src: 'assets/habitaciones/piso1/hab102.jpg',    alt: 'Habitación 102' },
  ];

  // ── Servicios ──────────────────────────────────────────────
  servicios = [
    { nombre: 'WiFi Gratuito',   icono: 'wifi',    descripcion: 'Conectividad de alta velocidad en todas las áreas' },
    { nombre: 'Agua Caliente',   icono: 'droplet', descripcion: 'Duchas con agua caliente disponibles las 24 horas' },
    { nombre: 'Lavandería',      icono: 'wash',    descripcion: 'Servicio de lavado para que viajes ligero y cómodo' },
    { nombre: 'Cocina Equipada', icono: 'kitchen', descripcion: 'Cocina completa con utensilios para preparar tus alimentos' },
    { nombre: 'Lencería completa', icono: 'bed',   descripcion: 'Sábanas, cobijas, almohadas y toallas incluidas' },
    { nombre: 'Sala de estar',   icono: 'tv',      descripcion: 'Espacio común para descansar y compartir con televisor' },
  ];

  // ── Testimonios ───────────────────────────────────────────
  testimonios: Testimonio[] = [
    {
      nombre: 'Laura Gómez',
      ciudad: 'Bogotá',
      texto: 'Un lugar mágico en el corazón del Quindío. Las vistas son increíbles y el trato fue excelente. Definitivamente regresamos.',
      estrellas: 5,
    },
    {
      nombre: 'Carlos y Familia',
      ciudad: 'Medellín',
      texto: 'Celebramos el cumpleaños de mi mamá aquí y fue perfecto. La casa tiene todo lo necesario y el ambiente es muy tranquilo.',
      estrellas: 5,
    },
    {
      nombre: 'Equipo Innova S.A.S.',
      ciudad: 'Cali',
      texto: 'Realizamos nuestra reunión anual de estrategia aquí. El espacio es ideal, silencioso y con todo lo necesario para trabajar.',
      estrellas: 5,
    },
  ];

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private cdr: ChangeDetectorRef,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.intervalId = setInterval(() => {
        this.goToImage((this.currentImageIndex + 1) % this.images.length);
      }, 4000);

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

  goToImage(index: number) {
    this.currentImageIndex = index;
    try { this.cdr.detectChanges(); } catch { /* noop */ }
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  getRange(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }
}
