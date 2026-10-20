import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Params } from '@angular/router';
import { Observable, map } from 'rxjs';
import { Disponibilidad, Reserva, ReservaService } from '../../services/reserva.service';
import { HabitacionService } from '../../services/habitacion.service';
import { AuthService } from '../../services/auth.service';
import { BusquedaDisponibilidadService } from '../../services/busqueda-disponibilidad.service';
import { TarifaService } from '../../services/tarifa.service';
import {
  CATALOGO_HABITACIONES, ESPACIOS, EspacioId, HabitacionReservable, ModoEspacio,
  NOMBRE_TEMPORADA, PRECIO_VACIO, Precio, Season, TIPOS_RESERVA, TipoReservaId,
  calcularPrecio, calcularTemporada, esPasadiaOGrupal, formatCOP, parseFecha, plural,
} from './reserva.catalogo';

export type PasoId = 'viaje' | 'espacio' | 'datos' | 'confirmar';

export interface ConfigViaje {
  tipo: TipoReservaId;
  fechaEntrada: string;
  fechaSalida: string;
  adultos: number;
  ninos11: number;   // 11 a 17 años: tarifa completa
  ninos10: number;   // 4 a 10 años: 60 %
  ninos3: number;    // 0 a 3 años: gratis
}

export interface DatosHuesped {
  nombre: string;
  apellido: string;
  email: string;
  codigoPais: string;
  telefono: string;
  tipoDocumento: string;
  numeroDocumento: string;
  pais: string;
  observaciones: string;
}

/** Una forma concreta de alojar al grupo, para comparar y recomendar. */
export interface OpcionGrupo {
  id: 'habitaciones' | EspacioId;
  titulo: string;
  detalle: string;
  imagen: string;
  habitaciones: HabitacionReservable[];
  capacidad: number;
  exclusivo: boolean;
  precio: Precio;
}

export const CAPACIDAD_MAXIMA = 20;
const BORRADOR_KEY = 'hospedaje-reserva-borrador';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const DATOS_VACIOS: DatosHuesped = {
  nombre: '', apellido: '', email: '', codigoPais: '+57', telefono: '',
  tipoDocumento: '', numeroDocumento: '', pais: 'CO', observaciones: '',
};

/**
 * Estado del asistente de reserva, compartido por todos los pasos. Vive
 * mientras vive la página de reservas (se provee en el componente Reservas).
 * Todo es signal: la app no usa zone.js, así que la vista se actualiza sola
 * cuando llegan las respuestas del backend.
 */
