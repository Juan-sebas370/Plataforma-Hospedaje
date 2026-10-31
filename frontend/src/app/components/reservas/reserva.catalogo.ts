/**
 * Catálogo y reglas de negocio del módulo de reservas: tipos de reserva,
 * habitaciones, espacios (pisos / casa), tarifas, temporadas y cálculo de
 * precio. Sin estado propio: el calendario de temporadas es una señal que llena TarifaService.
 */

import { signal } from '@angular/core';

export type Season = 'alta' | 'media' | 'baja';
export type TipoReservaId = 'individual' | 'familiar' | 'pasadia' | 'grupal';
export type ModoEspacio = 'habitaciones' | 'piso' | 'casa';
export type EspacioId = 'piso1' | 'piso2' | 'completo';
export type PrioridadGrupo = 'presupuesto' | 'equilibrio' | 'privacidad';

export interface TipoReserva {
  id: TipoReservaId;
  nombre: string;
  corto: string;
  descripcion: string;
  horario: string;
  icono: 'user' | 'users' | 'sun' | 'briefcase';
}

export interface HabitacionCatalogo {
  numero: string;
  piso: 1 | 2;
  nombre: string;
  resumen: string;
  descripcion: string;
  capacidad: number;
  camas: string;
  bano: string;
  banoPrivado: boolean;
  precio: number;
  imagenes: string[];
  servicios: string[];
  destacado?: string;
}

/** Habitación del catálogo con el id REAL de la tabla `habitaciones`. */
export interface HabitacionReservable extends HabitacionCatalogo {
  id: number;
}

export interface Espacio {
  id: EspacioId;
  nombre: string;
  subtitulo: string;
  capacidadMax: number;
  habitaciones: string;
  camas: string;
  imagen: string;
  ventajas: string[];
}

export interface Tarifa {
  opcion: string;
  descripcion: string;
  capacidad: string;
  baja: number;
  media: number;
  alta: number;
}

export const TIPOS_RESERVA: TipoReserva[] = [
  {
    id: 'individual', nombre: 'Hospedaje', corto: 'Hospedaje', icono: 'user',
    descripcion: 'Para ti, tu pareja o un grupo pequeño en habitaciones.',
    horario: 'Check-in 3:00 p.m. – 10:00 p.m.',
  },
  {
    id: 'familiar', nombre: 'Familia o grupo', corto: 'Familiar', icono: 'users',
    descripcion: 'Varias habitaciones, un piso o la casa completa.',
    horario: 'Check-in 3:00 p.m. – 10:00 p.m.',
  },
  {
    id: 'pasadia', nombre: 'Pasadía', corto: 'Pasadía', icono: 'sun',
    descripcion: 'Reuniones, cumpleaños y planes de día, sin pasar la noche.',
    horario: '10:00 a.m. – 8:00 p.m.',
  },
  {
    id: 'grupal', nombre: 'Grupo de trabajo', corto: 'Trabajo', icono: 'briefcase',
    descripcion: 'Jornadas, talleres y reuniones con proyector y tablero.',
    horario: '8:00 a.m. – 6:00 p.m.',
  },
];

const SERVICIOS_BASE = ['WiFi gratis', 'Agua caliente 24 h', 'Cocina equipada', 'Ropa de cama y toallas'];

