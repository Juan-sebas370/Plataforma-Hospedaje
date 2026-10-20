import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

/** "Habitaciones · Hospedaje Sebastián": cada página con un título propio (WCAG 2.4.2). */
@Injectable({ providedIn: 'root' })
export class TituloPagina extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const titulo = this.buildTitle(snapshot);
    this.title.setTitle(titulo ? `${titulo} · Hospedaje Sebastián` : 'Hospedaje Sebastián · Filandia, Quindío');
  }
}