@Injectable()
export class ReservaEstado {
  private readonly reservaService = inject(ReservaService);
  private readonly habitacionService = inject(HabitacionService);
  private readonly authService = inject(AuthService);
  private readonly busquedaService = inject(BusquedaDisponibilidadService);
  private readonly tarifaService = inject(TarifaService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // ── Estado editable ──────────────────────────────────────
  readonly paso = signal<PasoId>('viaje');
  readonly config = signal<ConfigViaje>({
    tipo: 'individual', fechaEntrada: '', fechaSalida: '',
    adultos: 2, ninos11: 0, ninos10: 0, ninos3: 0,
  });
  readonly modo = signal<ModoEspacio>('habitaciones');
  readonly espacio = signal<EspacioId>('piso1');
  readonly seleccion = signal<number[]>([]);
  readonly datos = signal<DatosHuesped>({ ...DATOS_VACIOS });
  readonly aceptaTerminos = signal(false);
  /** Pasos ya visitados: permite saltar entre ellos desde el stepper o el resumen. */
  readonly visitados = signal<Set<PasoId>>(new Set(['viaje']));
  /** Paso en el que la persona intentó continuar con algo pendiente (para resaltarlo). */
  readonly intentoFallido = signal<PasoId | null>(null);

  // ── Datos del servidor ───────────────────────────────────
  readonly habitaciones = signal<HabitacionReservable[]>([]);
  readonly cargandoHabitaciones = signal(true);
  readonly errorHabitaciones = signal('');
  readonly disponibilidad = signal<Disponibilidad | null>(null);
  readonly consultando = signal(false);
  readonly errorDisponibilidad = signal('');
  readonly enviando = signal(false);
  readonly errorReserva = signal('');

  private seleccionPendiente: { habitacionId?: number; espacio?: EspacioId } | null = null;
  private consultaId = 0;

  // ── Derivados ────────────────────────────────────────────
  readonly esDia = computed(() => esPasadiaOGrupal(this.config().tipo));
  readonly tipoInfo = computed(() => TIPOS_RESERVA.find(t => t.id === this.config().tipo)!);

  readonly noches = computed(() => {
    const { fechaEntrada, fechaSalida } = this.config();
    if (this.esDia() || !fechaEntrada || !fechaSalida) return 0;
    const diff = Math.round((parseFecha(fechaSalida).getTime() - parseFecha(fechaEntrada).getTime()) / 86400000);
    return Math.max(diff, 0);
  });

  readonly totalPersonas = computed(() => {
    const c = this.config();
    return c.adultos + c.ninos11 + c.ninos10 + c.ninos3;
  });

  /** Personas que necesitan cama (los bebés duermen con sus papás). */
  readonly personasConCama = computed(() => this.totalPersonas() - this.config().ninos3);

  readonly temporada = computed<Season>(() => {
    const f = this.config().fechaEntrada;
    return f ? calcularTemporada(parseFecha(f)) : 'baja';
  });
  readonly nombreTemporada = computed(() => NOMBRE_TEMPORADA[this.temporada()]);

  readonly habitacionesElegidas = computed(() => {
    const ids = this.seleccion();
    return this.habitaciones().filter(h => ids.includes(h.id));
  });

  readonly capacidadElegida = computed(() =>
    this.habitacionesElegidas().reduce((t, h) => t + h.capacidad, 0));

  readonly precio = computed<Precio>(() => {
    const c = this.config();
    // Sin fechas, o sin espacio elegido en hospedaje, todavía no hay un precio real que mostrar.
    if (!c.fechaEntrada || (!this.esDia() && (!c.fechaSalida || !this.seleccion().length))) {
      return PRECIO_VACIO;
    }
    return this.precioDelGrupo();
  });

  /** Tarifa por persona del tipo de reserva elegido (editable en SOGO). */
  readonly tarifaActual = computed(() => this.tarifaService.de(this.config().tipo));

  readonly nombreEspacio = computed(() => {
    if (this.esDia()) return 'Zonas comunes del hospedaje';
    if (this.modo() !== 'habitaciones') return ESPACIOS.find(e => e.id === this.espacio())?.nombre ?? '';
    const elegidas = this.habitacionesElegidas();
    if (!elegidas.length) return '';
    return elegidas.length === 1
      ? elegidas[0].nombre
      : 'Habitaciones ' + elegidas.map(h => h.numero).join(', ');
  });

  readonly imagenEspacio = computed(() => {
    if (this.esDia()) return 'assets/galeria/sala-estar.jpg';
    if (this.modo() !== 'habitaciones') return ESPACIOS.find(e => e.id === this.espacio())?.imagen ?? '';
    return this.habitacionesElegidas()[0]?.imagenes[0] ?? 'assets/galeria/fachada.jpg';
  });

  readonly resumenPersonas = computed(() => {
    const c = this.config();
    const partes = [plural(c.adultos, 'adulto')];
    const ninos = c.ninos11 + c.ninos10;
    if (ninos) partes.push(plural(ninos, 'niño'));
    if (c.ninos3) partes.push(plural(c.ninos3, 'bebé'));
    return partes.join(' · ');
  });

  readonly pasos = computed(() => {
    const pasos: { id: PasoId; label: string }[] = [{ id: 'viaje', label: 'Tu viaje' }];
    if (!this.esDia()) pasos.push({ id: 'espacio', label: 'Tu espacio' });
    pasos.push({ id: 'datos', label: 'Tus datos' }, { id: 'confirmar', label: 'Confirmar y pagar' });
    return pasos;
  });

  readonly indicePaso = computed(() => this.pasos().findIndex(p => p.id === this.paso()));

  // ── Validaciones por paso ────────────────────────────────
  /** Fechas y personas completas (sin mirar si ya cargaron las tarifas). */
  readonly problemaFechasPersonas = computed(() => {
    const c = this.config();
    if (!c.fechaEntrada) return this.esDia() ? 'Elige la fecha de tu visita.' : 'Elige tu fecha de llegada.';
    if (!this.esDia() && !c.fechaSalida) return 'Elige tu fecha de salida.';
    if (c.adultos < 1) return 'Debe viajar al menos un adulto.';
    if (this.personasConCama() > CAPACIDAD_MAXIMA) {
      return `La casa recibe hasta ${CAPACIDAD_MAXIMA} personas. Escríbenos para grupos más grandes.`;
    }
    return '';
  });

  readonly problemaViaje = computed(() => {
    const basico = this.problemaFechasPersonas();
    if (basico) return basico;
    if (this.tarifaService.error()) return 'No pudimos cargar las tarifas. Recarga la página o intenta en un momento.';
    if (!this.tarifaActual()) return 'Cargando tarifas…';
    return '';
  });

  readonly problemaEspacio = computed(() => {
    if (this.esDia()) return '';
    if (this.consultando()) return 'Estamos verificando la disponibilidad…';
    if (this.modo() !== 'habitaciones' && this.espacioOcupado(this.espacio())) {
      return 'Ese espacio no está disponible en tus fechas.';
    }
    if (!this.seleccion().length) return 'Elige dónde se van a quedar.';
    const faltan = this.personasConCama() - this.capacidadElegida();
    if (faltan > 0) return `Te falta espacio para ${plural(faltan, 'persona')}. Agrega otra habitación.`;
    return '';
  });

  readonly erroresDatos = computed(() => {
    const d = this.datos();
    const errores: Partial<Record<keyof DatosHuesped, string>> = {};
    if (!d.nombre.trim()) errores.nombre = 'Escribe tu nombre.';
    if (!d.apellido.trim()) errores.apellido = 'Escribe tu apellido.';
    if (!EMAIL_RE.test(d.email.trim())) errores.email = 'Revisa el correo: ahí te llega la confirmación.';
    if (d.telefono.replace(/\D/g, '').length < 7) errores.telefono = 'Escribe un número de al menos 7 dígitos.';
    if (!d.tipoDocumento) errores.tipoDocumento = 'Elige el tipo de documento.';
    if (!d.numeroDocumento.trim()) errores.numeroDocumento = 'Escribe el número de documento.';
    return errores;
  });

  readonly problemaDatos = computed(() =>
    Object.keys(this.erroresDatos()).length ? 'Completa tus datos para continuar.' : '');

  readonly problemaPasoActual = computed(() => this.problemaDe(this.paso()));

  // ── Recomendaciones para grupos ──────────────────────────
  readonly esGrupo = computed(() =>
    !this.esDia() && (this.personasConCama() >= 5 || this.config().tipo === 'familiar'));

  /** Todas las formas viables de alojar al grupo en las fechas elegidas. */
  readonly opcionesGrupo = computed<OpcionGrupo[]>(() => {
    const habitaciones = this.habitaciones();
    if (!habitaciones.length || this.esDia()) return [];
    const necesarias = Math.max(this.personasConCama(), 1);
    const libres = habitaciones.filter(h => !this.estaOcupada(h.id));
    const opciones: OpcionGrupo[] = [];

    // Combinación más económica de habitaciones: primero las de menor precio por cupo.
    const ordenadas = [...libres].sort((a, b) =>
      a.precio / a.capacidad - b.precio / b.capacidad || b.capacidad - a.capacidad);
    const combo: HabitacionReservable[] = [];
    for (const h of ordenadas) {
      if (combo.reduce((t, x) => t + x.capacidad, 0) >= necesarias) break;
      combo.push(h);
    }
    const capacidadCombo = combo.reduce((t, x) => t + x.capacidad, 0);

    for (const esp of ESPACIOS) {
      const suyas = this.habitacionesDe(esp.id);
      if (this.espacioOcupado(esp.id) || suyas.some(h => this.estaOcupada(h.id))) continue;
      if (esp.capacidadMax < necesarias) continue;
      opciones.push({
        id: esp.id, titulo: esp.nombre, detalle: `${esp.habitaciones} · ${esp.camas}`,
        imagen: esp.imagen, habitaciones: suyas, capacidad: esp.capacidadMax, exclusivo: true,
        precio: this.precioCon(suyas, esp.id),
      });
    }

    const comboRepiteUnPiso = opciones.some(o =>
      o.habitaciones.length === combo.length && combo.every(h => o.habitaciones.includes(h)));
    if (capacidadCombo >= necesarias && !comboRepiteUnPiso) {
      opciones.unshift({
        id: 'habitaciones',
        titulo: combo.length === 1 ? combo[0].nombre : `${combo.length} habitaciones`,
        detalle: combo.map(h => `Hab. ${h.numero}`).join(' · '),
        imagen: combo[0].imagenes[0], habitaciones: combo, capacidad: capacidadCombo, exclusivo: false,
        precio: this.precioCon(combo, combo.some(h => h.piso === 2) ? 'piso2' : 'piso1'),
      });
    }
    return opciones;
  });

  /**
   * Con tarifa por persona, todas las opciones cuestan lo mismo para el grupo:
   * se recomienda el espacio exclusivo más pequeño que les alcance (más
   * privacidad al mismo precio); si ninguno alcanza, la mejor combinación de habitaciones.
   */
  readonly opcionRecomendada = computed<OpcionGrupo | null>(() => {
    const opciones = this.opcionesGrupo();
    const exclusivas = opciones.filter(o => o.exclusivo).sort((a, b) => a.capacidad - b.capacidad);
    return exclusivas[0] ?? opciones[0] ?? null;
  });

  readonly razonRecomendacion = computed(() => {
    const rec = this.opcionRecomendada();
    if (!rec) return '';
    const personas = plural(this.personasConCama(), 'persona');
    const porPersona = formatCOP(rec.precio.porPersona);
    if (!rec.exclusivo) {
      return `Estas habitaciones tienen camas para las ${personas}. La tarifa es de ${porPersona} por persona cada noche.`;
    }
    return `El precio para tu grupo es el mismo en cualquier opción (${porPersona} por persona cada noche), ` +
      `así que te recomendamos ${rec.titulo === 'Casa completa' ? 'la casa completa' : 'el ' + rec.titulo.toLowerCase()}: solo para ustedes.`;
  });

  /** Cuál de las opciones del grupo coincide con lo que está elegido ahora. */
  readonly opcionActual = computed(() => {
    const ids = this.seleccion();
    return this.opcionesGrupo().find(o =>
      (o.id === 'habitaciones' ? this.modo() === 'habitaciones' : this.modo() !== 'habitaciones' && this.espacio() === o.id) &&
      o.habitaciones.length === ids.length && o.habitaciones.every(h => ids.includes(h.id)))?.id ?? null;
  });

  // ── El guía: un consejo según dónde esté la persona ──────
  readonly consejo = computed(() => {
    const c = this.config();
    const personas = this.personasConCama();
    switch (this.paso()) {
      case 'viaje':
        if (!c.fechaEntrada) {
          return this.esDia()
            ? 'Elige el día de tu visita. Los puntos de colores indican la temporada y cambian el precio.'
            : '¡Bienvenido! Empecemos por las fechas: toca el día de llegada y luego el de salida.';
        }
        if (!this.esDia() && !c.fechaSalida) return 'Perfecto. Ahora toca el día en que te vas.';
        if (personas >= 9) return `Para ${plural(personas, 'persona')} suele convenir un piso o la casa completa. En el siguiente paso te muestro cuál te sale mejor.`;
        if (personas >= 5) return `Con ${plural(personas, 'persona')} te voy a comparar habitaciones y pisos completos para que elijas lo que más te convenga.`;
        if (this.temporada() === 'alta') return 'Ojo: tu llegada cae en temporada alta. Si tienes flexibilidad, un día entre semana suele salir más económico.';
        return 'Todo listo. Revisa cuántas personas vienen y continúa.';
      case 'espacio':
        if (this.esGrupo() && this.opcionRecomendada()) return 'Te dejo arriba mi recomendación. Toca cualquier habitación para ver sus fotos y detalles.';
        return 'Toca una habitación para ver sus fotos, camas y baño antes de elegirla.';
      case 'datos':
        return 'Solo lo necesario para enviarte la confirmación. Si vuelves a cambiar algo de la reserva, lo que escribas aquí se conserva.';
      case 'confirmar':
        return 'Revisa todo con calma. Puedes editar cualquier parte sin perder lo demás. Al confirmar te llevamos a Wompi para pagar de forma segura.';
    }
  });

  constructor() {
    // Guarda el borrador en la sesión del navegador: si la persona recarga
    // o vuelve atrás, no tiene que llenar todo de nuevo.
    effect(() => {
      const borrador = {
        paso: this.paso(), config: this.config(), modo: this.modo(), espacio: this.espacio(),
        seleccion: this.seleccion(), datos: this.datos(),
        visitados: [...this.visitados()],
      };
      if (!this.isBrowser) return;
      try { sessionStorage.setItem(BORRADOR_KEY, JSON.stringify(borrador)); } catch { /* sin almacenamiento */ }
    });
  }

  // ── Inicio ───────────────────────────────────────────────

  /**
   * Arma el estado inicial: borrador guardado, búsqueda del inicio y
   * parámetros de la URL (en ese orden de prioridad creciente). Si ya llegan
   * fechas y personas válidas, salta directo a elegir el espacio.
   */
  inicializar(params: Params): void {
    const borrador = this.leerBorrador();
    const traeBusqueda = !!params['fechaEntrada'];

    if (borrador) {
      this.datos.set({ ...DATOS_VACIOS, ...borrador.datos });
      if (!traeBusqueda && !params['habitacionId'] && !params['espacio']) {
        this.config.set({ ...this.config(), ...borrador.config });
        this.modo.set(borrador.modo ?? 'habitaciones');
        this.espacio.set(borrador.espacio ?? 'piso1');
        this.seleccion.set(borrador.seleccion ?? []);
        this.visitados.set(new Set(borrador.visitados ?? ['viaje']));
        this.paso.set(borrador.paso ?? 'viaje');
      }
    } else if (!traeBusqueda) {
      const busqueda = this.busquedaService.leer();
      if (busqueda) {
        this.actualizarConfig({
          tipo: busqueda.tipoReserva, fechaEntrada: busqueda.fechaEntrada, fechaSalida: busqueda.fechaSalida,
          adultos: busqueda.adultos, ninos3: busqueda.ninos3, ninos10: busqueda.ninos10, ninos11: busqueda.ninos11,
        });
      }
    }

    if (traeBusqueda || params['tipo'] || params['adultos']) {
      const num = (k: string, def: number) => params[k] !== undefined ? Math.max(0, +params[k] || 0) : def;
      const c = this.config();
      this.actualizarConfig({
        tipo: (params['tipo'] as TipoReservaId) || c.tipo,
        fechaEntrada: params['fechaEntrada'] || c.fechaEntrada,
        fechaSalida: params['fechaSalida'] || c.fechaSalida,
        adultos: Math.max(1, num('adultos', c.adultos)),
        ninos11: num('ninos11', 0), ninos10: num('ninos10', 0), ninos3: num('ninos3', 0),
      });
    }
    this.descartarFechasPasadas();

    if (params['habitacionId']) this.seleccionPendiente = { habitacionId: +params['habitacionId'] };
    else if (params['espacio']) this.seleccionPendiente = { espacio: params['espacio'] as EspacioId };

    // Llegó desde "Buscar disponibilidad" (o desde una habitación) con todo lo
    // necesario: no hay que volver a preguntar fechas ni personas.
    if ((traeBusqueda || this.seleccionPendiente) && !this.problemaFechasPersonas()) {
      this.marcarVisitado('viaje');
      this.paso.set(this.esDia() ? 'datos' : 'espacio');
      this.marcarVisitado(this.paso());
    }

    this.precargarDatosDeUsuario();
    this.cargarHabitaciones();
    this.tarifaService.cargar().subscribe({ error: () => { /* el aviso lo muestra problemaViaje */ } });
    this.consultarDisponibilidad();
  }

  private leerBorrador(): any {
    if (!this.isBrowser) return null;
    try {
      const raw = sessionStorage.getItem(BORRADOR_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private descartarFechasPasadas(): void {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const c = this.config();
    if (c.fechaEntrada && parseFecha(c.fechaEntrada) < hoy) {
      this.config.set({ ...c, fechaEntrada: '', fechaSalida: '' });
    }
  }

  /** Si la persona inició sesión, sus datos básicos ya vienen escritos. */
  private precargarDatosDeUsuario(): void {
    const usuario = this.authService.getUser();
    if (!usuario) return;
    const d = this.datos();
    this.datos.set({
      ...d,
      nombre: d.nombre || usuario.nombre || '',
      apellido: d.apellido || usuario.apellido || '',
      email: d.email || usuario.email || '',
      telefono: d.telefono || usuario.telefono || '',
    });
  }

  private cargarHabitaciones(): void {
    this.cargandoHabitaciones.set(true);
    this.habitacionService.obtenerTodas().subscribe({
      next: lista => {
        const idPorNumero = new Map((lista ?? []).map(h => [String(h.numero), h.id]));
        const habitaciones = CATALOGO_HABITACIONES
          .filter(c => idPorNumero.has(c.numero))
          .map(c => ({ ...c, id: idPorNumero.get(c.numero)! }));
        this.habitaciones.set(habitaciones);
        this.errorHabitaciones.set(habitaciones.length ? '' : 'No hay habitaciones disponibles para reservar en este momento.');
        this.cargandoHabitaciones.set(false);
        this.aplicarSeleccionPendiente();
      },
      error: () => {
        this.habitaciones.set([]);
        this.errorHabitaciones.set('No pudimos cargar las habitaciones. Recarga la página o intenta más tarde.');
        this.cargandoHabitaciones.set(false);
      },
    });
  }

  private aplicarSeleccionPendiente(): void {
    const pendiente = this.seleccionPendiente;
    if (!pendiente || !this.habitaciones().length) return;
    this.seleccionPendiente = null;
    if (pendiente.habitacionId && this.habitaciones().some(h => h.id === pendiente.habitacionId)) {
      this.modo.set('habitaciones');
      this.seleccion.set([pendiente.habitacionId]);
    } else if (pendiente.espacio) {
      this.elegirEspacio(pendiente.espacio);
    }
  }

  // ── Acciones ─────────────────────────────────────────────

  actualizarConfig(cambios: Partial<ConfigViaje>): void {
    const antes = this.config();
    const despues = { ...antes, ...cambios };
    if (esPasadiaOGrupal(despues.tipo)) despues.fechaSalida = '';
    this.config.set(despues);
    if (antes.fechaEntrada !== despues.fechaEntrada || antes.fechaSalida !== despues.fechaSalida
        || esPasadiaOGrupal(antes.tipo) !== esPasadiaOGrupal(despues.tipo)) {
      this.consultarDisponibilidad();
    }
  }

  actualizarDatos(cambios: Partial<DatosHuesped>): void {
    this.datos.set({ ...this.datos(), ...cambios });
  }

  consultarDisponibilidad(): void {
    const { fechaEntrada, fechaSalida } = this.config();
    if (!fechaEntrada || (!this.esDia() && !fechaSalida)) {
      this.disponibilidad.set(null);
      this.errorDisponibilidad.set('');
      return;
    }
    const id = ++this.consultaId;
    this.consultando.set(true);
    this.reservaService.verificarDisponibilidad(fechaEntrada, fechaSalida || undefined).subscribe({
      next: disponibilidad => {
        if (id !== this.consultaId) return;   // llegó tarde: ya cambiaron las fechas
        this.disponibilidad.set(disponibilidad);
        this.errorDisponibilidad.set('');
        this.consultando.set(false);
        this.descartarSeleccionOcupada();
      },
      error: () => {
        if (id !== this.consultaId) return;
        this.disponibilidad.set(null);
        this.errorDisponibilidad.set('No pudimos verificar la disponibilidad. Intenta de nuevo en un momento.');
        this.consultando.set(false);
      },
    });
  }

  private descartarSeleccionOcupada(): void {
    if (this.modo() !== 'habitaciones' && this.espacioOcupado(this.espacio())) {
      this.seleccion.set([]);
      return;
    }
    this.seleccion.set(this.seleccion().filter(id => !this.estaOcupada(id)));
  }

  estaOcupada(id: number): boolean {
    return this.disponibilidad()?.habitacionesOcupadas.includes(id) ?? false;
  }

  espacioOcupado(espacio: EspacioId): boolean {
    const d = this.disponibilidad();
    if (!d) return false;
    return espacio === 'piso1' ? d.piso1Ocupado
      : espacio === 'piso2' ? d.piso2Ocupado
      : d.casaOcupada || d.piso1Ocupado || d.piso2Ocupado;
  }

  alternarHabitacion(id: number): void {
    if (this.estaOcupada(id)) return;
    // Si venía de un piso o la casa, se parte de esas habitaciones (p. ej. Piso 1 + Hab. 201).
    const actual = this.seleccion();
    this.modo.set('habitaciones');
    this.seleccion.set(actual.includes(id) ? actual.filter(x => x !== id) : [...actual, id]);
    this.sincronizarEspacio();
  }

  /** Piso o casa completa: se reservan todas sus habitaciones. */
  elegirEspacio(espacio: EspacioId): void {
    if (this.espacioOcupado(espacio)) return;
    this.modo.set(espacio === 'completo' ? 'casa' : 'piso');
    this.espacio.set(espacio);
    this.seleccion.set(this.habitacionesDe(espacio).map(h => h.id));
  }

  elegirOpcion(opcion: OpcionGrupo): void {
    if (opcion.id === 'habitaciones') {
      this.modo.set('habitaciones');
      this.seleccion.set(opcion.habitaciones.map(h => h.id));
      this.sincronizarEspacio();
    } else {
      this.elegirEspacio(opcion.id);
    }
  }

  private sincronizarEspacio(): void {
    const pisos = new Set(this.habitacionesElegidas().map(h => h.piso));
    this.espacio.set(pisos.size === 2 ? 'completo' : pisos.has(2) ? 'piso2' : 'piso1');
  }

  habitacionesDe(espacio: EspacioId): HabitacionReservable[] {
    return this.habitaciones().filter(h => espacio === 'completo' || h.piso === (espacio === 'piso1' ? 1 : 2));
  }

  /** Lo que costaría alojar al grupo en un piso o en la casa completa. */
  precioDeEspacio(espacio: EspacioId): Precio {
    return this.precioCon(this.habitacionesDe(espacio), espacio);
  }

  /** Con tarifa por persona, el precio no depende de las habitaciones elegidas. */
  private precioCon(_habitaciones: HabitacionReservable[], _espacio: string): Precio {
    return this.precioDelGrupo();
  }

  private precioDelGrupo(): Precio {
    const c = this.config();
    return calcularPrecio({
      tarifa: this.tarifaActual(), temporada: this.temporada(),
      adultos: c.adultos, ninos10: c.ninos10, ninos11: c.ninos11,
      noches: this.noches(), deDia: this.esDia(),
    });
  }

  // ── Navegación ───────────────────────────────────────────

  problemaDe(paso: PasoId): string {
    switch (paso) {
      case 'viaje': return this.problemaViaje();
      case 'espacio': return this.problemaEspacio();
      case 'datos': return this.problemaDatos();
      case 'confirmar': return this.aceptaTerminos() ? '' : 'Acepta las políticas de reserva para confirmar.';
    }
  }

  /** Se puede ir a un paso si todos los anteriores están completos. */
  puedeIrA(paso: PasoId): boolean {
    const pasos = this.pasos();
    const destino = pasos.findIndex(p => p.id === paso);
    if (destino < 0) return false;
    return pasos.slice(0, destino).every(p => !this.problemaDe(p.id));
  }

  irA(paso: PasoId): void {
    if (!this.puedeIrA(paso)) return;
    this.intentoFallido.set(null);
    this.paso.set(paso);
    this.marcarVisitado(paso);
  }

  siguiente(): void {
    const pasos = this.pasos();
    const actual = this.indicePaso();
    if (this.problemaPasoActual()) {
      this.intentoFallido.set(this.paso());
      return;
    }
    if (actual >= pasos.length - 1) return;
    this.irA(pasos[actual + 1].id);
  }

  anterior(): void {
    const actual = this.indicePaso();
    if (actual > 0) {
      this.intentoFallido.set(null);
      this.paso.set(this.pasos()[actual - 1].id);
    }
  }

  private marcarVisitado(paso: PasoId): void {
    if (this.visitados().has(paso)) return;
    this.visitados.set(new Set([...this.visitados(), paso]));
  }

  /** Si cambia el tipo a pasadía estando en "espacio", el paso deja de existir. */
  corregirPasoInexistente(): void {
    if (!this.pasos().some(p => p.id === this.paso())) this.paso.set('viaje');
  }

  // ── Confirmación ─────────────────────────────────────────

  crearReserva(): Observable<{ id: number; codigo: string }> {
    const c = this.config();
    const d = this.datos();
    const precio = this.precio();
    const ids = this.esDia() ? [] : this.seleccion();
    const payload: Reserva = {
      tipoReserva: c.tipo,
      modoEspacio: this.esDia() ? undefined : this.modo(),
      espacio: this.esDia() ? undefined : this.espacio(),
      habitacionesIds: ids.length ? [...ids] : undefined,
      habitacionId: ids.length === 1 ? ids[0] : undefined,
      fechaIngreso: c.fechaEntrada,
      fechaSalida: c.fechaSalida || undefined,
      noches: this.esDia() ? 1 : this.noches(),
      precioNoche: precio.noche,
      precioTotal: precio.total,
      temporada: this.temporada(),
      huespedes: c.adultos,
      ninos3: c.ninos3,
      ninos10: c.ninos10,
      ninos11: c.ninos11,
      nombreHuesped: d.nombre.trim(),
      apellidoHuesped: d.apellido.trim(),
      emailContacto: d.email.trim(),
      codigoPais: d.codigoPais,
      telefonoContacto: d.telefono.trim(),
      pais: d.pais,
      tipoDocumento: d.tipoDocumento,
      numeroDocumento: d.numeroDocumento.trim(),
      observaciones: d.observaciones.trim() || undefined,
    };
    return this.reservaService.crearReserva(payload).pipe(map(r => ({ id: r.id!, codigo: r.codigoAcceso ?? '' })));
  }

  /** La reserva ya se creó: se borra el borrador (salvo los datos personales). */
  limpiarBorrador(): void {
    if (!this.isBrowser) return;
    try {
      sessionStorage.setItem(BORRADOR_KEY, JSON.stringify({ datos: this.datos() }));
    } catch { /* sin almacenamiento */ }
  }
}
