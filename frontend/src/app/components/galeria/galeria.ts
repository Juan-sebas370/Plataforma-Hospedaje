import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../shared/translate.pipe';

interface GaleriaItem {
  id: number;
  titulo: string;
  /** Parámetros de la traducción (números de habitación). */
  p?: Record<string, string>;
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
      titulo: 'gal.casa',
      categoria: 'espacios',
      imagen: 'assets/galeria/fachada.jpg',
      descripcion: 'gal.comun'
    },
    {
      id: 2,
      titulo: 'gal.habitacion', p: { n: '101' },
      categoria: 'habitaciones',
      imagen: 'assets/habitaciones/piso1/hab101-v2.jpg',
      descripcion: 'gal.piso1'
    },
    {
      id: 3,
      titulo: 'gal.habitacion', p: { n: '102' },
      categoria: 'habitaciones',
      imagen: 'assets/habitaciones/piso1/hab102-v2.jpg',
      descripcion: 'gal.piso1'
    },
    {
      id: 4,
      titulo: 'gal.habitacion', p: { n: '103' },
      categoria: 'habitaciones',
      imagen: 'assets/habitaciones/piso1/hab103-v2.jpg',
      descripcion: 'gal.piso1'
    },
    {
      id: 5,
      titulo: 'gal.habitacion', p: { n: '201' },
      categoria: 'habitaciones',
      imagen: 'assets/habitaciones/piso2/hab201.jpg',
      descripcion: 'gal.piso2'
    },
    {
      id: 6,
      titulo: 'gal.habitacion', p: { n: '202' },
      categoria: 'habitaciones',
      imagen: 'assets/habitaciones/piso2/hab202.jpg',
      descripcion: 'gal.piso2'
    },
    {
      id: 7,
      titulo: 'gal.habitacion', p: { n: '203' },
      categoria: 'habitaciones',
      imagen: 'assets/habitaciones/piso2/hab203-v2.jpg',
      descripcion: 'gal.piso2'
    },
    {
      id: 8,
      titulo: 'gal.habitacion', p: { n: '204' },
      categoria: 'habitaciones',
      imagen: 'assets/habitaciones/piso2/hab204-v2.jpg',
      descripcion: 'gal.piso2'
    },
    {
      id: 15,
      titulo: 'gal.bano', p: { n: '101' },
      categoria: 'habitaciones',
      imagen: 'assets/habitaciones/piso1/hab101-bano.jpg',
      descripcion: 'gal.banoPrivado'
    },
    {
      id: 16,
      titulo: 'gal.banos', p: { a: '102', b: '103' },
      categoria: 'habitaciones',
      imagen: 'assets/habitaciones/piso1/hab102-103-bano.jpg',
      descripcion: 'gal.banoCompartido'
    },
    {
      id: 17,
      titulo: 'gal.bano', p: { n: '201' },
      categoria: 'habitaciones',
      imagen: 'assets/habitaciones/piso2/hab201-bano.jpg',
      descripcion: 'gal.banoPrivado'
    },
    {
      id: 18,
      titulo: 'gal.banos', p: { a: '202', b: '203' },
      categoria: 'habitaciones',
      imagen: 'assets/habitaciones/piso2/hab202-203-bano.jpg',
      descripcion: 'gal.banoCompartido'
    },
    {
      id: 19,
      titulo: 'gal.bano', p: { n: '204' },
      categoria: 'habitaciones',
      imagen: 'assets/habitaciones/piso2/hab204-bano.jpg',
      descripcion: 'gal.banoPrivado'
    },
    {
      id: 9,
      titulo: 'gal.sala',
      categoria: 'espacios',
      imagen: 'assets/galeria/sala-estar.jpg',
      descripcion: 'gal.comun'
    },
    {
      id: 10,
      titulo: 'gal.mezanine',
      categoria: 'espacios',
      imagen: 'assets/habitaciones/espacios/mezanine.jpg',
      descripcion: 'gal.comun'
    },
    {
      id: 11,
      titulo: 'gal.atracciones',
      categoria: 'atracciones',
      imagen: 'assets/img/servicios/atraccion1.jpg',
      descripcion: 'gal.atraccionesD'
    },
    {
      id: 12,
      titulo: 'gal.calle',
      categoria: 'atracciones',
      imagen: 'assets/img/servicios/atraccion2.jpg',
      descripcion: 'gal.calleD'
    },
    {
      id: 13,
      titulo: 'gal.miradores',
      categoria: 'atracciones',
      imagen: 'assets/img/servicios/mirador1.jpg',
      descripcion: 'gal.miradoresD'
    },
    {
      id: 14,
      titulo: 'gal.cafe',
      categoria: 'atracciones',
      imagen: 'assets/img/servicios/cafe1.jpg',
      descripcion: 'gal.cafeD'
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
