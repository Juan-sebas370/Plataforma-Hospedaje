import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export type Language = 'es' | 'en' | 'fr' | 'pt' | 'ko' | 'zh';

export interface Translation {
  [key: string]: string | Translation;
}

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  private currentLang = signal<Language>('es');
  private translations: { [key: string]: Translation } = {};
  /** Descarga del diccionario de cada idioma que no viene en el paquete inicial. */
  private loaders: Partial<Record<Language, () => Promise<Translation>>> = {};
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;
  
  currentLang$ = new BehaviorSubject<Language>('es');

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Cargar idioma guardado o usar español por defecto (solo en el navegador)
    if (this.isBrowser) {
      const savedLang = localStorage.getItem('selectedLanguage') as Language;
      if (savedLang && this.isValidLanguage(savedLang)) {
        this.currentLang.set(savedLang);
        this.currentLang$.next(savedLang);
      }
      document.documentElement.lang = this.currentLang();
    }
  }

  private isValidLanguage(lang: string): lang is Language {
    return ['es', 'en', 'fr', 'pt', 'ko', 'zh'].includes(lang);
  }

  setTranslations(lang: Language, translations: Translation): void {
    this.translations[lang] = translations;
  }

  setLoader(lang: Language, loader: () => Promise<Translation>): void {
    this.loaders[lang] = loader;
  }

  /** Descarga el idioma guardado si aún no está (se llama al arrancar). */
  async loadCurrent(): Promise<void> {
    await this.load(this.currentLang());
    this.currentLang$.next(this.currentLang());
  }

  private async load(lang: Language): Promise<void> {
    const loader = this.loaders[lang];
    if (this.translations[lang] || !loader) return;
    try {
      this.translations[lang] = await loader();
    } catch {
      // Sin conexión: se sigue mostrando en español (translate() cae al español)
    }
  }

  /** Cambia de idioma cuando su diccionario ya está descargado. */
  async setLanguage(lang: Language): Promise<void> {
    await this.load(lang);
    this.currentLang.set(lang);
    this.currentLang$.next(lang);
    
    // Solo usar localStorage en el navegador
    if (this.isBrowser) {
      localStorage.setItem('selectedLanguage', lang);
      // Actualizar el atributo lang del documento
      document.documentElement.lang = lang;
    }
  }

  getCurrentLanguage(): Language {
    return this.currentLang();
  }

  /** Traduce una clave. Los parámetros reemplazan {nombre} en el texto: translate('x', { n: 2 }). */
  translate(key: string, params?: Record<string, string | number>): string {
    const lang = this.currentLang();
    const value = this.findTranslation(this.translations[lang], key)
      ?? this.findTranslation(this.translations['es'], key)
      ?? key;

    return params ? value.replace(/\{(\w+)\}/g, (m, p) => (p in params ? String(params[p]) : m)) : value;
  }

  private findTranslation(translation: Translation | undefined, key: string): string | undefined {
    if (!translation) {
      return undefined;
    }

    let value: string | Translation = translation;
    for (const part of key.split('.')) {
      if (!value || typeof value !== 'object' || !(part in value)) {
        return undefined;
      }
      value = value[part];
    }

    return typeof value === 'string' ? value : undefined;
  }

  // Método abreviado para usar en templates
  t(key: string): string {
    return this.translate(key);
  }
}
