import { ChangeDetectorRef, Component, NgZone, OnInit, OnDestroy, PLATFORM_ID, Inject, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitacionService, Habitacion } from '../../services/habitacion.service';
import { ReservaService, Disponibilidad } from '../../services/reserva.service';
import { TranslateService } from '../../services/translate.service';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-habitaciones',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './habitaciones.html',
  styleUrl: './habitaciones.css',
})
export class Habitaciones implements OnInit, OnDestroy {
  habitaciones: Habitacion[] = [];
  habitacionesFiltradas: Habitacion[] = [];
  habitacionesNoDisponibles: Habitacion[] = [];
  motivoNoDisponibilidad = new Map<number, string>();
  busqueda = {
    fechaEntrada: '',
    fechaSalida: '',
    adultos: 0,
    ninos3: 0,
    ninos10: 0,
    ninos11: 0,
    tipoReserva: '',
  };
  disponibilidad: Disponibilidad | null = null;
  filtroActivo: string = 'Todas';
  textoBusqueda: string = '';
  cargando: boolean = false;
  error: string = '';
  private isBrowser = false;

  private readonly imagenesPorHabitacion: Record<string, string> = {
    '101': 'assets/habitaciones/piso1/hab101-v2.jpg',
    '102': 'assets/habitaciones/piso1/hab102-v2.jpg',
    '103': 'assets/habitaciones/piso1/hab103-v2.jpg',
    '201': 'assets/habitaciones/piso2/hab201.jpg',
    '202': 'assets/habitaciones/piso2/hab202.jpg',
    '203': 'assets/habitaciones/piso2/hab203-v2.jpg',
    '204': 'assets/habitaciones/piso2/hab204-v2.jpg',
  };

  // Nuevos filtros avanzados
  filtros = {
    precioMinimo: 0,
    precioMaximo: 300000,
    capacidad: 0,
    tipo: '',
    servicios: [] as string[],
    ordenar: 'nombre',
  };

  // Estados UI
  mostrarFiltros: boolean = false;
  vistaGrilla: boolean = true;
  habitacionSeleccionada: Habitacion | null = null;
  mostrarDetalle: boolean = false;
  imagenActivaIdx: number = 0;

  // Opciones de servicios
  serviciosDisponibles = [
    'WiFi gratis',
    'Aire acondicionado',
    'Minibar',
    'Smart TV',
    'Servicio a la habitación 24/7',
    'Jacuzzi privado',
    'Terraza privada',
    'Escritorio',
    'Caja fuerte',
  ];

  pisoResumen = [
    {
      piso: 1,
      titulo: 'habs.piso1',
      descripcion:
        'habs.desc1',
      habitaciones: 3,
      capacidad: 8,
      camasDobles: 3,
      camarotes: 1,
      detalles: [
        {
          nombre: '101',
          descripcion:
            'habs.d101',
        },
        {
          nombre: '102',
          descripcion: 'habs.d102',
        },
        {
          nombre: '103',
          descripcion: 'habs.d103',
        },
      ],
    },
    {
      piso: 2,
      titulo: 'habs.piso2',
      descripcion:
        'habs.desc2',
      habitaciones: 4,
      capacidad: 12,
      camasDobles: 4,
      camarotes: 2,
      detalles: [
        {
          nombre: '201',
          descripcion:
            'habs.d201',
        },
        {
          nombre: '202',
          descripcion: 'habs.d202',
        },
        {
          nombre: '203',
          descripcion: 'habs.d203',
        },
        {
          nombre: '204',
          descripcion: 'habs.d204',
        },
      ],
    },
  ];

  serviciosGenerales = [
    'Agua caliente en cada baño',
    'Lencería completa: toallas, almohadas, sábanas y cobijas',
    'Cocina equipada para preparar comidas',
    'WiFi disponible en todo el espacio',
    'Sala de estar y televisor en la sala',
  ];

