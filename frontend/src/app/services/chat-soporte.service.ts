import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Mensaje {
  id: string;
  conversacionId: string;
  remitente: 'usuario' | 'soporte';
  contenido: string;
  timestamp: Date;
  leido: boolean;
  tipo?: 'texto' | 'archivo' | 'sistema';
}

export interface Conversacion {
  id: string;
  usuarioId: string;
  agente?: string;
  estado: 'activa' | 'resuelta' | 'cerrada';
  tema: string;
  fechaInicio: Date;
  fechaCierre?: Date;
  ultimoMensaje?: Mensaje;
  noLeidosCount: number;
}

export interface ConversacionDetalle extends Conversacion {
  mensajes: Mensaje[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatSoporteService {
  private apiUrl = `${environment.apiUrl}/chat`;
  
  // WebSocket o polling para mensajes en tiempo real
  private mensajesSubject = new BehaviorSubject<Mensaje[]>([]);
  public mensajes$ = this.mensajesSubject.asObservable();

  private conversacionActualSubject = new BehaviorSubject<Conversacion | null>(null);
  public conversacionActual$ = this.conversacionActualSubject.asObservable();

  private nuevoMensajeSubject = new Subject<Mensaje>();
  public nuevoMensaje$ = this.nuevoMensajeSubject.asObservable();

  private conectadoSubject = new BehaviorSubject<boolean>(false);
  public conectado$ = this.conectadoSubject.asObservable();

  private socketUrl = `${environment.wsUrl}/chat`;
  private socket: WebSocket | null = null;

  constructor(private http: HttpClient) {
    this.inicializarConexion();
  }

  /**
   * Inicializa la conexión WebSocket
   */
  private inicializarConexion(): void {
    try {
      this.socket = new WebSocket(this.socketUrl);

      this.socket.onopen = () => {
        console.log('Conectado al chat');
        this.conectadoSubject.next(true);
      };

      this.socket.onmessage = (evento) => {
        const mensaje: Mensaje = JSON.parse(evento.data);
        this.nuevoMensajeSubject.next(mensaje);
        
        // Agregar a la lista de mensajes
        const mensajes = this.mensajesSubject.value;
        this.mensajesSubject.next([...mensajes, mensaje]);
      };

      this.socket.onerror = (error) => {
        console.error('Error en WebSocket:', error);
        this.conectadoSubject.next(false);
      };

      this.socket.onclose = () => {
        console.log('Desconectado del chat');
        this.conectadoSubject.next(false);
        // Reconnect después de 5 segundos
        setTimeout(() => this.inicializarConexion(), 5000);
      };
    } catch (error) {
      console.error('Error al conectar WebSocket:', error);
      this.conectadoSubject.next(false);
    }
  }

  /**
   * Obtiene o crea una conversación
   */
  obtenerConversacion(): Observable<Conversacion> {
    return this.http
      .get<Conversacion>(`${this.apiUrl}/conversacion-actual`)
      .pipe(
        tap((conversacion) => {
          this.conversacionActualSubject.next(conversacion);
        }),
        catchError((error) => {
          console.error('Error al obtener conversación:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtiene el historial de una conversación
   */
  obtenerHistorialConversacion(
    conversacionId: string
  ): Observable<ConversacionDetalle> {
    return this.http
      .get<ConversacionDetalle>(
        `${this.apiUrl}/conversaciones/${conversacionId}`
      )
      .pipe(
        tap((detalle) => {
          this.mensajesSubject.next(detalle.mensajes);
        }),
        catchError((error) => {
          console.error('Error al obtener historial:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Envía un mensaje a través de WebSocket
   */
  enviarMensajeWebSocket(contenido: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket no está conectado');
      return;
    }

    const conversacion = this.conversacionActualSubject.value;
    const mensaje = {
      conversacionId: conversacion?.id,
      contenido: contenido,
      timestamp: new Date(),
    };

    this.socket.send(JSON.stringify(mensaje));
  }

  /**
   * Envía un mensaje vía HTTP (fallback)
   */
  enviarMensaje(
    conversacionId: string,
    contenido: string
  ): Observable<Mensaje> {
    return this.http
      .post<Mensaje>(`${this.apiUrl}/conversaciones/${conversacionId}/mensajes`, {
        contenido,
      })
      .pipe(
        tap((mensaje) => {
          this.nuevoMensajeSubject.next(mensaje);
          const mensajes = this.mensajesSubject.value;
          this.mensajesSubject.next([...mensajes, mensaje]);
        }),
        catchError((error) => {
          console.error('Error al enviar mensaje:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtiene el listado de conversaciones del usuario
   */
  obtenerConversaciones(): Observable<Conversacion[]> {
    return this.http
      .get<Conversacion[]>(`${this.apiUrl}/conversaciones`)
      .pipe(
        catchError((error) => {
          console.error('Error al obtener conversaciones:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Marca una conversación como resuelta
   */
  resolverConversacion(conversacionId: string): Observable<Conversacion> {
    return this.http
      .put<Conversacion>(
        `${this.apiUrl}/conversaciones/${conversacionId}/resolver`,
        {}
      )
      .pipe(
        tap((conversacion) => {
          this.conversacionActualSubject.next(conversacion);
        }),
        catchError((error) => {
          console.error('Error al resolver:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Cierra una conversación
   */
  cerrarConversacion(conversacionId: string): Observable<Conversacion> {
    return this.http
      .put<Conversacion>(
        `${this.apiUrl}/conversaciones/${conversacionId}/cerrar`,
        {}
      )
      .pipe(
        catchError((error) => {
          console.error('Error al cerrar:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Marca mensajes como leídos
   */
  marcarComoLeido(conversacionId: string): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/conversaciones/${conversacionId}/marcar-leido`, {})
      .pipe(
        catchError((error) => {
          console.error('Error al marcar como leído:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtiene el estado actual de la conexión
   */
  estaConectado(): boolean {
    return this.conectadoSubject.value;
  }

  /**
   * Limpia los datos del chat
   */
  limpiar(): void {
    this.mensajesSubject.next([]);
    this.conversacionActualSubject.next(null);
    if (this.socket) {
      this.socket.close();
    }
  }
}
