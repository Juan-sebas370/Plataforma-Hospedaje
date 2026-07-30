import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../shared/translate.pipe';

export type Season = 'alta' | 'media' | 'baja';
export type TipoReservaId = 'individual' | 'familiar' | 'pasadia' | 'grupal';

export interface Tarifa {
  opcion: string;
  descripcion: string;
  capacidad: string;
  baja: number;
  media: number;
  alta: number;
}

export interface ReservaActiva {
  id: string;
  numeroReserva: string;
  tipo: string;
  espacio: string;
  fechaEntrada: string;
  fechaSalida: string;
  huespedes: number;
  precioTotal: number;
  temporada: string;
  estado: 'confirmada' | 'pendiente' | 'cancelada' | 'completada';
}

@Component({
  selector: 'app-reservas',
  imports: [RouterLink, CommonModule, FormsModule, TranslatePipe],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css',
})
export class Reservas implements OnInit {

  modoVista: 'nueva' | 'mis-reservas' = 'nueva';
  filtroSeleccionado = 'todas';
  tipoSeleccionado: TipoReservaId = 'individual';
  espacioSeleccionado = '';
  private isBrowser = false;

  // ── Formulario ─────────────────────────────────────────────
  form = {
    nombre: '',
    email: '',
    telefono: '',
    codigoPais: '+57',
    tipoDocumento: '',
    numeroDocumento: '',
    pais: 'CO',
    huespedes: 2,
    fechaEntrada: '',
    fechaSalida: '',
    noches: 1,
    espacio: '',
    tipoReserva: 'individual' as TipoReservaId,
    observaciones: '',
    metodoPago: 'transferencia',
    aceptaTerminos: false,
  };

  // ── Temporada calculada ────────────────────────────────────
  temporada: Season = 'baja';
  nombreTemporada = 'Baja';
  precioCalculado = 0;

  // ── Tipos de reserva ──────────────────────────────────────
  tiposReserva = [
    {
      id: 'individual' as TipoReservaId,
      nombre: 'Reserva Individual',
      descripcion: 'Grupos pequeños o familias. Check-in: 3:00 p.m. – 10:00 p.m.',
      icon: 'user',
    },
    {
      id: 'familiar' as TipoReservaId,
      nombre: 'Reserva Familiar',
      descripcion: 'Casa completa para familias numerosas. Sin restricción de horario (previa coordinación).',
      icon: 'users',
    },
    {
      id: 'pasadia' as TipoReservaId,
      nombre: 'Pasadía',
      descripcion: 'Disfruta el espacio sin hospedarte. Reuniones, cumpleaños o integraciones. Solo temporada alta o con autorización.',
      icon: 'sun',
    },
    {
      id: 'grupal' as TipoReservaId,
      nombre: 'Grupo de Trabajo',
      descripcion: 'Conferencias, talleres y reuniones empresariales con equipo de proyección y tablero.',
      icon: 'briefcase',
    },
  ];

  // ── Espacios disponibles ──────────────────────────────────
  espacios = [
    { id: 'piso1',    nombre: 'Piso 1',              capacidadMax: 8,  descripcion: '3 hab. · 3 camas dobles · 1 camarote' },
    { id: 'piso2',    nombre: 'Piso 2',              capacidadMax: 12, descripcion: '4 hab. · 4 camas dobles · 2 camarotes' },
    { id: 'completo', nombre: 'Casa completa',        capacidadMax: 20, descripcion: '7 hab. · 7 camas dobles · 3 camarotes' },
  ];

