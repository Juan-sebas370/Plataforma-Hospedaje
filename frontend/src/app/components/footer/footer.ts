import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateService } from '../../services/translate.service';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink, TranslatePipe],
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
    window.open('https://wa.me/573001234567?text=Hola%2C%20quiero%20m%C3%A1s%20informaci%C3%B3n%20sobre%20el%20hospedaje.', '_blank', 'noopener,noreferrer');
  }

  abrirMaps(): void {
    window.open('https://www.google.com/maps/search/Filandia+Quindio+Colombia', '_blank', 'noopener,noreferrer');
  }
}
