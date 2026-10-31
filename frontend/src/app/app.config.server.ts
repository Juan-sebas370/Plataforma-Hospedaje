import { mergeApplicationConfig, ApplicationConfig, Injectable } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { EMPTY, Observable } from 'rxjs';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

/**
 * Las páginas se prerenderizan al compilar y no deben llamar al API: si el backend
 * está dormido o caído, la compilación falla y el sitio no se puede publicar.
 * Se generan con los datos locales y el navegador trae los reales al abrirlas.
 */
@Injectable()
export class SinApiEnPrerender implements HttpInterceptor {
  intercept(_request: HttpRequest<unknown>, _next: HttpHandler): Observable<HttpEvent<unknown>> {
    return EMPTY;
  }
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: HTTP_INTERCEPTORS, useClass: SinApiEnPrerender, multi: true },
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
