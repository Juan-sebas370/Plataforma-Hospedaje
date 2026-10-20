import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

/**
 * Interceptor HTTP que agrega automáticamente el token JWT
 * a todas las peticiones y maneja errores de autenticación
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Obtener el token
    const token = this.authService.getToken();

    // Si hay un token, agregarlo al header de la petición
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si es error 401 (no autorizado), limpiar sesión y redirigir a login
        const isAuthEndpoint = request.url.includes('/auth/');
        if (error.status === 401 && !isAuthEndpoint) {
          console.warn('Token inválido o expirado - cerrando sesión');
          this.authService.logout();
          this.router.navigate(['/login']);
        }

        // Si es error 403 (prohibido), el usuario no tiene permisos
        if (error.status === 403) {
          console.error('Acceso denegado - permisos insuficientes');
          this.router.navigate(['/']);
        }

        return throwError(() => error);
      })
    );
  }
}