  // ── Tarifas (COP) ─────────────────────────────────────────
  tarifas: Tarifa[] = [
    { opcion: 'piso1',    descripcion: 'Piso 1',              capacidad: 'hasta 8 personas',   baja: 550000,  media: 700000,  alta: 950000  },
    { opcion: 'piso2',    descripcion: 'Piso 2',              capacidad: 'hasta 12 personas',  baja: 750000,  media: 900000,  alta: 1200000 },
    { opcion: 'completo', descripcion: 'Casa completa',       capacidad: 'hasta 20 personas',  baja: 1200000, media: 1500000, alta: 1900000 },
    { opcion: 'pasadia',  descripcion: 'Pasadía',             capacidad: 'por grupo',          baja: 350000,  media: 450000,  alta: 600000  },
    { opcion: 'grupal',   descripcion: 'Grupo de trabajo',    capacidad: 'por jornada',        baja: 600000,  media: 750000,  alta: 900000  },
  ];

  // ── Reservas existentes (mock) ────────────────────────────
  misReservas: ReservaActiva[] = [
    {
      id: '1', numeroReserva: 'HS-2026-001', tipo: 'Familiar',
      espacio: 'Casa completa', fechaEntrada: '2026-06-20', fechaSalida: '2026-06-23',
      huespedes: 16, precioTotal: 5700000, temporada: 'Media', estado: 'confirmada',
    },
    {
      id: '2', numeroReserva: 'HS-2026-002', tipo: 'Individual',
      espacio: 'Piso 1', fechaEntrada: '2026-08-05', fechaSalida: '2026-08-07',
      huespedes: 6, precioTotal: 1100000, temporada: 'Baja', estado: 'pendiente',
    },
    {
      id: '3', numeroReserva: 'HS-2025-045', tipo: 'Pasadía',
      espacio: 'Zonas comunes', fechaEntrada: '2025-12-28', fechaSalida: '2025-12-28',
      huespedes: 20, precioTotal: 600000, temporada: 'Alta', estado: 'completada',
    },
  ];

  constructor(
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // Leer queryParams del buscador del home
    this.route.queryParams.subscribe(params => {
      if (params['tipo']) this.form.tipoReserva = params['tipo'] as TipoReservaId;
      if (params['fechaEntrada']) this.form.fechaEntrada = params['fechaEntrada'];
      if (params['fechaSalida'])  this.form.fechaSalida  = params['fechaSalida'];
      if (params['huespedes'])    this.form.huespedes    = +params['huespedes'];
      this.tipoSeleccionado = this.form.tipoReserva;
    });

    if (this.isBrowser && !this.form.fechaEntrada) {
      const hoy    = new Date();
      const manana = new Date(hoy); manana.setDate(hoy.getDate() + 1);
      this.form.fechaEntrada = this.toDateStr(hoy);
      this.form.fechaSalida  = this.toDateStr(manana);
    }

    this.recalcular();
  }

  // ── Temporada ─────────────────────────────────────────────
  calcularTemporada(d: Date): Season {
    if (this.esTemporadaAlta(d)) return 'alta';
    const dow = d.getDay();
    if (dow === 0 || dow === 6 || this.esFestivo(d)) return 'media';
    return 'baja';
  }

  private esTemporadaAlta(d: Date): boolean {
    const m = d.getMonth() + 1, dia = d.getDate();
    if ((m === 12 && dia >= 15) || (m === 1 && dia <= 15)) return true;
    if ((m === 6  && dia >= 15) || (m === 7 && dia <= 15)) return true;
    return this.esSemanaSanta(d);
  }

  private esSemanaSanta(d: Date): boolean {
    const pascua = this.calcularPascua(d.getFullYear());
    const inicio = new Date(pascua); inicio.setDate(pascua.getDate() - 8);
    return d >= inicio && d <= pascua;
  }

