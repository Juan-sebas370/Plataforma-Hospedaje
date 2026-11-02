import { Component, inject } from '@angular/core';
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
  private readonly i18n = inject(TranslateService);
  anioActual = new Date().getFullYear();

  readonly navLinks = [
    { label: 'nav.home',     ruta: '/'            },
    { label: 'nav.rooms',    ruta: '/habitaciones' },
    { label: 'nav.gallery',  ruta: '/galeria'      },
    { label: 'nav.services', ruta: '/servicios'    },
    { label: 'nav.contact',  ruta: '/contacto'     },
  ];

  readonly metodosPago = ['Visa', 'Mastercard', 'Nequi', 'Daviplata', 'Bancolombia'];

  abrirWhatsApp(): void {
  const telefono = '573147556717';
  const mensaje = this.i18n.translate('pie.mensajeWhatsapp');
  
  window.open(
    `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`,
    '_blank'
  );
}

  abrirMaps(): void {
    window.open('https://www.google.com/maps/search/Filandia+Quindio+Colombia', '_blank', 'noopener,noreferrer');
  }
}
