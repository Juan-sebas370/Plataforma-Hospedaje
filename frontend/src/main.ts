import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';
import { mergeApplicationConfig } from '@angular/core';

// Configuración específica del navegador (incluye interceptor HTTP)
const browserConfig = {
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};

// Combinar configuración base con la del navegador
const config = mergeApplicationConfig(appConfig, browserConfig);

bootstrapApplication(App, config)
  .catch((err) => console.error(err));