export const CATALOGO_HABITACIONES: HabitacionCatalogo[] = [
  {
    numero: '101', piso: 1, nombre: 'Habitación 101',
    resumen: 'Cama doble y camarote con baño privado.',
    descripcion: 'La habitación principal del primer piso. Cama doble y camarote, baño privado y un ambiente acogedor, ideal para una familia de 4.',
    capacidad: 4, camas: '1 cama doble · 1 camarote', bano: 'Baño privado', banoPrivado: true,
    precio: 120000, imagenes: ['assets/habitaciones/piso1/hab101-v2.jpg', 'assets/habitaciones/piso1/hab101-bano.jpg'],
    servicios: [...SERVICIOS_BASE, 'Lavandería'], destacado: 'Ideal para familias',
  },
  {
    numero: '102', piso: 1, nombre: 'Habitación 102',
    resumen: 'Cama matrimonial, baño compartido con la 103.',
    descripcion: 'Habitación doble, cómoda y tranquila, con cama matrimonial. Comparte baño únicamente con la habitación 103.',
    capacidad: 2, camas: '1 cama doble', bano: 'Baño compartido con la 103', banoPrivado: false,
    precio: 100000, imagenes: ['assets/habitaciones/piso1/hab102-v2.jpg', 'assets/habitaciones/piso1/hab102-103-bano.jpg'],
    servicios: SERVICIOS_BASE,
  },
  {
    numero: '103', piso: 1, nombre: 'Habitación 103',
    resumen: 'Cama matrimonial, baño compartido con la 102.',
    descripcion: 'Habitación doble con cama matrimonial y ambiente tranquilo. Comparte baño únicamente con la habitación 102.',
    capacidad: 2, camas: '1 cama doble', bano: 'Baño compartido con la 102', banoPrivado: false,
    precio: 100000, imagenes: ['assets/habitaciones/piso1/hab103-v2.jpg', 'assets/habitaciones/piso1/hab102-103-bano.jpg'],
    servicios: [...SERVICIOS_BASE, 'Lavandería'],
  },
  {
    numero: '201', piso: 2, nombre: 'Habitación 201',
    resumen: 'Cama doble y camarote con baño privado.',
    descripcion: 'Amplia, con cama doble y camarote y baño privado. Un espacio tranquilo para 4 personas en el segundo piso.',
    capacidad: 4, camas: '1 cama doble · 1 camarote', bano: 'Baño privado', banoPrivado: true,
    precio: 80000,
    imagenes: [
      'assets/habitaciones/piso2/hab201.jpg',
      'assets/habitaciones/piso2/hab201-bano.jpg',
    ],
    servicios: [...SERVICIOS_BASE, 'Lavandería'], destacado: 'Mejor precio',
  },
  {
    numero: '202', piso: 2, nombre: 'Habitación 202',
    resumen: 'Cama matrimonial, baño compartido con la 203.',
    descripcion: 'Habitación doble acogedora con cama matrimonial, perfecta para parejas. Comparte baño únicamente con la habitación 203.',
    capacidad: 2, camas: '1 cama doble', bano: 'Baño compartido con la 203', banoPrivado: false,
    precio: 110000,
    imagenes: [
      'assets/habitaciones/piso2/hab202.jpg',
      'assets/habitaciones/piso2/hab202-203-bano.jpg',
    ],
    servicios: SERVICIOS_BASE, destacado: 'Para parejas',
  },
  {
    numero: '203', piso: 2, nombre: 'Habitación 203',
    resumen: 'Cama matrimonial con vista al paisaje cafetero.',
    descripcion: 'Habitación doble con cama matrimonial y vista al entorno cafetero. Comparte baño únicamente con la habitación 202.',
    capacidad: 2, camas: '1 cama doble', bano: 'Baño compartido con la 202', banoPrivado: false,
    precio: 110000, imagenes: ['assets/habitaciones/piso2/hab203-v2.jpg', 'assets/habitaciones/piso2/hab202-203-bano.jpg'],
    servicios: [...SERVICIOS_BASE, 'Lavandería'],
  },
  {
    numero: '204', piso: 2, nombre: 'Habitación 204',
    resumen: 'Cama doble y camarote con baño privado.',
    descripcion: 'Cama doble y camarote con baño privado. Acogedora y tranquila, ideal para 4 personas.',
    capacidad: 4, camas: '1 cama doble · 1 camarote', bano: 'Baño privado', banoPrivado: true,
    precio: 80000, imagenes: ['assets/habitaciones/piso2/hab204-v2.jpg', 'assets/habitaciones/piso2/hab204-bano.jpg'],
    servicios: [...SERVICIOS_BASE, 'Lavandería'], destacado: 'Mejor precio',
  },
];

