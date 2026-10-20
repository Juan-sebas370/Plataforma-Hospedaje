import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CATEGORIAS_LUGAR, CategoriaLugar, LUGARES_TURISTICOS, LugarTuristico } from '../../data/guia-turistica';

export type { CategoriaLugar, LugarTuristico };

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
  imports: [CommonModule, RouterLink],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css',
})
export class Servicios {

  /* ── Filtro de lugares ───────────────────────────────────── */
  filtroActivo: CategoriaLugar = 'todos';

  readonly categorias = CATEGORIAS_LUGAR;

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
  readonly lugares = LUGARES_TURISTICOS;

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
