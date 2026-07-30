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

  constructor(
    private habitacionService: HabitacionService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.cargarHabitaciones();
  }

  cargarHabitaciones() {
    this.cargando = true;
    this.error = '';
    
    this.habitacionService.obtenerTodas().subscribe({
      next: (habitaciones) => {
        this.habitaciones = habitaciones;
        this.aplicarFiltros();
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
      {
        id: 1,
        numero: '101',
        tipo: 'Individual',
        capacidad: 1,
        precioNoche: 80000,
        descripcion: 'Perfecta para viajeros solitarios. Cama individual, baño privado y todas las comodidades.',
        servicios: ['WiFi gratis', 'Aire acondicionado', 'Escritorio', 'Caja fuerte'],
        imagenes: [],
        estado: 'DISPONIBLE',
        climatizacion: true,
        television: true,
        wifi: true,
        bano: true,
        minibar: false
      },
      {
        id: 2,
        numero: '201',
        tipo: 'Doble',
        capacidad: 2,
        precioNoche: 120000,
        descripcion: 'Espacio amplio con dos camas o cama king size. Ideal para parejas o amigos.',
        servicios: ['WiFi premium', 'Smart TV', 'Minibar', 'Vista panorámica'],
        imagenes: [],
        estado: 'DISPONIBLE',
        climatizacion: true,
        television: true,
        wifi: true,
        bano: true,
        minibar: true
      },
      {
        id: 3,
        numero: '301',
        tipo: 'Suite',
        capacidad: 2,
        precioNoche: 200000,
        descripcion: 'Suite de lujo con sala de estar, jacuzzi y las mejores vistas del hotel.',
        servicios: ['WiFi de alta velocidad', 'Jacuzzi privado', 'Servicio a la habitación 24/7', 'Terraza privada'],
        imagenes: [],
        estado: 'DISPONIBLE',
        climatizacion: true,
        television: true,
        wifi: true,
        bano: true,
        minibar: true
      },
      {
        id: 4,
        numero: '102',
        tipo: 'Familiar',
        capacidad: 4,
        precioNoche: 180000,
        descripcion: 'Habitación espaciosa perfecta para familias. Dos camas matrimoniales y área de juegos.',
        servicios: ['WiFi gratis', 'TV por cable', 'Área de juegos para niños', 'Sofá cama'],
        imagenes: [],
        estado: 'DISPONIBLE',
        climatizacion: true,
        television: true,
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

    // Filtrar por tipo
    if (this.filtroActivo !== 'Todas') {
      resultado = resultado.filter(h => h.tipo === this.filtroActivo);
    }

    // Filtrar por texto de búsqueda
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
    if (this.isBrowser) {
      document.body.style.overflow = 'auto';
    }
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