export const ESPACIOS: Espacio[] = [
  {
    id: 'piso1', nombre: 'Piso 1', subtitulo: 'El piso solo para tu grupo',
    capacidadMax: 8, habitaciones: '3 habitaciones', camas: '3 camas dobles · 1 camarote',
    imagen: 'assets/habitaciones/piso1/hab101-v2.jpg',
    ventajas: ['Nadie más en el piso', 'Baño privado y baño compartido', 'Acceso a cocina y zonas comunes'],
  },
  {
    id: 'piso2', nombre: 'Piso 2', subtitulo: 'El piso solo para tu grupo',
    capacidadMax: 12, habitaciones: '4 habitaciones', camas: '4 camas dobles · 2 camarotes',
    imagen: 'assets/habitaciones/piso2/hab201.jpg',
    ventajas: ['Nadie más en el piso', 'Dos baños privados', 'Vista al paisaje cafetero'],
  },
  {
    id: 'completo', nombre: 'Casa completa', subtitulo: 'Toda la casa, exclusiva para ustedes',
    capacidadMax: 20, habitaciones: '7 habitaciones · 2 pisos', camas: '7 camas dobles · 3 camarotes',
    imagen: 'assets/galeria/fachada.jpg',
    ventajas: ['Privacidad total', 'Sala, cocina y zonas comunes solo para ustedes', 'Ideal para celebraciones'],
  },
];

export const ZONAS_COMUNES = [
  { nombre: 'Sala de estar', imagen: 'assets/galeria/sala-estar.jpg' },
  { nombre: 'Mezanine', imagen: 'assets/habitaciones/espacios/mezanine.jpg' },
  { nombre: 'Fachada', imagen: 'assets/galeria/fachada.jpg' },
];


export const NOMBRE_TEMPORADA: Record<Season, string> = { alta: 'Alta', media: 'Media', baja: 'Baja' };

export function esPasadiaOGrupal(tipo: TipoReservaId): boolean {
  return tipo === 'pasadia' || tipo === 'grupal';
}

// ── Temporadas ──────────────────────────────────────────────
// El calendario se gestiona en SOGO (Alojamiento › Tarifas y temporadas) y llega por
// GET /api/tarifas/temporadas (TarifaService). Es una señal para que el calendario y el
// precio se recalculen solos cuando llega. Misma regla que el servidor
// (CalendarioTemporadas.java) y que SOGO (rates.model.ts).

export interface PeriodoAnual { nombre: string; desde: string; hasta: string; }        // MM-DD
export interface FechaEspecial { nombre: string; desde: string; hasta: string; temporada: Season; } // YYYY-MM-DD
export interface CalendarioTemporadas {
  alta: PeriodoAnual[]; media: PeriodoAnual[]; semanaSanta: boolean; finesDeSemana: boolean;
  festivosMedia: boolean; festivos: string[]; especiales: FechaEspecial[];
}

/** Reglas de fábrica (las de antes), mientras llega el calendario de la base de datos. */
export const CALENDARIO_FABRICA: CalendarioTemporadas = {
  alta: [{ nombre: 'Fin y comienzo de año', desde: '12-15', hasta: '01-15' }, { nombre: 'Vacaciones de mitad de año', desde: '06-15', hasta: '07-15' }],
  media: [], semanaSanta: true, finesDeSemana: true, festivosMedia: true, festivos: [], especiales: [],
};
const FESTIVOS_FIJOS = ['01-01', '05-01', '07-20', '08-07', '12-08', '12-25'];

export const calendarioTemporadas = signal<CalendarioTemporadas>(CALENDARIO_FABRICA);

function enPeriodo(md: string, p: PeriodoAnual): boolean {
  return p.desde <= p.hasta ? md >= p.desde && md <= p.hasta : md >= p.desde || md <= p.hasta;
}

