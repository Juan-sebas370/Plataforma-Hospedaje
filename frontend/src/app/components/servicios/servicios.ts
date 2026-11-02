import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/translate.pipe';
import { TranslateService } from '../../services/translate.service';
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
  imports: [CommonModule, RouterLink, TranslatePipe],
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
      titulo: 'serv.individual.titulo',
      subtitulo: 'serv.individual.sub',
      descripcion: 'serv.individual.desc',
      horario: '3:00 p. m. – 12:00 p. m.',
      capacidad: null,
      precio: 'serv.individual.precio',
      incluye: null,
      disponibilidad: null,
      destacado: false,
    },
    {
      id: 'familiar',
      titulo: 'serv.familiar.titulo',
      subtitulo: 'serv.familiar.sub',
      descripcion: 'serv.familiar.desc',
      horario: '3:00 p. m. – 12:00 p. m.',
      capacidad: 'serv.familiar.capacidad',
      precio: 'serv.familiar.precio',
      incluye: null,
      disponibilidad: null,
      destacado: true,
    },
    {
      id: 'pasadia',
      titulo: 'serv.pasadia.titulo',
      subtitulo: 'serv.pasadia.sub',
      descripcion: 'serv.pasadia.desc',
      horario: '10:00 a. m. – 8:00 p. m.',
      capacidad: 'serv.pasadia.capacidad',
      precio: null,
      incluye: [
        'serv.incluye.comedor',
        'serv.incluye.habitacion',
        'serv.incluye.bano',
        'serv.incluye.mezanine',
        'serv.incluye.juegos',
        'serv.incluye.pingpong',
      ],
      disponibilidad: 'serv.pasadia.disponibilidad',
      destacado: false,
    },
    {
      id: 'reuniones',
      titulo: 'serv.reuniones.titulo',
      subtitulo: 'serv.reuniones.sub',
      descripcion: 'serv.reuniones.desc',
      horario: '8:00 a. m. – 6:00 p. m.',
      capacidad: null,
      precio: null,
      incluye: null,
      disponibilidad: 'serv.reuniones.disponibilidad',
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

  private readonly i18n = inject(TranslateService);

  /** Descripción del lugar en el idioma elegido; en español (o sin traducción), la original. */
  descripcionLugar(lugar: LugarTuristico): string {
    const clave = `lugar.d${lugar.id}`;
    const traducida = this.i18n.translate(clave);
    return traducida === clave ? lugar.descripcion : traducida;
  }

  /** "5 min caminando" / "20 min en carro" en el idioma elegido. */
  distanciaLugar(lugar: LugarTuristico): string {
    const m = lugar.distancia.match(/^(\d+) min (caminando|en carro)$/);
    if (!m) return lugar.distancia;
    return this.i18n.translate(m[2] === 'caminando' ? 'serv.caminando' : 'serv.carro', { n: m[1] });
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