  mezanineInfo = {
    titulo: 'Mezanine',
    descripcion:
      'Sala de juegos con varios juegos de mesa y mesa de ping pong para uso de huéspedes.',
  };

  reservaTipos = [
    {
      tipo: 'Reserva individual',
      descripcion:
        'Tarifa por habitación para ocupación individual o pareja. Ideal para viajes cortos y estadías personales.',
      condiciones: 'Disponible todo el año.',
      horario: '3pm a 12am',
      tarifas: [
        { temporada: 'Alta', valor: '85.000' },
        { temporada: 'Media', valor: '75.000' },
        { temporada: 'Baja', valor: '65.000' },
      ],
    },
    {
      tipo: 'Grupo familiar',
      descripcion:
        'Para mínimo 6 personas y máximo 8 personas. Ideal para familias y grupos de viaje.',
      condiciones: 'Disponible todo el año.',
      horario: '3pm a 12am',
      tarifas: [
        { temporada: 'Alta', valor: '71.000' },
        { temporada: 'Media', valor: '61.000' },
        { temporada: 'Baja', valor: '51.000' },
      ],
    },
    {
      tipo: 'Pasadía',
      descripcion:
        'Para cumpleaños y celebraciones. Incluye sala comedor, una habitación, baño social y salón de juegos en el mezanine.',
      condiciones: 'Solo temporada baja. Capacidad mínima 10 personas y máxima 15 personas.',
      horario: '10am a 8pm',
      tarifas: [
        { temporada: 'Baja', valor: '40.000 - 41.000' },
      ],
    },
    {
      tipo: 'Reuniones de grupo',
      descripcion:
        'Reuniones de trabajo para empresarios y grupos de trabajo. Espacio cómodo para sesiones profesionales.',
      condiciones: 'Disponible en temporadas media y baja.',
      horario: '8am a 6pm',
      tarifas: [
        { temporada: 'Media', valor: 'Valor según paquete' },
        { temporada: 'Baja', valor: 'Valor según paquete' },
      ],
    },
  ];

  temporadas = [
    {
      tipo: 'Alta',
      puntos: [
        'Vacaciones: Dic 15 a Ene 15 y Jun 15 a Jul 15',
        'Semana Santa: viernes antes de Domingo de Ramos a Domingo de Pascua',
        'Semana de receso: primera semana de octubre (viernes anterior a domingo de receso)',
      ],
    },
    {
      tipo: 'Media',
      puntos: ['Sábados, domingos y festivos'],
    },
    {
      tipo: 'Baja',
      puntos: [
        'Lunes a viernes, excepto festivos y el día anterior a Domingo de Ramos',
      ],
    },
  ];

  horarios = [
    { nombre: 'Pasadía', horario: '10am a 8pm' },
    { nombre: 'Reuniones de trabajo', horario: '8am a 6pm' },
    { nombre: 'Reserva individual', horario: '3pm a 12am' },
    { nombre: 'Grupo familiar', horario: '3pm a 12am' },
  ];

  private readonly i18n = inject(TranslateService);

