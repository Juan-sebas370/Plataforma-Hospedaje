import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/translate.pipe';

export type CategoriaLugar =
  | 'todos'
  | 'restaurantes'
  | 'miradores'
  | 'atracciones'
  | 'cafeteros'
  | 'parqueaderos';

export interface LugarTuristico {
  id: number;
  nombre: string;
  categoria: CategoriaLugar;
  descripcion: string;
  distancia: string;
  calificacion: number;
  mapsUrl: string;
  imagen: string;
}

export interface TipoReserva {
  id: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  horario: string;
  capacidad: string | null;
  precio: string | null;
  incluye: string[] | null;
  disponibilidad: string | null;
  destacado: boolean;
}

@Component({
  selector: 'app-servicios',
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css',
})
export class Servicios {

  /* ── Filtro de lugares ───────────────────────────────────── */
  filtroActivo: CategoriaLugar = 'todos';

  readonly categorias: { id: CategoriaLugar; label: string }[] = [
    { id: 'todos',        label: 'Todos'                },
    { id: 'restaurantes', label: 'Restaurantes'         },
    { id: 'miradores',    label: 'Miradores'             },
    { id: 'atracciones',  label: 'Atracciones'           },
    { id: 'cafeteros',    label: 'Experiencias cafeteras'},
    { id: 'parqueaderos', label: 'Parqueaderos'          },
  ];

  /* ── Tipos de reserva ────────────────────────────────────── */
  readonly tiposReserva: TipoReserva[] = [
    {
      id: 'individual',
      titulo: 'Reserva Individual',
      subtitulo: 'Comodidad para uno o dos viajeros',
      descripcion: 'Disfruta de una estadía cómoda en una de nuestras habitaciones, pensada para que descanses y explores Filandia a tu ritmo.',
      horario: '3:00 p. m. – 12:00 p. m.',
      capacidad: null,
      precio: 'Desde $65.000 por persona',
      incluye: null,
      disponibilidad: null,
      destacado: false,
    },
    {
      id: 'familiar',
      titulo: 'Grupo Familiar',
      subtitulo: 'Una experiencia pensada para familias',
      descripcion: 'Una opción diseñada para familias y pequeños grupos que quieren compartir la experiencia de Filandia juntos.',
      horario: '3:00 p. m. – 12:00 p. m.',
      capacidad: '6 a 8 personas',
      precio: 'Desde $51.000 por persona',
      incluye: null,
      disponibilidad: null,
      destacado: true,
    },
    {
      id: 'pasadia',
      titulo: 'Pasadía',
      subtitulo: 'Ideal para celebraciones y reuniones',
      descripcion: 'Perfecto para cumpleaños, celebraciones familiares o simplemente disfrutar un día completo con familia y amigos.',
      horario: '10:00 a. m. – 8:00 p. m.',
      capacidad: '10 a 15 personas',
      precio: null,
      incluye: [
        'Sala comedor',
        'Una habitación',
        'Baño social',
        'Acceso al mezanine',
        'Juegos de mesa',
        'Mesa de ping pong',
      ],
      disponibilidad: 'Disponible en temporada baja',
      destacado: false,
    },
    {
      id: 'reuniones',
      titulo: 'Reuniones de Grupo',
      subtitulo: 'Espacio para equipos de trabajo',
      descripcion: 'Un ambiente tranquilo y bien equipado para reuniones empresariales, laborales o de equipo.',
      horario: '8:00 a. m. – 6:00 p. m.',
      capacidad: null,
      precio: null,
      incluye: null,
      disponibilidad: 'Disponible en temporada media y baja',
      destacado: false,
    },
  ];

