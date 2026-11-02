import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from './services/translate.service';

/** "Habitaciones · Hospedaje Sebastián": cada página con un título propio (WCAG 2.4.2). */
@Injectable({ providedIn: 'root' })
export class TituloPagina extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly i18n = inject(TranslateService);
  /** Clave de traducción del título de la página actual (titulos.*). */
  private clave?: string;

  constructor() {
    super();
    this.i18n.currentLang$.subscribe(() => this.poner());
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.clave = this.buildTitle(snapshot);
    this.poner();
  }

  private poner(): void {
    this.title.setTitle(this.clave
      ? `${this.i18n.translate(this.clave)} · Hospedaje Sebastián`
      : this.i18n.translate('titulos.porDefecto'));
  }
}
