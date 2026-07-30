import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  ciudad: string;
  pais: string;
  fechaNacimiento?: string;
  direccion?: string;
  bio?: string;
  foto?: string;
  createdAt?: string;
  totalReservas?: number;
  puntosAcumulados?: number;
  totalGastado?: number;
  resenas?: number;
}

export interface ActualizarPerfilRequest {
  nombre: string;
  telefono: string;
  ciudad: string;
  pais: string;
  fechaNacimiento?: string;
  direccion?: string;
  bio?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:3000/api/usuarios';
  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  public usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarUsuarioLocal();
  }

  /**
   * Carga el usuario desde localStorage
   */
  private cargarUsuarioLocal(): void {
    const usuarioLocal = localStorage.getItem('usuario');
    if (usuarioLocal) {
      this.usuarioSubject.next(JSON.parse(usuarioLocal));
    }
  }

  /**
   * Obtiene el usuario actual
   */
  getUsuarioActual(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/me`).pipe(
      tap((usuario) => {
        this.usuarioSubject.next(usuario);
        localStorage.setItem('usuario', JSON.stringify(usuario));
      }),
      catchError((error) => {
        console.error('Error al obtener usuario:', error);
        return of(this.usuarioSubject.value || ({} as Usuario));
      })
    );
  }

  /**
   * Actualiza el perfil del usuario
   */
  actualizarPerfil(datos: ActualizarPerfilRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/perfil`, datos).pipe(
      tap((usuario) => {
        this.usuarioSubject.next(usuario);
        localStorage.setItem('usuario', JSON.stringify(usuario));
      }),
      catchError((error) => {
        console.error('Error al actualizar perfil:', error);
        throw error;
      })
    );
  }

  /**
   * Sube la foto de perfil
   */
  subirFotoPerfil(archivo: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('foto', archivo);

    return this.http.post<{ url: string }>(`${this.apiUrl}/foto`, formData).pipe(
      tap((response) => {
        const usuario = this.usuarioSubject.value;
        if (usuario) {
          usuario.foto = response.url;
          this.usuarioSubject.next(usuario);
          localStorage.setItem('usuario', JSON.stringify(usuario));
        }
      }),
      catchError((error) => {
        console.error('Error al subir foto:', error);
        throw error;
      })
    );
  }

  /**
   * Cambia la contraseña del usuario
   */
  cambiarContrasena(contraseniaActual: string, contraseniaNueva: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/cambiar-contrasena`, {
        contraseniaActual,
        contraseniaNueva,
      })
      .pipe(
        catchError((error) => {
          console.error('Error al cambiar contraseña:', error);
          throw error;
        })
      );
  }

  /**
   * Obtiene el usuario actual desde BehaviorSubject
   */
  getUsuario(): Usuario | null {
    return this.usuarioSubject.value;
  }

  /**
   * Limpia los datos del usuario (logout)
   */
  limpiarUsuario(): void {
    this.usuarioSubject.next(null);
    localStorage.removeItem('usuario');
  }
}
