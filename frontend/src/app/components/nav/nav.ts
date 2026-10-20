import { Component, HostListener, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LanguageSelector } from '../language-selector/language-selector';
import { TranslatePipe } from '../../shared/translate.pipe';
import { CentroAccesibilidad } from '../accesibilidad/centro-accesibilidad';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive, CommonModule, LanguageSelector, TranslatePipe, CentroAccesibilidad],
  templateUrl: './nav.html',
  styleUrls: ['./nav.css'],
})
export class Nav {
  menuOpen = false;

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly router = inject(Router);

  /** En el inicio, arriba del todo, la barra es transparente sobre la foto; al bajar vuelve a ser azul. */
  private readonly enInicio = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => ['/', '/inicio'].includes((e as NavigationEnd).urlAfterRedirects.split(/[?#]/)[0])),
    ),
    { initialValue: this.isBrowser ? ['/', '/inicio'].includes(location.pathname) : true },
  );
  private readonly bajoElInicio = signal(this.isBrowser && window.scrollY > 40);
  readonly transparente = computed(() => this.enInicio() && !this.bajoElInicio());

  @HostListener('window:scroll')
  alHacerScroll() {
    const abajo = window.scrollY > 40;
    if (abajo !== this.bajoElInicio()) this.bajoElInicio.set(abajo);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  @HostListener('document:keydown.escape')
  cerrarConEscape() {
    this.menuOpen = false;
  }
}
