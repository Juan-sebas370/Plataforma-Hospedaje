import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Mensaje {
  id: string;
  autor: 'usuario' | 'soporte';
  texto: string;
  timestamp: Date;
  leido: boolean;
}

@Component({
  selector: 'app-chat-soporte',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './chat-soporte.html',
  styleUrl: './chat-soporte.css',
})
export class ChatSoporte implements OnInit {
  mensajes: Mensaje[] = [];
  nuevoMensaje: string = '';
  cargando: boolean = false;
  conectado: boolean = false;
  conversacionActiva: boolean = false;
  private isBrowser = false;
  
  // Datos de sesión
  usuarioId: string = '';
  nombreUsuario: string = '';
  agenteSoporte: string = 'Agent James';
  tiempoRespuesta: string = 'Típicamente 2-5 min';
  
  // Temas frecuentes
  temasRapidos = [
    'Información de reserva',
    'Problemas de acceso',
    'Cuestiones de pago',
    'Cambiar fecha de reserva',
    'Cancelar reserva',
    'Reportar problema',
  ];

  constructor(private router: Router, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.iniciarChat();
  }

  /**
   * Inicia la sesión de chat
   */
  private iniciarChat(): void {
    this.usuarioId = 'USER_001'; // Obtener del AuthService
    this.nombreUsuario = 'Juan'; // Obtener del AuthService
    
    this.conectado = true;
    this.conversacionActiva = true;
    
    // Mensaje de bienvenida del soporte
    this.agregarMensajeSoporte(
      `¡Hola ${this.nombreUsuario}! Bienvenido al chat de soporte. ¿Cómo podemos ayudarte hoy?`
    );
  }

  /**
   * Maneja el evento de tecla en el área de entrada
   */
  onKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }

  /**
   * Envía un mensaje
   */
  enviarMensaje(): void {
    if (!this.nuevoMensaje.trim()) return;

    // Agregar mensaje del usuario
    this.agregarMensajeUsuario(this.nuevoMensaje);
    const pergunta = this.nuevoMensaje;
    this.nuevoMensaje = '';

    // Simular respuesta del soporte
    this.cargando = true;
    setTimeout(() => {
      this.cargando = false;
      this.generarRespuestaIA(pergunta);
    }, 1500);
  }

  /**
   * Agrega un mensaje del usuario al chat
   */
  private agregarMensajeUsuario(texto: string): void {
    const mensaje: Mensaje = {
      id: Date.now().toString(),
      autor: 'usuario',
      texto: texto,
      timestamp: new Date(),
      leido: true,
    };
    this.mensajes.push(mensaje);
    this.scrollAlFinal();
  }

  /**
   * Agrega un mensaje de soporte al chat
   */
  private agregarMensajeSoporte(texto: string): void {
    const mensaje: Mensaje = {
      id: Date.now().toString(),
      autor: 'soporte',
      texto: texto,
      timestamp: new Date(),
      leido: false,
    };
    this.mensajes.push(mensaje);
    this.scrollAlFinal();
  }

  /**
   * Genera respuesta automática basada en el mensaje
   */
  private generarRespuestaIA(pregunta: string): void {
    const preguntaLower = pregunta.toLowerCase();
    let respuesta = '';

    if (
      preguntaLower.includes('reserva') ||
      preguntaLower.includes('booking')
    ) {
      respuesta =
        'Para ayudarte con tu reserva, necesitaré el número de confirmación. ¿Puedes compartirlo conmigo?';
    } else if (
      preguntaLower.includes('pago') ||
      preguntaLower.includes('tarjeta')
    ) {
      respuesta =
        'Aceptamos múltiples métodos de pago: tarjetas de crédito, transferencias bancarias y efectivo. ¿Hay algún problema específico?';
    } else if (
      preguntaLower.includes('cancelar') ||
      preguntaLower.includes('reembolso')
    ) {
      respuesta =
        'Puedes cancelar tu reserva hasta 48 horas antes de la llegada para obtener un reembolso completo. ¿Deseas proceder?';
    } else if (
      preguntaLower.includes('cambiar') ||
      preguntaLower.includes('modificar')
    ) {
      respuesta =
        'Estaremos encantados de ayudarte a cambiar tus fechas. ¿Cuál es la nueva fecha de llegada que prefieristas?';
    } else if (
      preguntaLower.includes('problema') ||
      preguntaLower.includes('error')
    ) {
      respuesta =
        'Lo sentimos por los inconvenientes. Cuéntanos en detalle qué problema estás experimentando.';
    } else {
      respuesta =
        '¿Podrías ser más específico? Puedo ayudarte con reservas, pagos, cancelaciones o cualquier otra cuestión. ¿Cuál es tu consulta?';
    }

    this.agregarMensajeSoporte(respuesta);
  }

  /**
   * Envía un mensaje de tema rápido
   */
  enviarTemaRapido(tema: string): void {
    this.nuevoMensaje = tema;
    this.enviarMensaje();
  }

  /**
   * Cierra el chat
   */
  cerrarChat(): void {
    this.conversacionActiva = false;
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1000);
  }

  /**
   * Scroll al final del chat
   */
  private scrollAlFinal(): void {
    if (!this.isBrowser) return;

    setTimeout(() => {
      const elemento = document.querySelector('.mensajes-container');
      if (elemento) {
        elemento.scrollTop = elemento.scrollHeight;
      }
    }, 100);
  }

  /**
   * Formatea la hora del mensaje
   */
  formatearHora(fecha: Date): string {
    const h = fecha.getHours().toString().padStart(2, '0');
    const m = fecha.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  /**
   * Obtiene el estado de conexión
   */
  getEstadoConexion(): string {
    return this.conectado ? 'Conectado' : 'Desconectado';
  }

  /**
   * Obtiene el color del estado
   */
  getColorEstado(): string {
    return this.conectado ? '#1B7340' : '#B83A2E';
  }
}
