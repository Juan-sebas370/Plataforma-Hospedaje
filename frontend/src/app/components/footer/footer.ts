import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateService } from '../../services/translate.service';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
})
export class Footer {
  anioActual = new Date().getFullYear();

  readonly navLinks = [
    { label: 'Inicio',        ruta: '/'            },
    { label: 'Habitaciones',  ruta: '/habitaciones' },
    { label: 'Galería',       ruta: '/galeria'      },
    { label: 'Servicios',     ruta: '/servicios'    },
    { label: 'Contacto',      ruta: '/contacto'     },
  ];

  readonly metodosPago = ['Visa', 'Mastercard', 'Nequi', 'Daviplata', 'Bancolombia'];

  abrirWhatsApp(): void {
  const telefono = '573147556717';
  const mensaje = 'Hola, estoy interesado en realizar una reserva en Hospedaje Sebastián Filandia.';
  
  window.open(
    `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`,
    '_blank'
  );
}

  abrirMaps(): void {
    window.open('https://www.google.com/maps/search/Filandia+Quindio+Colombia', '_blank', 'noopener,noreferrer');
  }
}
