import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../shared/translate.pipe';

interface GaleriaItem {
  id: number;
  titulo: string;
  categoria: string;
  imagen: string;
  descripcion: string;
}

@Component({
  selector: 'app-galeria',
  imports: [RouterLink, CommonModule, TranslatePipe],
  templateUrl: './galeria.html',
  styleUrl: './galeria.css',
})
export class Galeria {
  categoriaSeleccionada: string = 'todas';

  constructor() {
    // Desde "Conocer nuestros espacios" del inicio: llega con la categoría ya elegida.
    const categoria = inject(ActivatedRoute).snapshot.queryParamMap.get('categoria');
    if (categoria && ['habitaciones', 'espacios', 'atracciones'].includes(categoria)) {
      this.categoriaSeleccionada = categoria;
    }
  }
  
  imagenes: GaleriaItem[] = [
    {
      id: 1,
      titulo: 'Casa',
      categoria: 'espacios',
      imagen: 'assets/galeria/fachada.jpg',
      descripcion: 'Espacio común para compartir y descansar'
    },
    {
      id: 2,
      titulo: 'Habitación 101',
      categoria: 'habitaciones',
      imagen: 'assets/habitaciones/piso1/hab101.jpg',
      descripcion: 'Habitación del primer piso'
    },
    {
      id: 3,
      titulo: 'Habitación 102',
      categoria: 'habitaciones',
      imagen: 'assets/habitaciones/piso1/hab102.jpg',
      descripcion: 'Habitación del primer piso'
    },
    {
      id: 4,
      titulo: 'Habitación 103',
      categoria: 'habitaciones',
      imagen: 'assets/habitaciones/piso1/hab103.jpg',
      descripcion: 'Habitación del primer piso'
    },
    {
      id: 5,
      titulo: 'Habitación 201',
      categoria: 'habitaciones',
      imagen: 'assets/habitaciones/piso2/hab201.jpeg',
      descripcion: 'Habitación del segundo piso'
    },
    {
      id: 6,
      titulo: 'Habitación 202',
      categoria: 'habitaciones',
      imagen: 'assets/habitaciones/piso2/hab202.jpeg',
      descripcion: 'Habitación del segundo piso'
    },
    {
      id: 7,
      titulo: 'Habitación 203',
      categoria: 'habitaciones',
      imagen: 'assets/habitaciones/piso2/hab203.jpg',
      descripcion: 'Habitación del segundo piso'
    },
    {
      id: 8,
      titulo: 'Habitación 204',
      categoria: 'habitaciones',
      imagen: 'assets/habitaciones/piso2/hab204.jpg',
      descripcion: 'Habitación del segundo piso'
    },
    {
      id: 9,
      titulo: 'Sala de estar',
      categoria: 'espacios',
      imagen: 'assets/galeria/sala-estar.jpg',
      descripcion: 'Espacio común para compartir y descansar'
    },
    {
      id: 10,
      titulo: 'Mezanine',
      categoria: 'espacios',
      imagen: 'assets/habitaciones/espacios/mezanine.png',
      descripcion: 'Espacio común para compartir y descansar'
    },
    {
      id: 11,
      titulo: 'Atracciones de Filandia',
      categoria: 'atracciones',
      imagen: 'assets/img/servicios/atraccion1.jpg',
      descripcion: 'Lugares para conocer cerca del hospedaje'
    },
    {
      id: 12,
      titulo: 'Calle del Tiempo Detenido',
      categoria: 'atracciones',
      imagen: 'assets/img/servicios/atraccion2.jpg',
      descripcion: 'Arquitectura tradicional y colorida de Filandia'
    },
    {
      id: 13,
      titulo: 'Miradores de Filandia',
      categoria: 'atracciones',
      imagen: 'assets/img/servicios/mirador1.jpg',
      descripcion: 'Paisajes del Quindío a pocos minutos'
    },
    {
      id: 14,
      titulo: 'Experiencia cafetera',
      categoria: 'atracciones',
      imagen: 'assets/img/servicios/cafe1.jpg',
      descripcion: 'Una experiencia propia del Eje Cafetero'
    }
  ];

  get imagenesFiltradas() {
    if (this.categoriaSeleccionada === 'todas') {
      return this.imagenes;
    }
    return this.imagenes.filter(img => img.categoria === this.categoriaSeleccionada);
  }

  filtrarPorCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
  }
}
