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
  // ── Carousel ──────────────────────────────────────────────────
  images = [
    '/assets/principal/imagen1.jpg',
    '/assets/principal/imagen2.jpg',
    '/assets/principal/imagen3.jpg',
    '/assets/principal/imagen4.jpg',
  ];
  currentImageIndex = 0;
  private intervalId: any;
  private isBrowser = false;

  // ── Buscador ─────────────────────────────────────────────────
  busqueda = {
    fechaEntrada: '',
    fechaSalida: '',
    huespedes: 2,
    ninos: 0,
    tipoReserva: 'individual',
  };


  // ── Tipos de Reserva ─────────────────────────────────────────
  tiposReserva: TipoReserva[] = [
    {
      id: 'individual',
      nombre: 'Reserva Individual',
      descripcion:
        'Ideal para grupos pequeños o familias. Alquila el piso que necesites con horario de ingreso entre 3:00 p.m. y 10:00 p.m.',
      icon: 'user',
    },
    {
      id: 'familiar',
      nombre: 'Reserva Familiar',
      descripcion:
        'Para familias numerosas que desean la casa completa. Sin restricción de horario, previa coordinación. Puede incluir uno o ambos pisos.',
      icon: 'users',
      destacado: true,
    },
    {
      id: 'pasadia',
      nombre: 'Pasadía',
      descripcion:
        'Disfruta las instalaciones sin hospedarte. Ideal para reuniones, cumpleaños e integraciones. Incluye baño social, salón de juegos y zonas comunes.',
      icon: 'sun',
    },
    {
      id: 'grupal',
      nombre: 'Grupos de Trabajo',
      descripcion:
        'Para empresas, colegios o grupos de capacitación. Congresos, talleres y reuniones con equipo de proyección, tablero y espacios habilitados.',
      icon: 'briefcase',
    },
  ];

  // ── Pisos ────────────────────────────────────────────────────
  pisos: Piso[] = [
    {
      nombre: 'Piso 1',
      descripcion: 'Acogedor y perfecto para grupos pequeños. Cuenta con tres habitaciones distribuidas en un espacio cálido y confortable.',
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

  // ── Servicios (solo los 4 reales) ────────────────────────────
  servicios = [
    { nombre: 'WiFi Gratuito',     icon: 'wifi' },
    { nombre: 'Agua Caliente',     icon: 'droplet' },
    { nombre: 'Lavandería',        icon: 'washing' },
    { nombre: 'Cocina Equipada',   icon: 'kitchen' },
  ];

  // ── Testimonios ──────────────────────────────────────────────
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

  constructor(@Inject(PLATFORM_ID) platformId: Object, private cdr: ChangeDetectorRef) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.intervalId = setInterval(() => {
        const next = (this.currentImageIndex + 1) % this.images.length;
        // debug
        console.debug('[Home] changing image', this.currentImageIndex, '->', next);
        this.goToImage(next);
      }, 3000);

      // Fechas por defecto: hoy y mañana
      const hoy = new Date();
      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);
      this.busqueda.fechaEntrada = this.formatDate(hoy);
      this.busqueda.fechaSalida  = this.formatDate(manana);
    }
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  // ── Carousel ─────────────────────────────────────────────────
  goToImage(index: number) {
    this.currentImageIndex = index;
    // Force change detection in case the app runs without Zone.js
    try { this.cdr.detectChanges(); } catch (e) { /* noop */ }
  }

  // ── Helpers ──────────────────────────────────────────────────
  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  getRange(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  onBuscar() {
    // Navegación al módulo de reservas — implementada en el router
  }
}
