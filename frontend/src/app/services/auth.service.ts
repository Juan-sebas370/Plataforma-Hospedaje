import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    nombre: string;
  };
}

interface PasswordResetRequest {
  email: string;
}

interface ResetTokenResponse {
  valid: boolean;
  message: string;
  email: string;
}

interface PasswordResetTokenValidation {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenKey = 'auth_token';
  private userKey = 'user_data';
  private platformId = inject(PLATFORM_ID);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Inicia sesión con email/usuario y contraseña
   */
  login(email: string, password: string): Observable<LoginResponse> {
    const request: LoginRequest = { email, password };
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => {
        this.setToken(response.token);
        this.setUser(response.user);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  /**
   * Cierra la sesión actual
   */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Obtiene el token de autenticación
   */
  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Guarda el token
   */
  private setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  /**
   * Verifica si existe token válido
   */
  private hasToken(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return !!localStorage.getItem(this.tokenKey);
  }

  /**
   * Obtiene los datos del usuario actual
   */
  getUser(): any {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Guarda los datos del usuario
   */
  private setUser(user: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  /**
   * Registra un nuevo usuario
   */
  register(userData: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((response) => {
        this.setToken(response.token);
        this.setUser(response.user);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  requestPasswordReset(email: string): Observable<any> {
    const request: PasswordResetRequest = { email };
    return this.http.post(`${this.apiUrl}/forgot-password`, request);
  }

  validateResetToken(token: string): Observable<ResetTokenResponse> {
    return this.http.get<ResetTokenResponse>(
      `${this.apiUrl}/validate-reset-token/${token}`
    );
  }

  resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Observable<any> {
    const request: PasswordResetTokenValidation = {
      token,
      newPassword,
      confirmPassword,
    };
    return this.http.post(`${this.apiUrl}/reset-password`, request);
  }
}
