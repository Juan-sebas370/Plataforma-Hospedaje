import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type Season        = 'alta' | 'media' | 'baja';
export type TipoReservaId = 'individual' | 'familiar' | 'pasadia' | 'grupal';
export type ModoEspacio   = 'habitaciones' | 'piso' | 'casa';
export type EtapaId       = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Tarifa {
  opcion: string;
  descripcion: string;
  capacidad: string;
  baja: number;
  media: number;
  alta: number;
}


@Component({
  selector: 'app-reservas',
  imports: [CommonModule, FormsModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css',
})
export class Reservas implements OnInit {

  // ── Vista principal ───────────────────────────────────────
  private isBrowser = false;

  // ── Wizard ───────────────────────────────────────────────
  etapaActual: EtapaId = 1;

  // Etapas dinámicas: pasadía/grupal saltan etapa 4 (espacio)
  get etapas() {
    return [
      { id: 1 as EtapaId, label: 'Tipo',      short: 'Tipo'     },
      { id: 2 as EtapaId, label: 'Fechas',     short: 'Fechas'   },
      { id: 3 as EtapaId, label: 'Personas',   short: 'Personas' },
      { id: 4 as EtapaId, label: 'Espacio',    short: 'Espacio',
        skip: this.esPasadiaOGrupal() },
      { id: 5 as EtapaId, label: 'Resumen',    short: 'Resumen'  },
      { id: 6 as EtapaId, label: 'Tus datos',  short: 'Datos'    },
      { id: 7 as EtapaId, label: 'Pago',       short: 'Pago'     },
    ];
  }

  get etapasVisibles() {
    return this.etapas.filter(e => !e.skip);
  }

  get posicionVisible(): number {
    return this.etapasVisibles.findIndex(e => e.id === this.etapaActual) + 1;
  }

  get totalVisible(): number {
    return this.etapasVisibles.length;
  }

  // ── Paso 1: tipo de reserva ───────────────────────────────
  config = {
    tipoReserva:  'individual' as TipoReservaId,
    modoEspacio:  'habitaciones' as ModoEspacio,
    espacio:      'piso1',
    adultos:      1,
    ninos3:       0,
    ninos10:      0,
    ninos11:      0,
    fechaEntrada: '',
    fechaSalida:  '',
    noches:       1,
  };

  get totalPersonas(): number {
    return this.config.adultos + this.config.ninos3 + this.config.ninos10 + this.config.ninos11;
  }

  // ── Paso 4: espacio ───────────────────────────────────────
  habitacionesSeleccionadas: number[] = [];

  toggleHabitacion(id: number): void {
    const idx = this.habitacionesSeleccionadas.indexOf(id);
    if (idx === -1) this.habitacionesSeleccionadas.push(id);
    else            this.habitacionesSeleccionadas.splice(idx, 1);
    this.sincronizarEspacioDesdeHabitaciones();
    this.recalcular();
  }

  estaSeleccionada(id: number): boolean {
    return this.habitacionesSeleccionadas.includes(id);
  }

  getHabitacionesPiso(piso: number) {
    return this.habitaciones.filter(h => h.piso === piso);
  }

  getNombresHabitaciones(): string {
    return this.habitacionesSeleccionadas
      .map(id => this.habitaciones.find(h => h.id === id)?.numero)
      .filter(Boolean).map(n => 'Hab. ' + n).join(' · ');
  }

  private sincronizarEspacioDesdeHabitaciones(): void {
    const pisos = new Set(
      this.habitaciones
        .filter(h => this.habitacionesSeleccionadas.includes(h.id))
        .map(h => h.piso)
    );
    if (pisos.size === 2)      this.config.espacio = 'completo';
    else if (pisos.has(2))     this.config.espacio = 'piso2';
    else                        this.config.espacio = 'piso1';
  }

  seleccionarPiso(pisoId: string): void {
    this.config.espacio = pisoId;
    // Marcar automáticamente todas las habitaciones del piso
    if (pisoId === 'completo') {
      this.habitacionesSeleccionadas = this.habitaciones.map(h => h.id);
    } else {
      const num = pisoId === 'piso1' ? 1 : 2;
      this.habitacionesSeleccionadas = this.habitaciones
        .filter(h => h.piso === num).map(h => h.id);
    }
    this.recalcular();
  }

  // Opciones de espacio filtradas según capacidad requerida
  getOpcionesEspacio() {
    const cap = this.totalPersonas;
    return this.espacios.filter(e => e.capacidadMax >= cap);
  }

  // ── Paso 6: datos personales ──────────────────────────────
  datos = {
    nombre:          '',
    apellido:        '',
    email:           '',
    codigoPais:      '+57',
    telefono:        '',
    tipoDocumento:   '',
    numeroDocumento: '',
    pais:            'CO',
    observaciones:   '',
  };

  // ── Paso 7: pago ──────────────────────────────────────────
  pago = {
    metodo:         'transferencia',
    aceptaTerminos: false,
  };

  // ── Precio / temporada ────────────────────────────────────
  temporada: Season = 'baja';
  nombreTemporada   = 'Baja';
  precioNoche       = 0;
  precioTotal       = 0;

  // ── Catálogos ─────────────────────────────────────────────
  readonly tiposReserva = [
    {
      id: 'individual' as TipoReservaId,
      nombre: 'Reserva individual',
      descripcion: 'Para una persona, pareja o grupo pequeño que desea hospedarse en habitaciones.',
      icon: 'user',
      checkin: 'Check-in 3:00 p.m. – 10:00 p.m.',
    },
    {
      id: 'familiar' as TipoReservaId,
      nombre: 'Reserva familiar',
      descripcion: 'Para familias o grupos que necesitan varias habitaciones o uno o ambos pisos completos.',
      icon: 'users',
      checkin: 'Check-in 3:00 p.m. – 10:00 p.m.',
    },
    {
      id: 'pasadia' as TipoReservaId,
      nombre: 'Pasadía',
      descripcion: 'Para reuniones, cumpleaños y actividades durante el día, sin hospedaje nocturno.',
      icon: 'sun',
      checkin: '10:00 a.m. – 8:00 p.m.',
    },
    {
      id: 'grupal' as TipoReservaId,
      nombre: 'Grupo de trabajo',
      descripcion: 'Para conferencias, reuniones o grupos empresariales. Proyector, tablero y espacios habilitados.',
      icon: 'briefcase',
      checkin: '8:00 a.m. – 6:00 p.m.',
    },
  ];

  readonly modoEspacioOpciones = [
    {
      id: 'habitaciones' as ModoEspacio,
      nombre: 'Habitaciones',
      descripcion: 'Selecciona exactamente las habitaciones que necesitas.',
      icon: 'bed',
    },
    {
      id: 'piso' as ModoEspacio,
      nombre: 'Piso completo',
      descripcion: 'Reserva todas las habitaciones de un piso.',
      icon: 'floor',
    },
    {
      id: 'casa' as ModoEspacio,
      nombre: 'Toda la casa',
      descripcion: 'Reserva los dos pisos completos. Máxima privacidad.',
      icon: 'home',
    },
  ];

  readonly espacios = [
    {
      id: 'piso1',
      nombre: 'Piso 1',
      descripcion: '3 habitaciones · 3 camas dobles · 1 camarote',
      capacidad: '6 a 8 personas',
      capacidadMax: 8,
      detalle: '3 habitaciones · Capacidad: 8 personas · 3 camas dobles + 1 camarote',
    },
    {
      id: 'piso2',
      nombre: 'Piso 2',
      descripcion: '4 habitaciones · 2 camas dobles · 2 camarotes',
      capacidad: '8 a 12 personas',
      capacidadMax: 12,
      detalle: '4 habitaciones · Capacidad: 12 personas · 2 camas dobles + 2 camarotes',
    },
    {
      id: 'completo',
      nombre: 'Casa completa',
      descripcion: '7 habitaciones · 5 camas dobles · 3 camarotes',
      capacidad: 'Hasta 20 personas',
      capacidadMax: 20,
      detalle: '7 habitaciones · Capacidad: 20 personas · Mayor privacidad y exclusividad',
    },
  ];

  readonly habitaciones = [
    { id: 1, numero: '101', piso: 1, nombre: 'Habitación 101',
      descripcion: 'Cama doble y camarote. Baño privado. Ideal para 4 personas.',
      capacidad: 4, camas: '1 cama doble · 1 camarote', bano: 'Baño privado',
      precio: 120000, imagen: 'assets/habitaciones/piso1/hab101.jpg' },
    { id: 2, numero: '102', piso: 1, nombre: 'Habitación 102',
      descripcion: 'Cama doble matrimonial. Comparte baño con la hab. 103.',
      capacidad: 2, camas: '1 cama doble', bano: 'Baño compartido (103)',
      precio: 100000, imagen: 'assets/habitaciones/piso1/hab102.jpg' },
    { id: 3, numero: '103', piso: 1, nombre: 'Habitación 103',
      descripcion: 'Cama doble matrimonial. Comparte baño con la hab. 102.',
      capacidad: 2, camas: '1 cama doble', bano: 'Baño compartido (102)',
      precio: 100000, imagen: 'assets/habitaciones/piso1/hab103.jpg' },
    { id: 4, numero: '201', piso: 2, nombre: 'Habitación 201',
      descripcion: 'Cama doble y camarote. Baño privado. Capacidad para 4 personas.',
      capacidad: 4, camas: '1 cama doble · 1 camarote', bano: 'Baño privado',
      precio: 80000, imagen: 'assets/habitaciones/piso2/hab201.jpeg' },
    { id: 5, numero: '202', piso: 2, nombre: 'Habitación 202',
      descripcion: 'Cama doble matrimonial. Comparte baño con la hab. 203.',
      capacidad: 2, camas: '1 cama doble', bano: 'Baño compartido (203)',
      precio: 110000, imagen: 'assets/habitaciones/piso2/hab202.jpeg' },
    { id: 6, numero: '203', piso: 2, nombre: 'Habitación 203',
      descripcion: 'Cama doble matrimonial. Comparte baño con la hab. 202.',
      capacidad: 2, camas: '1 cama doble', bano: 'Baño compartido (202)',
      precio: 110000, imagen: 'assets/habitaciones/piso2/hab203.jpg' },
    { id: 7, numero: '204', piso: 2, nombre: 'Habitación 204',
      descripcion: 'Cama doble y camarote. Baño privado. Ideal para 4 personas.',
      capacidad: 4, camas: '1 cama doble · 1 camarote', bano: 'Baño privado',
      precio: 80000, imagen: 'assets/habitaciones/piso2/hab204.jpg' },
  ];

  readonly tarifas: Tarifa[] = [
    { opcion: 'piso1',    descripcion: 'Piso 1',           capacidad: 'hasta 8 personas',  baja: 550000,  media: 700000,  alta: 950000  },
    { opcion: 'piso2',    descripcion: 'Piso 2',           capacidad: 'hasta 10 personas', baja: 550000,  media: 700000,  alta: 950000  },
    { opcion: 'completo', descripcion: 'Casa completa',    capacidad: 'hasta 20 personas', baja: 1200000, media: 1500000, alta: 1900000 },
    { opcion: 'pasadia',  descripcion: 'Pasadía',          capacidad: 'por grupo',         baja: 350000,  media: 450000,  alta: 600000  },
    { opcion: 'grupal',   descripcion: 'Grupo de trabajo', capacidad: 'por jornada',       baja: 600000,  media: 750000,  alta: 900000  },
  ];

  misReservas: never[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tipo'])         this.config.tipoReserva  = params['tipo'] as TipoReservaId;
      if (params['espacio'])      this.config.espacio      = params['espacio'];
      if (params['fechaEntrada']) this.config.fechaEntrada = params['fechaEntrada'];
      if (params['fechaSalida'])  this.config.fechaSalida  = params['fechaSalida'];
      if (params['adultos'])      this.config.adultos      = +params['adultos'];
      if (params['ninos10'])      this.config.ninos10      = +params['ninos10'];
      if (params['ninos3'])       this.config.ninos3       = +params['ninos3'];
    });
    this.recalcular();
    this.generarCalendario();
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

  // ── Precio ────────────────────────────────────────────────
  recalcular(): void {
    if (!this.config.fechaEntrada) { this.precioNoche = 0; this.precioTotal = 0; return; }
    const fecha = new Date(this.config.fechaEntrada + 'T12:00:00');
    this.temporada       = this.calcularTemporada(fecha);
    this.nombreTemporada = this.getNombreTemporada(this.temporada);

    const key = this.esPasadiaOGrupal() ? this.config.tipoReserva : this.config.espacio;
    const tarifa = this.tarifas.find(t => t.opcion === key);
    this.precioNoche = tarifa ? tarifa[this.temporada] : 0;
    this.precioTotal = this.precioNoche * Math.max(this.config.noches, 1);
  }

  calcularNoches(): void {
    if (this.config.fechaEntrada && this.config.fechaSalida) {
      const entrada = new Date(this.config.fechaEntrada);
      const salida  = new Date(this.config.fechaSalida);
      const diff = Math.round((salida.getTime() - entrada.getTime()) / 86400000);
      this.config.noches = diff > 0 ? diff : 1;
      this.recalcular();
    }
  }

  formatCOP(v: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0,
    }).format(v);
  }

  formatFechaCorta(str: string): string {
    if (!str) return '–';
    const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
    const d = new Date(str + 'T12:00:00');
    return `${d.getDate()} ${meses[d.getMonth()]}`;
  }

  // ── Navegación wizard ─────────────────────────────────────
  avanzar(): void {
    if (!this.puedeAvanzar()) return;
    this.recalcular();
    let siguiente = (this.etapaActual + 1) as EtapaId;
    // Saltar etapa 4 si es pasadía/grupal
    if (siguiente === 4 && this.esPasadiaOGrupal()) siguiente = 5;
    if (siguiente <= 7) {
      this.etapaActual = siguiente;
      if (this.isBrowser) window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  retroceder(): void {
    let anterior = (this.etapaActual - 1) as EtapaId;
    if (anterior === 4 && this.esPasadiaOGrupal()) anterior = 3;
    if (anterior >= 1) {
      this.etapaActual = anterior;
      if (this.isBrowser) window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  irEtapa(n: EtapaId): void {
    if (n < this.etapaActual) { this.etapaActual = n; }
  }

  confirmarReserva(): void {
    this.router.navigate(['/confirmacion']);
  }

  puedeAvanzar(): boolean {
    switch (this.etapaActual) {
      case 1: return !!this.config.tipoReserva;
      case 2:
        if (!this.config.fechaEntrada) return false;
        if (!this.esPasadiaOGrupal() && !this.config.fechaSalida) return false;
        return true;
      case 3: return this.config.adultos > 0;
      case 4: return this.habitacionesSeleccionadas.length > 0 || this.config.modoEspacio !== 'habitaciones';
      case 5: return true;
      case 6: return !!(this.datos.nombre && this.datos.apellido && this.datos.email &&
                        this.datos.telefono && this.datos.tipoDocumento && this.datos.numeroDocumento);
      case 7: return this.pago.aceptaTerminos;
      default: return true;
    }
  }

  // ── Helpers ───────────────────────────────────────────────
  esPasadiaOGrupal(): boolean {
    return this.config.tipoReserva === 'pasadia' || this.config.tipoReserva === 'grupal';
  }

  getNombreTipo(): string {
    return this.tiposReserva.find(t => t.id === this.config.tipoReserva)?.nombre ?? '';
  }

  getNombreEspacio(): string {
    if (this.esPasadiaOGrupal()) return 'Áreas comunes';
    return this.espacios.find(e => e.id === this.config.espacio)?.nombre ?? '';
  }

  getCapacidadEspacio(): number {
    if (this.esPasadiaOGrupal()) return 20;
    return this.espacios.find(e => e.id === this.config.espacio)?.capacidadMax ?? 0;
  }

  // ── Calendario ───────────────────────────────────────────
  calMes  = new Date().getMonth();
  calAnio = new Date().getFullYear();
  calDias: { fecha: Date | null; num: number | null }[] = [];

  readonly MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  readonly DIAS_SEM = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  generarCalendario(): void {
    const primerDia = new Date(this.calAnio, this.calMes, 1).getDay();
    const totalDias = new Date(this.calAnio, this.calMes + 1, 0).getDate();
    const celdas: { fecha: Date | null; num: number | null }[] = [];
    for (let i = 0; i < primerDia; i++) celdas.push({ fecha: null, num: null });
    for (let d = 1; d <= totalDias; d++)
      celdas.push({ fecha: new Date(this.calAnio, this.calMes, d), num: d });
    this.calDias = celdas;
  }

  calMesAnterior(): void {
    if (this.calMes === 0) { this.calMes = 11; this.calAnio--; }
    else this.calMes--;
    this.generarCalendario();
  }

  calMesSiguiente(): void {
    if (this.calMes === 11) { this.calMes = 0; this.calAnio++; }
    else this.calMes++;
    this.generarCalendario();
  }

  seleccionarDia(fecha: Date | null): void {
    if (!fecha || this.esDiaDeshabilitado(fecha)) return;
    const entrada = this.config.fechaEntrada
      ? new Date(this.config.fechaEntrada + 'T12:00:00') : null;
    const salida = this.config.fechaSalida
      ? new Date(this.config.fechaSalida + 'T12:00:00') : null;

    if (!entrada || (entrada && salida)) {
      this.config.fechaEntrada = this.toDateStr(fecha);
      this.config.fechaSalida  = '';
      this.config.noches       = 0;
    } else {
      if (fecha <= entrada) {
        this.config.fechaEntrada = this.toDateStr(fecha);
        this.config.fechaSalida  = '';
        this.config.noches       = 0;
      } else {
        this.config.fechaSalida = this.toDateStr(fecha);
        this.calcularNoches();
      }
    }
    this.recalcular();
  }

  esDiaDeshabilitado(fecha: Date): boolean {
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    return fecha < hoy;
  }

  esDiaEntrada(fecha: Date | null): boolean {
    if (!fecha || !this.config.fechaEntrada) return false;
    return this.toDateStr(fecha) === this.config.fechaEntrada;
  }

  esDiaSalida(fecha: Date | null): boolean {
    if (!fecha || !this.config.fechaSalida) return false;
    return this.toDateStr(fecha) === this.config.fechaSalida;
  }

  esDiaEnRango(fecha: Date | null): boolean {
    if (!fecha || !this.config.fechaEntrada || !this.config.fechaSalida) return false;
    const d = fecha.getTime();
    const e = new Date(this.config.fechaEntrada + 'T12:00:00').getTime();
    const s = new Date(this.config.fechaSalida  + 'T12:00:00').getTime();
    return d > e && d < s;
  }

  esDiaHoy(fecha: Date | null): boolean {
    if (!fecha) return false;
    const h = new Date(); h.setHours(0,0,0,0);
    const f = new Date(fecha); f.setHours(0,0,0,0);
    return f.getTime() === h.getTime();
  }

  getTemporadaDia(fecha: Date | null): string {
    if (!fecha) return '';
    return this.calcularTemporada(fecha);
  }

  private toDateStr(d: Date): string { return d.toISOString().split('T')[0]; }
}
