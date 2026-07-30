import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { routes } from './app.routes';
import { TranslateService } from './services/translate.service';
import { es, en, fr, pt, ko, zh } from './config/translations';

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

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    TranslateService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTranslations,
      deps: [TranslateService],
      multi: true
    }
  ],
};
