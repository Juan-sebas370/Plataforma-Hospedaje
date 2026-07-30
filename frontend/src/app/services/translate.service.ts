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
    }
  }

  private isValidLanguage(lang: string): lang is Language {
    return ['es', 'en', 'fr', 'pt', 'ko', 'zh'].includes(lang);
  }

  setTranslations(lang: Language, translations: Translation): void {
    this.translations[lang] = translations;
  }

  setLanguage(lang: Language): void {
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

  translate(key: string): string {
    const lang = this.currentLang();
    const translation = this.translations[lang];
    
    if (!translation) {
      return key;
    }

    // Navegar por la ruta de keys (ej: "nav.home")
    const keys = key.split('.');
    let value: any = translation;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Si no encuentra la traducción, devuelve la key
      }
    }
    
    return typeof value === 'string' ? value : key;
  }

  // Método abreviado para usar en templates
  t(key: string): string {
    return this.translate(key);
  }
}
