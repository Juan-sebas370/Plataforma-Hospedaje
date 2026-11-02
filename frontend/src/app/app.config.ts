import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER, PLATFORM_ID } from '@angular/core';
import { TitleStrategy, provideRouter, withInMemoryScrolling } from '@angular/router';
import { TituloPagina } from './titulo-pagina';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS, withFetch, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { TranslateService } from './services/translate.service';
import { es } from './config/translations/es';
import { paginas as paginasEs } from './config/translations/paginas/es';
import { isPlatformBrowser } from '@angular/common';

export function initializeTranslations(translateService: TranslateService) {
  return () => {
    // El español va en el paquete inicial; cada otro idioma se descarga solo cuando se elige
    // (diccionario general + textos de las páginas).
    translateService.setTranslations('es', { ...es, ...paginasEs });
    translateService.setLoader('en', () => Promise.all([import('./config/translations/en'), import('./config/translations/paginas/en')]).then(([d, p]) => ({ ...d.en, ...p.paginas })));
    translateService.setLoader('fr', () => Promise.all([import('./config/translations/fr'), import('./config/translations/paginas/fr')]).then(([d, p]) => ({ ...d.fr, ...p.paginas })));
    translateService.setLoader('pt', () => Promise.all([import('./config/translations/pt'), import('./config/translations/paginas/pt')]).then(([d, p]) => ({ ...d.pt, ...p.paginas })));
    translateService.setLoader('ko', () => Promise.all([import('./config/translations/ko'), import('./config/translations/paginas/ko')]).then(([d, p]) => ({ ...d.ko, ...p.paginas })));
    translateService.setLoader('zh', () => Promise.all([import('./config/translations/zh'), import('./config/translations/paginas/zh')]).then(([d, p]) => ({ ...d.zh, ...p.paginas })));
    // Si la persona ya había elegido otro idioma, se espera a tenerlo antes de mostrar la página.
    return translateService.loadCurrent();
  };
}

// Agrega el token de sesión a las peticiones
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
    // Cada página nueva empieza arriba; con "Atrás" se vuelve a donde estaba la persona.
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })),
    { provide: TitleStrategy, useClass: TituloPagina },
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    ),
    provideAuthInterceptor(),
    TranslateService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTranslations,
      deps: [TranslateService],
      multi: true
    }
  ]
};