export function calcularTemporada(d: Date): Season {
  const c = calendarioTemporadas();
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const md = iso.slice(5);
  const especial = c.especiales.find(e => iso >= e.desde && iso <= e.hasta);
  if (especial) return especial.temporada;
  if (c.alta.some(p => enPeriodo(md, p))) return 'alta';
  if (c.semanaSanta && esSemanaSanta(d)) return 'alta';
  if (c.media.some(p => enPeriodo(md, p))) return 'media';
  if (c.festivosMedia && (c.festivos.length ? c.festivos.includes(iso) : FESTIVOS_FIJOS.includes(md))) return 'media';
  const dow = d.getDay();
  if (c.finesDeSemana && (dow === 0 || dow === 6)) return 'media';
  return 'baja';
}

function esSemanaSanta(d: Date): boolean {
  const dia = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const pascua = calcularPascua(d.getFullYear());
  const inicio = new Date(pascua); inicio.setDate(pascua.getDate() - 8);
  return dia >= inicio && dia <= pascua;
}

function calcularPascua(y: number): Date {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d2 = Math.floor(b / 4), e = b % 4,
        f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3),
        h = (19 * a + b - d2 - g + 15) % 30, i = Math.floor(c / 4), k = c % 4,
        l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
        month = Math.floor((h + l - 7 * m + 114) / 31),
        day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, month - 1, day);
}


// ── Precio ──────────────────────────────────────────────────

/** Tarifa por persona de un tipo de reserva en cada temporada (viene de la base de datos). */
export interface TarifaPorTemporada {
  baja: number;
  media: number;
  alta: number;
}

export interface EntradaPrecio {
  tarifa: TarifaPorTemporada | undefined;
  temporada: Season;
  adultos: number;
  ninos10: number;
  ninos11: number;
  noches: number;
  deDia: boolean;       // pasadía / grupo de trabajo: se cobra un día
}

export interface Precio {
  porPersona: number;   // tarifa por persona (y noche, en hospedaje)
  adultos: number;      // total adultos por noche
  ninos: number;        // total niños por noche
  noche: number;
  total: number;
}

export const PRECIO_VACIO: Precio = { porPersona: 0, adultos: 0, ninos: 0, noche: 0, total: 0 };

/**
 * Regla de precio (la misma que aplica el backend al crear la reserva):
 * tarifa por persona del tipo de reserva en la temporada de llegada × noches.
 * Adultos y niños de 11 años en adelante pagan tarifa completa, de 4 a 10
 * años el 60 % y bebés (0 a 3) no pagan. Las tarifas se editan en SOGO.
 */
export function calcularPrecio(e: EntradaPrecio): Precio {
  if (!e.tarifa) return PRECIO_VACIO;
  const porPersona = e.tarifa[e.temporada];
  const adultos = e.adultos * porPersona;
  const ninos = e.ninos10 * porPersona * 0.6 + e.ninos11 * porPersona;
  const noche = adultos + ninos;
  return { porPersona, adultos, ninos, noche, total: noche * (e.deDia ? 1 : Math.max(e.noches, 1)) };
}


// ── Formato ─────────────────────────────────────────────────

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

export function formatCOP(v: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(v);
}

/** '2026-10-04' → 'sáb 4 oct' */
export function formatFecha(str: string, conDia = true): string {
  if (!str) return '–';
  const d = parseFecha(str);
  return `${conDia ? DIAS_CORTOS[d.getDay()] + ' ' : ''}${d.getDate()} ${MESES_CORTOS[d.getMonth()]}`;
}

export function parseFecha(str: string): Date {
  return new Date(str + 'T12:00:00');
}

/** Fecha local en formato YYYY-MM-DD (sin el corrimiento de zona horaria de toISOString). */
export function toDateStr(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dia}`;
}

export function plural(n: number, singular: string, pluralTxt = singular + 's'): string {
  return `${n} ${n === 1 ? singular : pluralTxt}`;
}