  calcularPascua(y: number): Date {
    const a=y%19,b=Math.floor(y/100),c=y%100,d2=Math.floor(b/4),e=b%4,
          f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),
          h=(19*a+b-d2-g+15)%30,i=Math.floor(c/4),k=c%4,
          l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),
          month=Math.floor((h+l-7*m+114)/31),
          day=((h+l-7*m+114)%31)+1;
    return new Date(y, month-1, day);
  }

  private esFestivo(d: Date): boolean {
    const m = d.getMonth()+1, dia = d.getDate();
    return [[1,1],[5,1],[7,20],[8,7],[12,8],[12,25]].some(([mm,dd]) => mm===m && dd===dia);
  }

  getNombreTemporada(t: Season): string {
    return { alta: 'Alta', media: 'Media', baja: 'Baja' }[t];
  }

  // ── Precio calculado ──────────────────────────────────────
  recalcular(): void {
    if (!this.form.fechaEntrada) return;
    const fecha = new Date(this.form.fechaEntrada + 'T12:00:00');
    this.temporada = this.calcularTemporada(fecha);
    this.nombreTemporada = this.getNombreTemporada(this.temporada);

    const keyEspacio = this.form.tipoReserva === 'pasadia' ? 'pasadia'
                     : this.form.tipoReserva === 'grupal'  ? 'grupal'
                     : (this.form.espacio || 'piso1');

    const tarifa = this.tarifas.find(t => t.opcion === keyEspacio);
    const baseNoche = tarifa ? tarifa[this.temporada] : 0;
    this.precioCalculado = baseNoche * Math.max(this.form.noches, 1);
  }

  calcularNoches(): void {
    if (this.form.fechaEntrada && this.form.fechaSalida) {
      const entrada = new Date(this.form.fechaEntrada);
      const salida  = new Date(this.form.fechaSalida);
      const diff = Math.round((salida.getTime() - entrada.getTime()) / 86400000);
      this.form.noches = diff > 0 ? diff : 1;
      this.recalcular();
    }
  }

  getTarifaEspacio(espacioId: string): number {
    const t = this.tarifas.find(x => x.opcion === espacioId);
    return t ? t[this.temporada] : 0;
  }

  formatCOP(v: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);
  }

  // ── Helpers UI ────────────────────────────────────────────
  seleccionarTipo(id: TipoReservaId): void {
    this.tipoSeleccionado = id;
    this.form.tipoReserva = id;
    this.form.espacio = '';
    this.recalcular();
  }

  espaciosFiltrados() {
    if (this.form.tipoReserva === 'familiar') return this.espacios;
    if (this.form.tipoReserva === 'individual') return this.espacios.filter(e => e.id !== 'completo');
    return [];
  }

  mostrarSelectorEspacio(): boolean {
    return this.form.tipoReserva === 'individual' || this.form.tipoReserva === 'familiar';
  }

  esPasadiaOGrupal(): boolean {
    return this.form.tipoReserva === 'pasadia' || this.form.tipoReserva === 'grupal';
  }

  // ── Mis reservas ──────────────────────────────────────────
  cambiarVista(modo: 'nueva' | 'mis-reservas'): void { this.modoVista = modo; }
  aplicarFiltro(f: string): void { this.filtroSeleccionado = f; }
  obtenerReservasFiltradas(): ReservaActiva[] {
    return this.filtroSeleccionado === 'todas'
      ? this.misReservas
      : this.misReservas.filter(r => r.estado === this.filtroSeleccionado);
  }
  contarPorEstado(e: string): number { return this.misReservas.filter(r => r.estado === e).length; }
  obtenerClaseEstado(e: string): string { return `estado-${e.toLowerCase()}`; }
  cancelarReserva(id: string): void {
    const r = this.misReservas.find(x => x.id === id);
    if (r) r.estado = 'cancelada';
  }

  confirmarReserva(): void {
    // Navegar a confirmación — aquí iría llamada al service
  }

  getNombreTipo(id: TipoReservaId): string {
    return this.tiposReserva.find(t => t.id === id)?.nombre ?? '';
  }

  getNombreEspacio(id: string): string {
    return this.espacios.find(e => e.id === id)?.nombre ?? '';
  }

  private toDateStr(d: Date): string { return d.toISOString().split('T')[0]; }
}
