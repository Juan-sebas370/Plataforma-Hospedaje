import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  
  imagenes: GaleriaItem[] = [
    {
      id: 1,
      titulo: 'Suite Ejecutiva',
      categoria: 'habitaciones',
      imagen: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
      descripcion: 'Nuestra suite más lujosa con vista panorámica'
    },
    {
      id: 2,
      titulo: 'Habitación Doble',
      categoria: 'habitaciones',
      imagen: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      descripcion: 'Espaciosa habitación con dos camas'
    },
    {
      id: 3,
      titulo: 'Habitación Individual',
      categoria: 'habitaciones',
      imagen: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800',
      descripcion: 'Perfecta para viajeros de negocio'
    },
    {
      id: 4,
      titulo: 'Recepción',
      categoria: 'instalaciones',
      imagen: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
      descripcion: 'Atención 24/7 para nuestros huéspedes'
    },
    {
      id: 5,
      titulo: 'Restaurant',
      categoria: 'servicios',
      imagen: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      descripcion: 'Gastronomía local e internacional'
    },
    {
      id: 6,
      titulo: 'Piscina',
      categoria: 'instalaciones',
      imagen: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800',
      descripcion: 'Área de piscina climatizada'
    },
    {
      id: 7,
      titulo: 'Zona de Desayuno',
      categoria: 'servicios',
      imagen: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=800',
      descripcion: 'Buffet de desayuno continental'
    },
    {
      id: 8,
      titulo: 'Gimnasio',
      categoria: 'instalaciones',
      imagen: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
      descripcion: 'Equipo de ejercicio moderno'
    },
    {
      id: 9,
      titulo: 'Sala de Conferencias',
      categoria: 'servicios',
      imagen: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      descripcion: 'Espacios para eventos y reuniones'
    },
    {
      id: 10,
      titulo: 'Baño de Lujo',
      categoria: 'habitaciones',
      imagen: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800',
      descripcion: 'Baños equipados con amenities premium'
    },
    {
      id: 11,
      titulo: 'Vista Nocturna',
      categoria: 'instalaciones',
      imagen: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      descripcion: 'Vista del hotel iluminado por la noche'
    },
    {
      id: 12,
      titulo: 'Lobby',
      categoria: 'instalaciones',
      imagen: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      descripcion: 'Espacios comunes elegantes'
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
