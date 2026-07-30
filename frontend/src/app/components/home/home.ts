import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/translate.pipe';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type Season = 'alta' | 'media' | 'baja';

export interface TarifaRow {
  tipo: string;
  baja: number;
  media: number;
  alta: number;
}

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
  @ViewChild('heroImg') heroImg!: ElementRef<HTMLImageElement>;

  // ── Carousel ──────────────────────────────────────────────────
  images = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80',
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1600&q=80',
    'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1600&q=80',
    'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1600&q=80',
  ];
  currentImageIndex = 0;
  private intervalId: any;
  private isBrowser = false;

  // ── Buscador ─────────────────────────────────────────────────
  busqueda = {
    fechaEntrada: '',
    fechaSalida: '',
    huespedes: 2,
    tipoReserva: 'individual',
  };

  // ── Temporada activa (para mostrar tarifas) ──────────────────
  temporadaActiva: Season = 'baja';
  nombreTemporada = 'Baja';

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

  // ── Tarifas ──────────────────────────────────────────────────
  tarifas: TarifaRow[] = [
    { tipo: 'Piso 1 (hasta 8 personas)',       baja: 550000,  media: 700000,  alta: 950000  },
    { tipo: 'Piso 2 (hasta 12 personas)',      baja: 750000,  media: 900000,  alta: 1200000 },
    { tipo: 'Casa completa (hasta 20 pers.)',  baja: 1200000, media: 1500000, alta: 1900000 },
    { tipo: 'Pasadía (por grupo)',             baja: 350000,  media: 450000,  alta: 600000  },
    { tipo: 'Grupo de trabajo / conferencia',  baja: 600000,  media: 750000,  alta: 900000  },
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

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.temporadaActiva = this.calcularTemporada(new Date());
    this.nombreTemporada = this.getNombreTemporada(this.temporadaActiva);

    if (this.isBrowser) {
      this.intervalId = setInterval(() => {
        this.goToImage((this.currentImageIndex + 1) % this.images.length);
      }, 6000);

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
    if (!this.isBrowser) { this.currentImageIndex = index; return; }
    if (this.heroImg?.nativeElement) {
      const el = this.heroImg.nativeElement;
      el.style.opacity = '0';
      setTimeout(() => { this.currentImageIndex = index; el.style.opacity = '1'; }, 400);
    } else {
      this.currentImageIndex = index;
    }
  }

  // ── Temporadas ───────────────────────────────────────────────
  calcularTemporada(fecha: Date): Season {
    const mes   = fecha.getMonth() + 1; // 1-12
    const dia   = fecha.getDate();
    const dow   = fecha.getDay();        // 0=Dom

    // Temporada Alta
    if (this.esTemporadaAlta(fecha)) return 'alta';

    // Temporada Media: sábados (6), domingos (0), festivos
    if (dow === 0 || dow === 6 || this.esFestivoColombia(fecha)) return 'media';

    return 'baja';
  }

  private esTemporadaAlta(fecha: Date): boolean {
    const mes = fecha.getMonth() + 1;
    const dia = fecha.getDate();

    // 15 dic – 15 ene
    if ((mes === 12 && dia >= 15) || (mes === 1 && dia <= 15)) return true;
    // 15 jun – 15 jul
    if ((mes === 6 && dia >= 15) || (mes === 7 && dia <= 15)) return true;
    // Semana Santa (aprox: domingo de ramos + 8 días antes hasta pascua)
    // Se usa cálculo de Pascua de Gauss simplificado
    if (this.esSemanaSanta(fecha)) return true;

    return false;
  }

  private esSemanaSanta(fecha: Date): boolean {
    const y = fecha.getFullYear();
    const pascua = this.calcularPascua(y);
    const viernes = new Date(pascua); viernes.setDate(pascua.getDate() - 8);
    return fecha >= viernes && fecha <= pascua;
  }

  calcularPascua(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day   = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  private esFestivoColombia(fecha: Date): boolean {
    const mes = fecha.getMonth() + 1;
    const dia = fecha.getDate();
    // Festivos fijos Colombia
    const fijos: [number, number][] = [
      [1, 1], [5, 1], [7, 20], [8, 7], [12, 8], [12, 25],
    ];
    return fijos.some(([m, d]) => m === mes && d === dia);
  }

  getNombreTemporada(t: Season): string {
    return { alta: 'Alta', media: 'Media', baja: 'Baja' }[t];
  }

  getTarifaActual(tarifa: TarifaRow): number {
    return tarifa[this.temporadaActiva];
  }

  formatCOP(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0,
    }).format(valor);
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