  constructor(
    private habitacionService: HabitacionService,
    private router: Router,
    private route: ActivatedRoute,
    private reservaService: ReservaService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.busqueda = {
        fechaEntrada: params['fechaEntrada'] || '',
        fechaSalida: params['fechaSalida'] || '',
        adultos: Number(params['adultos'] || 0),
        ninos3: Number(params['ninos3'] || 0),
        ninos10: Number(params['ninos10'] || 0),
        ninos11: Number(params['ninos11'] || 0),
        tipoReserva: params['tipo'] || '',
      };
      if (this.busqueda.fechaEntrada) this.consultarDisponibilidad();
      this.aplicarFiltros();
    });
    this.limpiarFiltros();
    this.cargarHabitaciones();
    // Desde "Ver Piso 1 / Piso 2" del inicio: llega con el filtro del piso ya elegido.
    const piso = this.route.snapshot.queryParamMap.get('piso');
    if (piso === '1' || piso === '2') this.aplicarFiltro(`Piso ${piso}`);
  }

  cargarHabitaciones() {
    // El catalogo local permite renderizar las habitaciones inmediatamente.
    this.usarDatosEjemplo();
    this.cargando = false;
    this.error = '';
    if (this.busqueda.fechaEntrada) this.establecerDisponibilidadLocal();
    this.cdr.detectChanges();
    
    this.habitacionService.obtenerTodas().subscribe({
      next: (habitaciones) => {
        const datos = Array.isArray(habitaciones) ? habitaciones : [];

        if (datos.length >= 6) {
          this.zone.run(() => {
            this.habitaciones = datos.map(habitacion => this.normalizarHabitacion(habitacion));
            this.aplicarFiltros();
            this.cdr.detectChanges();
          });
        }
      },
      error: () => {
        // El catalogo local ya esta visible; el error no debe bloquearlo.
        this.error = '';
      }
    });
  }

  private normalizarHabitacion(habitacion: Habitacion): Habitacion {
    const imagenFallback = this.imagenesPorHabitacion[habitacion.numero] || 'assets/logo.png';
    const imagenes = Array.isArray(habitacion.imagenes)
      ? habitacion.imagenes
        .filter(Boolean)
        .map(imagen => this.normalizarRutaImagen(imagen, imagenFallback))
      : [];

    return {
      ...habitacion,
      numero: habitacion.numero || '',
      tipo: habitacion.tipo || 'Habitación',
      capacidad: Number(habitacion.capacidad) || 0,
      precioNoche: Number(habitacion.precioNoche) || 0,
      descripcion: habitacion.descripcion || 'Espacio cómodo para tu estadía en Filandia.',
      servicios: Array.isArray(habitacion.servicios) ? habitacion.servicios : [],
      // El API no trae fotos: se usan las del catálogo local (habitación y baño).
      imagenes: imagenes.length > 0 ? imagenes : this.habitaciones.find(h => h.numero === habitacion.numero)?.imagenes ?? [imagenFallback],
    };
  }

  private normalizarRutaImagen(imagen: string, fallback: string): string {
    if (imagen.startsWith('assets/') || imagen.startsWith('/assets/') || imagen.startsWith('http')) {
      return imagen;
    }
    return fallback;
  }

  imagenPrincipal(habitacion: Habitacion): string {
    return habitacion.imagenes?.[0] || this.imagenesPorHabitacion[habitacion.numero] || 'assets/logo.png';
  }

  get totalHuespedes(): number {
    return this.busqueda.adultos + this.busqueda.ninos3 + this.busqueda.ninos10 + this.busqueda.ninos11;
  }

  get tieneBusqueda(): boolean {
    return !!this.busqueda.fechaEntrada && this.totalHuespedes > 0;
  }

  get esGrupoGrande(): boolean {
    return this.totalHuespedes >= 5;
  }

  get recomendacion(): string {
    if (!this.tieneBusqueda || this.alternativasEspacio.length === 0) return '';
    const pisoConveniente = this.alternativasEspacio.some(alternativa => alternativa.conveniente);
    if (this.totalHuespedes >= 13) {
      return 'habs.recCasa';
    }
    if (this.totalHuespedes >= 9) {
      return pisoConveniente
        ? 'habs.recPisoComodo'
        : 'habs.recPisoCapacidad';
    }
    if (this.totalHuespedes >= 5) {
      return 'habs.recOpciones';
    }
    return 'habs.recPrimero';
  }

  get alternativasEspacio() {
    if (!this.tieneBusqueda || !this.esGrupoGrande || !this.disponibilidad) return [];

    const total = this.totalHuespedes;
    const habitacionesLibres = this.habitaciones
      .filter(habitacion => !this.disponibilidad?.habitacionesOcupadas.includes(habitacion.id))
      .sort((a, b) => a.precioNoche - b.precioNoche);
    let capacidadComparada = 0;
    let precioHabitaciones = 0;
    for (const habitacion of habitacionesLibres) {
      if (capacidadComparada >= total) break;
      capacidadComparada += habitacion.capacidad;
      precioHabitaciones += habitacion.precioNoche;
    }

    const pisos = [
      { id: 'piso1', nombre: 'habs.altPiso1', capacidad: 8, precio: 550000, ocupado: this.disponibilidad.piso1Ocupado },
      { id: 'piso2', nombre: 'habs.altPiso2', capacidad: 12, precio: 550000, ocupado: this.disponibilidad.piso2Ocupado },
      { id: 'completo', nombre: 'habs.altCasa', capacidad: 20, precio: 1200000, ocupado: this.disponibilidad.piso1Ocupado || this.disponibilidad.piso2Ocupado },
    ];

    return pisos
      .filter(piso => !piso.ocupado && piso.capacidad >= total)
      .map(piso => ({
        ...piso,
        precioHabitaciones,
        conveniente: capacidadComparada >= total && piso.precio <= precioHabitaciones,
      }));
  }

  esAlternativaDisponible(espacio: string): boolean {
    return this.alternativasEspacio.some(alternativa => alternativa.id === espacio);
  }

  reservarEspacio(espacio: string): void {
    if (this.tieneBusqueda && !this.esAlternativaDisponible(espacio)) return;
    this.router.navigate(['/reservas'], {
      queryParams: {
        espacio,
        modoEspacio: espacio === 'completo' ? 'casa' : 'piso',
        fechaEntrada: this.busqueda.fechaEntrada || undefined,
        fechaSalida: this.busqueda.fechaSalida || undefined,
        adultos: this.busqueda.adultos || undefined,
        ninos3: this.busqueda.ninos3 || undefined,
        ninos10: this.busqueda.ninos10 || undefined,
        ninos11: this.busqueda.ninos11 || undefined,
        tipo: this.busqueda.tipoReserva || undefined,
      },
    });
  }

  consultarDisponibilidad(): void {
    this.reservaService.verificarDisponibilidad(
      this.busqueda.fechaEntrada,
      this.busqueda.fechaSalida || undefined,
    ).subscribe({
      next: disponibilidad => {
        this.zone.run(() => {
          this.disponibilidad = disponibilidad;
          this.aplicarFiltros();
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          // Conserva la disponibilidad local optimista si el API no responde.
          this.aplicarFiltros();
          this.cdr.detectChanges();
        });
      },
    });
  }

  private establecerDisponibilidadLocal(): void {
    this.disponibilidad = {
      habitacionesOcupadas: [],
      espaciosOcupados: [],
      piso1Ocupado: false,
      piso2Ocupado: false,
      casaOcupada: false,
      disponible: true,
      mensaje: '',
    };
  }

  usarDatosEjemplo() {
    this.habitaciones = [
      // PISO 1 (ARRIBA) - 4 Habitaciones
      {
        id: 1,
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
        id: 2,
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
        id: 3,
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
      // PISO 2 (ABAJO) - 4 Habitaciones
      {
        id: 5,
        numero: '201',
        tipo: 'Doble',
        piso: 2,
        capacidad: 4,
        precioNoche: 80000,
        descripcion: 'Habitación con cama doble y camarote. Baño privado, ideal para 4 personas en un ambiente acogedor y tranquilo.',
        servicios: ['WiFi gratis', 'Agua caliente', 'Cocina equipada', 'Lavandería'],
        imagenes: [
          'assets/habitaciones/piso2/hab201.jpg',

          'assets/habitaciones/piso2/hab201-bano.jpg',
        ],
        estado: 'DISPONIBLE',
        climatizacion: false,
        television: false,
        wifi: true,
        bano: true,
        minibar: false
      },
      {
        id: 6,
        numero: '202',
        tipo: 'Doble',
        piso: 2,
        capacidad: 2,
        precioNoche: 110000,
        descripcion: 'Habitación doble acogedora con cama matrimonial. Comparte baño con la habitación 203. Perfecta para parejas.',
        servicios: ['WiFi gratis', 'Agua caliente', 'Cocina equipada'],
        imagenes: [
          'assets/habitaciones/piso2/hab202.jpg',

          'assets/habitaciones/piso2/hab202-203-bano.jpg',
        ],
        estado: 'DISPONIBLE',
        climatizacion: false,
        television: false,
        wifi: true,
        bano: false,
        minibar: false
      },
      {
        id: 7,
        numero: '203',
        tipo: 'Doble',
        piso: 2,
        capacidad: 2,
        precioNoche: 115000,
        descripcion: 'Habitación doble con cama matrimonial y ambiente tranquilo. Comparte baño con la habitación 202. Vistas al entorno cafetero.',
        servicios: ['WiFi gratis', 'Agua caliente', 'Cocina equipada', 'Lavandería'],
        imagenes: [
          'assets/habitaciones/piso2/hab203-v2.jpg',

          'assets/habitaciones/piso2/hab202-203-bano.jpg',
        ],
        estado: 'DISPONIBLE',
        climatizacion: false,
        television: false,
        wifi: true,
        bano: false,
        minibar: false
      },
      {
        id: 8,
        numero: '204',
        tipo: 'Individual',
        piso: 2,
        capacidad: 4,
        precioNoche: 80000,
        descripcion: 'Habitación con cama doble y camarote. Baño privado, ideal para 4 personas en un ambiente acogedor y tranquilo.',
        servicios: ['WiFi gratis', 'Agua caliente', 'Cocina equipada', 'Lavandería'],
        imagenes: [
          'assets/habitaciones/piso2/hab204-v2.jpg',

          'assets/habitaciones/piso2/hab204-bano.jpg',
        ],
        estado: 'DISPONIBLE',
        climatizacion: false,
        television: false,
        wifi: true,
        bano: true,
        minibar: false
      }
    ];
    this.aplicarFiltros();
  }

  aplicarFiltro(tipo: string) {
    this.filtroActivo = tipo;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let resultado = [...this.habitaciones];

    if (this.filtroActivo === 'Piso 1') {
      resultado = resultado.filter(h => h.piso === 1);
    } else if (this.filtroActivo === 'Piso 2') {
      resultado = resultado.filter(h => h.piso === 2);
    } else if (this.filtroActivo !== 'Todas') {
      resultado = resultado.filter(h => h.tipo === this.filtroActivo);
    }

    if (this.textoBusqueda.trim() !== '') {
      const busqueda = this.textoBusqueda.toLowerCase();
      resultado = resultado.filter(h =>
        h.tipo.toLowerCase().includes(busqueda) ||
        h.descripcion.toLowerCase().includes(busqueda) ||
        h.numero.toLowerCase().includes(busqueda) ||
        h.servicios.some(s => s.toLowerCase().includes(busqueda))
      );
    }

    this.motivoNoDisponibilidad.clear();
    const disponibles: Habitacion[] = [];
    const noDisponibles: Habitacion[] = [];

    resultado.forEach(habitacion => {
      const capacidadInsuficiente = this.tieneBusqueda
        && !this.esGrupoGrande
        && habitacion.capacidad < this.totalHuespedes;
      const ocupada = this.disponibilidad?.habitacionesOcupadas.includes(habitacion.id) ?? false;
      if (capacidadInsuficiente || ocupada) {
        this.motivoNoDisponibilidad.set(
          habitacion.id,
          ocupada ? 'habs.motivoOcupada' : 'habs.motivoCapacidad',
        );
        noDisponibles.push(habitacion);
      } else {
        disponibles.push(habitacion);
      }
    });

    this.habitacionesFiltradas = disponibles;
    this.habitacionesNoDisponibles = noDisponibles;
  }

  onBusquedaChange() {
    this.aplicarFiltros();
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  precioPorPersona(habitacion: Habitacion): string {
    const personas = habitacion.capacidad && habitacion.capacidad > 0 ? habitacion.capacidad : 1;
    const precioPersona = Math.round(habitacion.precioNoche / personas);
    return this.i18n.translate('habs.precioPersona', { precio: this.formatearPrecio(precioPersona) });
  }

  tipoCama(tipo: string): string {
    switch (tipo?.toLowerCase()) {
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

  tipoBano(tieneBano: boolean): string {
    return this.i18n.translate(tieneBano ? 'habs.banoPrivado' : 'habs.banoCompartido');
  }

  tieneCocinaCompartida(habitacion: Habitacion): boolean {
    return habitacion.servicios?.some((servicio) => /cocina/i.test(servicio));
  }

  /** Descripción en el idioma elegido (por número de habitación); si no hay traducción, la original. */
  descripcionHab(habitacion: Habitacion): string {
    const clave = `cuartos.h${habitacion.numero}`;
    const traducida = this.i18n.translate(clave);
    return traducida === clave ? habitacion.descripcion : traducida;
  }

  /** Nombre de un servicio de la habitación en el idioma elegido; si no hay traducción, el original. */
  servicioHab(servicio: string): string {
    const clave = `servicioHab.${servicio}`;
    const traducido = this.i18n.translate(clave);
    return traducido === clave ? servicio : traducido;
  }

  getResumenDescripcion(descripcion: string): string {
    const texto = descripcion ? descripcion.trim() : '';
    return texto.length > 85 ? texto.slice(0, 82).trimEnd() + '...' : texto;
  }

  obtenerClaseImagen(tipo: string): string {
    return tipo.toLowerCase();
  }

  // ========== NUEVOS MÉTODOS DE FILTRADO AVANZADO ==========

  /**
   * Aplica filtros avanzados
   */
  aplicarFiltrosAvanzados(): void {
    let resultado = [...this.habitaciones];

    // Aplicar filtros básicos primero
    if (this.filtroActivo !== 'Todas') {
      resultado = resultado.filter((h) => h.tipo === this.filtroActivo);
    }

    // Filtro por búsqueda
    if (this.textoBusqueda.trim() !== '') {
      const busqueda = this.textoBusqueda.toLowerCase();
      resultado = resultado.filter(
        (h) =>
          h.tipo.toLowerCase().includes(busqueda) ||
          h.descripcion.toLowerCase().includes(busqueda) ||
          h.numero.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por rango de precio
    resultado = resultado.filter(
      (h) =>
        h.precioNoche >= this.filtros.precioMinimo &&
        h.precioNoche <= this.filtros.precioMaximo
    );

    // Filtro por capacidad
    if (this.filtros.capacidad > 0) {
      resultado = resultado.filter((h) => h.capacidad >= this.filtros.capacidad);
    }

    // Filtro por tipo (desde los filtros avanzados)
    if (this.filtros.tipo) {
      resultado = resultado.filter((h) => h.tipo === this.filtros.tipo);
    }

    // Filtro por servicios (debe incluir al menos uno seleccionado)
    if (this.filtros.servicios.length > 0) {
      resultado = resultado.filter((h) =>
        this.filtros.servicios.some((servicio) =>
          h.servicios.some(
            (s) =>
              s.toLowerCase() === servicio.toLowerCase() ||
              s.includes(servicio)
          )
        )
      );
    }

    // Aplicar ordenamiento
    resultado = this.ordenarHabitaciones(resultado);

    this.habitacionesFiltradas = resultado;
  }

  /**
   * Ordena habitaciones según criterio
   */
  private ordenarHabitaciones(habitaciones: Habitacion[]): Habitacion[] {
    const copia = [...habitaciones];

    switch (this.filtros.ordenar) {
      case 'precio-asc':
        return copia.sort((a, b) => a.precioNoche - b.precioNoche);
      case 'precio-desc':
        return copia.sort((a, b) => b.precioNoche - a.precioNoche);
      case 'capacidad':
        return copia.sort((a, b) => b.capacidad - a.capacidad);
      case 'tipo':
        return copia.sort((a, b) => a.tipo.localeCompare(b.tipo));
      case 'nombre':
      default:
        return copia.sort((a, b) => a.numero.localeCompare(b.numero));
    }
  }

  /**
   * Alterna la visibilidad de los filtros
   */
  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  /**
   * Cambia la vista entre grilla y lista
   */
  cambiarVista(vista: boolean): void {
    this.vistaGrilla = vista;
  }

  /**
   * Limpia todos los filtros
   */
  limpiarFiltros(): void {
    this.filtros = {
      precioMinimo: 0,
      precioMaximo: 300000,
      capacidad: 0,
      tipo: '',
      servicios: [],
      ordenar: 'nombre',
    };
    this.filtroActivo = 'Todas';
    this.textoBusqueda = '';
    this.aplicarFiltrosAvanzados();
  }

  /**
   * Abre el modal de detalle
   */
  abrirDetalle(habitacion: Habitacion): void {
    this.habitacionSeleccionada = habitacion;
    this.imagenActivaIdx = 0;
    this.mostrarDetalle = true;
    if (this.isBrowser) {
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Cierra el modal de detalle
   */
  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.habitacionSeleccionada = null;
    this.imagenActivaIdx = 0;
    if (this.isBrowser) {
      document.body.style.overflow = '';
    }
  }

  /** Si se sale de la página con el detalle abierto, se libera el scroll del sitio. */
  ngOnDestroy(): void {
    if (this.isBrowser) document.body.style.overflow = '';
  }

  prevImagen(): void {
    if (!this.habitacionSeleccionada) return;
    const total = this.habitacionSeleccionada.imagenes.length;
    this.imagenActivaIdx = (this.imagenActivaIdx - 1 + total) % total;
  }

  nextImagen(): void {
    if (!this.habitacionSeleccionada) return;
    const total = this.habitacionSeleccionada.imagenes.length;
    this.imagenActivaIdx = (this.imagenActivaIdx + 1) % total;
  }

  /**
   * Navega a reservas con habitación preseleccionada
   */
  reservarHabitacion(habitacion: Habitacion): void {
    this.router.navigate(['/reservas'], {
      queryParams: {
        habitacionId: habitacion.id,
        fechaEntrada: this.busqueda.fechaEntrada || undefined,
        fechaSalida: this.busqueda.fechaSalida || undefined,
        adultos: this.busqueda.adultos || undefined,
        ninos3: this.busqueda.ninos3 || undefined,
        ninos10: this.busqueda.ninos10 || undefined,
        ninos11: this.busqueda.ninos11 || undefined,
        tipo: this.busqueda.tipoReserva || undefined,
      },
    });
  }

  motivoNoDisponible(habitacion: Habitacion): string {
    return this.motivoNoDisponibilidad.get(habitacion.id) || 'habs.motivoGenerico';
  }

  /**
   * Alterna selección de servicio
   */
  toggleServicio(servicio: string): void {
    const index = this.filtros.servicios.indexOf(servicio);
    if (index === -1) {
      this.filtros.servicios.push(servicio);
    } else {
      this.filtros.servicios.splice(index, 1);
    }
    this.aplicarFiltrosAvanzados();
  }

  /**
   * Verifica si un servicio está seleccionado
   */
  servicioSeleccionado(servicio: string): boolean {
    return this.filtros.servicios.includes(servicio);
  }

  /**
   * Obtiene estrellas de calificación (simulado)
   */
  getEstrellas(tipo: string): string {
    const calificaciones: { [key: string]: number } = {
      Individual: 4.5,
      Doble: 4.6,
      Familiar: 4.4,
      Suite: 4.8,
    };
    const cal = calificaciones[tipo] || 4;
    const llenas = Math.floor(cal);
    const media = cal % 1 >= 0.5 ? 1 : 0;
    const vacias = 5 - llenas - media;

    let estrellas = '★'.repeat(llenas);
    if (media) estrellas += '✦';
    estrellas += '☆'.repeat(vacias);
    return estrellas;
  }
}

