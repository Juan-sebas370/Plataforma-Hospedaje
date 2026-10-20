import { Component, ElementRef, PLATFORM_ID, inject, signal, viewChild } from '@angular/core';
import { ViewportScroller, isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs';
import { Nav } from './components/nav/nav';
import { Footer } from './components/footer/footer';
import { Chatbot } from './components/chatbot/chatbot';
import { AccesibilidadService } from './services/accesibilidad.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Nav, Footer, Chatbot],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly contenido = viewChild.required<ElementRef<HTMLElement>>('contenido');

  /** Texto que los lectores de pantalla anuncian al cambiar de página. */
  readonly anuncio = signal('');

  constructor() {
    // Aplica en <html> las preferencias guardadas del Centro de accesibilidad.
    inject(AccesibilidadService);

    // Al ir a un ancla (p. ej. /servicios#mascotas) se deja espacio para la
    // barra de navegación fija, que si no taparía el título de la sección.
    inject(ViewportScroller).setOffset(() => {
      const barra = this.isBrowser ? document.querySelector('.navbar')?.getBoundingClientRect().height : 0;
      return [0, (barra ?? 0) + 16];
    });

    // En una app de una sola página el lector de pantalla no se entera de que
    // cambió la página: se anuncia el título y el foco pasa al contenido nuevo.
    let primera = true;
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(e => {
      if (!this.isBrowser) return;
      // Red de seguridad: ninguna ventana emergente debe dejar bloqueado el
      // scroll del sitio al cambiar de página.
      document.body.style.overflow = '';
      if (primera) { primera = false; return; }
      const mismaPagina = (e as NavigationEnd).urlAfterRedirects.split('?')[0] === this.ultimaRuta;
      this.ultimaRuta = (e as NavigationEnd).urlAfterRedirects.split('?')[0];
      if (mismaPagina) return;   // solo cambiaron parámetros de la URL
      setTimeout(() => {
        this.anuncio.set(`Página: ${this.title.getTitle()}`);
        this.contenido().nativeElement.focus({ preventScroll: true });
      });
    });
    if (this.isBrowser) this.ultimaRuta = location.pathname;
  }

  private ultimaRuta = '';

  saltarAlContenido(e: Event): void {
    e.preventDefault();
    const main = this.contenido().nativeElement;
    main.focus();
    main.scrollIntoView({ block: 'start' });
  }
}
