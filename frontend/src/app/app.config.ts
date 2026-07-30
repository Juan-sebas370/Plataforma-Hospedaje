import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER, PLATFORM_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS, withFetch, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { TranslateService } from './services/translate.service';
import { es, en, fr, pt, ko, zh } from './config/translations';
import { isPlatformBrowser } from '@angular/common';

export function initializeTranslations(translateService: TranslateService) {
  return () => {
    // Cargar todas las traducciones
    translateService.setTranslations('es', es);
    translateService.setTranslations('en', en);
    translateService.setTranslations('fr', fr);
    translateService.setTranslations('pt', pt);
    translateService.setTranslations('ko', ko);
    translateService.setTranslations('zh', zh);
  };
}

// Proveedor condicional del interceptor (solo en navegador)
export function provideAuthInterceptor() {
  return {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    ),
    TranslateService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTranslations,
      deps: [TranslateService],
      multi: true
    }
  ]
};


