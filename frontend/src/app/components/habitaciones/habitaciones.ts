import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HabitacionService, Habitacion } from '../../services/habitacion.service';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-habitaciones',
  imports: [RouterLink, CommonModule, FormsModule, TranslatePipe],
  templateUrl: './habitaciones.html',
  styleUrl: './habitaciones.css',
})
export class Habitaciones implements OnInit {
  habitaciones: Habitacion[] = [];
  habitacionesFiltradas: Habitacion[] = [];
  filtroActivo: string = 'Todas';
  textoBusqueda: string = '';
  cargando: boolean = false;
  error: string = '';
  private isBrowser = false;

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
      titulo: 'PISO 1',
      descripcion:
        'En el piso 1 se encuentran 3 habitaciones: 101, 102 y 103. Tiene capacidad para 8 personas, 3 camas dobles y 1 camarote.',
      habitaciones: 3,
      capacidad: 8,
      camasDobles: 3,
      camarotes: 1,
      detalles: [
        {
          nombre: 'Habitación 101',
          descripcion:
            'Cama doble, camarote, baño privado, capacidad para 4 personas.',
        },
        {
          nombre: 'Habitación 102',
          descripcion: 'Cama doble para 2 personas. Comparte baño con la habitación 103.',
        },
        {
          nombre: 'Habitación 103',
          descripcion: 'Cama doble para 2 personas. Comparte baño con la habitación 102.',
        },
      ],
    },
    {
      piso: 2,
      titulo: 'PISO 2',
      descripcion:
        'En el piso 2 se encuentran 3 habitaciones: 201, 202 y 203. Tiene capacidad para 8 personas, 2 camas dobles y 2 camarotes.',
      habitaciones: 3,
      capacidad: 8,
      camasDobles: 2,
      camarotes: 2,
      detalles: [
        {
          nombre: 'Habitación 201',
          descripcion:
            'Cama doble, camarote, baño privado, capacidad para 4 personas.',
        },
        {
          nombre: 'Habitación 202',
          descripcion: 'Cama doble para 2 personas. Comparte baño con la habitación 203.',
        },
        {
          nombre: 'Habitación 203',
          descripcion: 'Cama doble para 2 personas. Comparte baño con la habitación 202.',
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

  constructor(
    private habitacionService: HabitacionService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.limpiarFiltros();
    this.usarDatosEjemplo();
    this.cargarHabitaciones();
  }

  cargarHabitaciones() {
    this.cargando = this.habitacionesFiltradas.length === 0;
    this.error = '';
    
    this.habitacionService.obtenerTodas().subscribe({
      next: (habitaciones) => {
        const datos = Array.isArray(habitaciones) ? habitaciones : [];

        if (datos.length >= 6) {
          this.habitaciones = datos;
          this.aplicarFiltros();
        } else {
          this.usarDatosEjemplo();
        }

        this.cargando = false;
      },
      error: (err) => {
        this.error = 'No se pudieron cargar las habitaciones. Intenta nuevamente.';
        this.cargando = false;
        // Usar datos de ejemplo si falla
        this.usarDatosEjemplo();
      }
    });
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
        imagenes: ['assets/habitaciones/piso1/hab101.jpg'],
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
        imagenes: ['assets/habitaciones/piso1/hab102.jpg'],
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
        imagenes: ['assets/habitaciones/piso1/hab103.jpg'],
        estado: 'DISPONIBLE',
        climatizacion: false,
        television: false,
        wifi: true,
        bano: false,
        minibar: false
      },
      // PISO 2 (ABAJO) - 3 Habitaciones
      {
        id: 5,
        numero: '201',
        tipo: 'Individual',
        piso: 2,
        capacidad: 4,
        precioNoche: 80000,
        descripcion: 'Habitación con cama doble y camarote. Baño privado, ideal para 4 personas en un ambiente acogedor y tranquilo.',
        servicios: ['WiFi gratis', 'Agua caliente', 'Cocina equipada', 'Lavandería'],
        imagenes: [
          'assets/habitaciones/piso2/hab201.jpeg',
          'assets/habitaciones/piso2/hab201-2.jpeg',
          'assets/habitaciones/piso2/hab201-3.jpeg',
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
          'assets/habitaciones/piso2/hab202.jpeg',
          'assets/habitaciones/piso2/hab202-2.jpeg',
          'assets/habitaciones/piso2/hab202-3.jpeg',
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
          'assets/habitaciones/piso2/hab203.jpg',
        ],
        estado: 'DISPONIBLE',
        climatizacion: false,
        television: false,
        wifi: true,
        bano: false,
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

    this.habitacionesFiltradas = resultado;
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
    return `Desde ${this.formatearPrecio(precioPersona)} por persona`;
  }

  tipoCama(tipo: string): string {
    switch (tipo?.toLowerCase()) {
      case 'individual':
        return 'Cama individual';
      case 'doble':
        return 'Cama doble';
      case 'suite':
        return 'Cama king size';
      case 'familiar':
        return 'Cama doble + sofá cama';
      default:
        return 'Cama estándar';
    }
  }

  tipoBano(tieneBano: boolean): string {
    return tieneBano ? 'Baño privado' : 'Baño compartido';
  }

  tieneCocinaCompartida(habitacion: Habitacion): boolean {
    return habitacion.servicios?.some((servicio) => /cocina/i.test(servicio));
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
      document.body.style.overflow = 'auto';
    }
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
      queryParams: { habitacionId: habitacion.id },
    });
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