  /* ── Lugares turísticos ──────────────────────────────────── */
  readonly lugares: LugarTuristico[] = [
    // Restaurantes
    {
      id: 1,
      nombre: 'Restaurante José Fernando',
      categoria: 'restaurantes',
      descripcion: 'Cocina colombiana y postres, ubicado en una casa tradicional del centro de Filandia.',
      distancia: '3 min caminando',
      calificacion: 4.5,
      mapsUrl: 'https://www.google.com/maps/search/Restaurante+José+Fernando+Filandia',
      imagen: 'assets/img/servicios/restaurante1.jpg',
    },
    {
      id: 2,
      nombre: 'Helena Adentro',
      categoria: 'restaurantes',
      descripcion: 'Cocina contemporánea y latinoamericana, con una experiencia enfocada en vistas y ambiente.',
      distancia: '5 min caminando',
      calificacion: 4.6,
      mapsUrl: 'https://www.google.com/maps/search/Helena+Adentro+Filandia',
      imagen: 'assets/img/servicios/restaurante2.jpg',
    },
    {
      id: 3,
      nombre: 'La Azotea Filandia',
      categoria: 'restaurantes',
      descripcion: 'Restaurante con terraza, vistas panorámicas y gastronomía regional.',
      distancia: '8 min caminando',
      calificacion: 4.4,
      mapsUrl: 'https://www.google.com/maps/search/La+Azotea+Restaurante+Filandia',
      imagen: 'assets/img/servicios/restaurante3.jpg',
    },
    {
      id: 4,
      nombre: 'Bakuru Restaurante Pacífico',
      categoria: 'restaurantes',
      descripcion: 'Cocina del Pacífico colombiano, sabores únicos en el corazón del Quindío.',
      distancia: '6 min caminando',
      calificacion: 4.3,
      mapsUrl: 'https://www.google.com/maps/search/Bakuru+Restaurante+Filandia',
      imagen: 'assets/img/servicios/restaurante4.jpg',
    },
    {
      id: 5,
      nombre: 'La Mesa de Mamá',
      categoria: 'restaurantes',
      descripcion: 'Comida casera colombiana en el centro. Sabores auténticos y ambiente familiar.',
      distancia: '4 min caminando',
      calificacion: 4.2,
      mapsUrl: 'https://www.google.com/maps/search/La+Mesa+de+Mama+Filandia',
      imagen: 'assets/img/servicios/restaurante5.jpg',
    },
    // Miradores
    {
      id: 6,
      nombre: 'Colina Iluminada del Quindío',
      categoria: 'miradores',
      descripcion: 'El mirador más emblemático. Estructura de 27 m con vista panorámica de 360° al Quindío, Risaralda y Valle del Cauca.',
      distancia: '10 min caminando',
      calificacion: 4.6,
      mapsUrl: 'https://www.google.com/maps/search/Mirador+Colina+Iluminada+Filandia',
      imagen: 'assets/img/servicios/mirador1.jpg',
    },
    {
      id: 7,
      nombre: 'Mirador Encanto Filandia',
      categoria: 'miradores',
      descripcion: 'Vista privilegiada del municipio y sus alrededores. Ideal para fotografía y contemplación.',
      distancia: '12 min caminando',
      calificacion: 4.4,
      mapsUrl: 'https://www.google.com/maps/search/Mirador+Encanto+Filandia',
      imagen: 'assets/img/servicios/mirador2.jpg',
    },
    {
      id: 8,
      nombre: 'Mirador del Tiempo Detenido',
      categoria: 'miradores',
      descripcion: 'Combina arquitectura tradicional de Filandia con una vista memorable del municipio.',
      distancia: '8 min caminando',
      calificacion: 4.7,
      mapsUrl: 'https://www.google.com/maps/search/Mirador+Tiempo+Detenido+Filandia',
      imagen: 'assets/img/servicios/mirador3.jpg',
    },
    {
      id: 9,
      nombre: 'Mirador Don Quijote',
      categoria: 'miradores',
      descripcion: 'Panorámica del municipio en un entorno tranquilo. Uno de los miradores alternativos más visitados.',
      distancia: '15 min caminando',
      calificacion: 4.3,
      mapsUrl: 'https://www.google.com/maps/search/Mirador+Don+Quijote+Filandia',
      imagen: 'assets/img/servicios/mirador4.jpg',
    },
    // Atracciones
    {
      id: 10,
      nombre: 'Parque Principal (Parque Bolívar)',
      categoria: 'atracciones',
      descripcion: 'Corazón de Filandia, rodeado de arquitectura tradicional, restaurantes, cafés y comercio local.',
      distancia: '2 min caminando',
      calificacion: 4.7,
      mapsUrl: 'https://www.google.com/maps/search/Parque+Principal+Filandia+Quindio',
      imagen: 'assets/img/servicios/atraccion1.jpg',
    },
    {
      id: 11,
      nombre: 'Calle del Tiempo Detenido',
      categoria: 'atracciones',
      descripcion: 'Calle emblemática con casas de arquitectura tradicional, balcones coloridos y arte local.',
      distancia: '5 min caminando',
      calificacion: 4.6,
      mapsUrl: 'https://www.google.com/maps/search/Calle+del+Tiempo+Detenido+Filandia',
      imagen: 'assets/img/servicios/atraccion2.jpg',
    },
    {
      id: 12,
      nombre: 'Centro de Interpretación Bejuco al Canasto',
      categoria: 'atracciones',
      descripcion: 'Experiencia artesanal única. Aprende sobre la tradición del trabajo con bejuco y fibras naturales.',
      distancia: '7 min caminando',
      calificacion: 4.7,
      mapsUrl: 'https://www.google.com/maps/search/Centro+Bejuco+Canasto+Filandia',
      imagen: 'assets/img/servicios/atraccion3.jpg',
    },
    {
      id: 13,
      nombre: 'Parroquia María Inmaculada',
      categoria: 'atracciones',
      descripcion: 'Iglesia tradicional ubicada junto al parque principal, construida con técnicas y materiales de la región.',
      distancia: '2 min caminando',
      calificacion: 4.5,
      mapsUrl: 'https://www.google.com/maps/search/Parroquia+Maria+Inmaculada+Filandia',
      imagen: 'assets/img/servicios/atraccion4.jpg',
    },
    {
      id: 14,
      nombre: 'Reserva Barbas Bremen',
      categoria: 'atracciones',
      descripcion: 'Reserva natural con caminatas, observación de fauna y paisajes del Eje Cafetero.',
      distancia: '20 min en carro',
      calificacion: 4.2,
      mapsUrl: 'https://www.google.com/maps/search/Reserva+Barbas+Bremen+Filandia',
      imagen: 'assets/img/servicios/atraccion5.jpg',
    },
    // Experiencias cafeteras
    {
      id: 15,
      nombre: 'Recua Café Tour',
      categoria: 'cafeteros',
      descripcion: 'Experiencia cafetera completa: conoce el proceso del café desde la planta hasta la taza en fincas del Quindío.',
      distancia: '15 min en carro',
      calificacion: 4.8,
      mapsUrl: 'https://www.google.com/maps/search/Recua+Cafe+Tour+Filandia',
      imagen: 'assets/img/servicios/cafe1.jpg',
    },
    // Parqueaderos
    {
      id: 16,
      nombre: 'Parqueadero Central Parking',
      categoria: 'parqueaderos',
      descripcion: 'Estacionamiento central, seguro y vigilado, a pocas cuadras del hospedaje.',
      distancia: '5 min caminando',
      calificacion: 4.0,
      mapsUrl: 'https://www.google.com/maps/search/Parqueadero+Central+Filandia',
      imagen: 'assets/img/servicios/parking1.jpg',
    },
    {
      id: 17,
      nombre: 'Parqueadero Los Yarumos',
      categoria: 'parqueaderos',
      descripcion: 'Alternativa de parqueo cercana al centro del municipio.',
      distancia: '8 min caminando',
      calificacion: 3.9,
      mapsUrl: 'https://www.google.com/maps/search/Parqueadero+Los+Yarumos+Filandia',
      imagen: 'assets/img/servicios/parking2.jpg',
    },
    {
      id: 18,
      nombre: 'Simmetria Detailing (Auto Spa - Parqueadero)',
      categoria: 'parqueaderos',
      descripcion: 'Auto spa y parqueadero ubicado en el centro de Filandia. Cl. 6 #2-22, Filandia, Quindío.',
      distancia: '5 min caminando',
      calificacion: 4.5,
      mapsUrl: 'https://www.google.com/maps/place/SIMMETRIA+DETAILING+(+AUTO+SPA-PARQUEADERO)/@4.6729211,-75.6583805,379m/data=!3m1!1e3!4m14!1m7!3m6!1s0x8e388971858ec31f:0x55b839617517cd53!2sParqueadero!8m2!3d4.67599!4d-75.6579299!16s%2Fg%2F1v_z5c93!3m5!1s0x8e388975479d15f7:0x1e3813c888e1826!8m2!3d4.6724102!4d-75.6570811!16s%2Fg%2F11m71cc8jv?entry=ttu&g_ep=EgoyMDI2MDgxOS4wIKXMDSoASAFQAw%3D%3D',
      imagen: 'assets/img/servicios/parking3.jpg',
    },
  ];

  /* ── Helpers ─────────────────────────────────────────────── */
  get lugaresFiltrados(): LugarTuristico[] {
    if (this.filtroActivo === 'todos') return this.lugares;
    return this.lugares.filter(l => l.categoria === this.filtroActivo);
  }

  setFiltro(cat: CategoriaLugar): void {
    this.filtroActivo = cat;
  }

  getEstrellas(cal: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(cal));
  }

  abrirMaps(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  abrirFilandiaEnMaps(): void {
    window.open('https://www.google.com/maps/search/Filandia+Quindio+Colombia', '_blank', 'noopener,noreferrer');
  }
}
