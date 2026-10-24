import { environment } from '../../environments/environment';
/**
 * Tests unitarios para ChatSoporteService
 * Cubre: conversaciones, mensajería WebSocket, soporte en tiempo real
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChatSoporteService, Mensaje, Conversacion, ConversacionDetalle } from './chat-soporte.service';

describe('ChatSoporteService', () => {
  let service: ChatSoporteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ChatSoporteService],
    });

    service = TestBed.inject(ChatSoporteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Inicialización', () => {
    it('debería crear el servicio', () => {
      expect(service).toBeTruthy();
    });

    it('debería tener método obtenerConversacion', () => {
      expect(typeof service.obtenerConversacion).toBe('function');
    });

    it('debería tener método obtenerHistorialConversacion', () => {
      expect(typeof service.obtenerHistorialConversacion).toBe('function');
    });

    it('debería tener método enviarMensaje', () => {
      expect(typeof service.enviarMensaje).toBe('function');
    });
  });

  describe('Obtener Conversación Actual', () => {
    it('debería obtener conversación actual sin parámetros', () => {
      service.obtenerConversacion().subscribe();

      const req = httpMock.expectOne('http://localhost:8080/api/chat/conversacion-actual');
      expect(req.request.method).toBe('GET');

      const mockConversacion: Conversacion = {
        id: 'CONV-001',
        usuarioId: 'USER-123',
        estado: 'activa',
        tema: 'Problema con reserva',
        fechaInicio: new Date(),
        noLeidosCount: 0,
      };

      req.flush(mockConversacion);
    });

    it('debería retornar conversación con datos correctos', () => {
      const mockConversacion: Conversacion = {
        id: 'CONV-001',
        usuarioId: 'USER-123',
        estado: 'activa',
        tema: 'Consulta general',
        fechaInicio: new Date(),
        noLeidosCount: 2,
      };

      service.obtenerConversacion().subscribe((conversacion) => {
        expect(conversacion.id).toBe('CONV-001');
        expect(conversacion.estado).toBe('activa');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/chat/conversacion-actual`);
      req.flush(mockConversacion);
    });
  });

  describe('Historial de Conversaciones', () => {
    it('debería obtener historial con conversacionId', () => {
      service.obtenerHistorialConversacion('CONV-001').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/chat/conversaciones/CONV-001`);
      expect(req.request.method).toBe('GET');

      const mockHistorial: ConversacionDetalle = {
        id: 'CONV-001',
        usuarioId: 'USER-123',
        estado: 'activa',
        tema: 'Test',
        fechaInicio: new Date(),
        noLeidosCount: 0,
        mensajes: [],
      };

      req.flush(mockHistorial);
    });

    it('debería retornar mensajes del historial', () => {
      const mockMensajes: Mensaje[] = [
        {
          id: 'MSG-1',
          conversacionId: 'CONV-001',
          remitente: 'usuario',
          contenido: 'Hola soporte',
          timestamp: new Date(),
          leido: true,
        },
        {
          id: 'MSG-2',
          conversacionId: 'CONV-001',
          remitente: 'soporte',
          contenido: 'Hola, en qué puedo ayudarte?',
          timestamp: new Date(),
          leido: true,
        },
      ];

      service.obtenerHistorialConversacion('CONV-001').subscribe((detalle) => {
        expect(detalle.mensajes.length).toBe(2);
        expect(detalle.mensajes[0].contenido).toBe('Hola soporte');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/chat/conversaciones/CONV-001`);
      req.flush({ id: 'CONV-001', usuarioId: 'USER-123', estado: 'activa', tema: 'Test', fechaInicio: new Date(), noLeidosCount: 0, mensajes: mockMensajes });
    });
  });

  describe('Enviar Mensaje', () => {
    it('debería enviar mensaje con conversacionId y contenido', () => {
      service.enviarMensaje('CONV-001', 'Necesito ayuda').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/chat/conversaciones/CONV-001/mensajes`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.contenido).toBe('Necesito ayuda');

      const mockRespuesta: Mensaje = {
        id: 'MSG-123',
        conversacionId: 'CONV-001',
        remitente: 'usuario',
        contenido: 'Necesito ayuda',
        timestamp: new Date(),
        leido: false,
      };

      req.flush(mockRespuesta);
    });

    it('debería retornar mensaje enviado', () => {
      const mockMensaje: Mensaje = {
        id: 'MSG-456',
        conversacionId: 'CONV-001',
        remitente: 'usuario',
        contenido: 'Mi pregunta',
        timestamp: new Date(),
        leido: false,
      };

      service.enviarMensaje('CONV-001', 'Mi pregunta').subscribe((mensaje) => {
        expect(mensaje.id).toBe('MSG-456');
        expect(mensaje.contenido).toBe('Mi pregunta');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/chat/conversaciones/CONV-001/mensajes`);
      req.flush(mockMensaje);
    });
  });

  describe('Listado de Conversaciones', () => {
    it('debería obtener todas las conversaciones del usuario', () => {
      service.obtenerConversaciones().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/chat/conversaciones`);
      expect(req.request.method).toBe('GET');

      req.flush([] as Conversacion[]);
    });

    it('debería retornar array de conversaciones', () => {
      const mockConversaciones: Conversacion[] = [
        {
          id: 'CONV-001',
          usuarioId: 'USER-123',
          estado: 'activa',
          tema: 'Reserva',
          fechaInicio: new Date(),
          noLeidosCount: 1,
        },
        {
          id: 'CONV-002',
          usuarioId: 'USER-123',
          estado: 'resuelta',
          tema: 'Pago',
          fechaInicio: new Date(),
          noLeidosCount: 0,
        },
      ];

      service.obtenerConversaciones().subscribe((conversaciones) => {
        expect(conversaciones.length).toBe(2);
        expect(conversaciones[0].tema).toBe('Reserva');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/chat/conversaciones`);
      req.flush(mockConversaciones);
    });
  });

  describe('Resolver Conversación', () => {
    it('debería marcar conversación como resuelta', () => {
      service.resolverConversacion('CONV-001').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/chat/conversaciones/CONV-001/resolver`);
      expect(req.request.method).toBe('PUT');

      const mockConversacionResuelta: Conversacion = {
        id: 'CONV-001',
        usuarioId: 'USER-123',
        estado: 'resuelta',
        tema: 'Test',
        fechaInicio: new Date(),
        fechaCierre: new Date(),
        noLeidosCount: 0,
      };

      req.flush(mockConversacionResuelta);
    });
  });

  describe('Observable Management', () => {
    it('debería retornar observable en obtenerConversacion', () => {
      const result = service.obtenerConversacion();
      expect(result.subscribe).toBeDefined();
    });

    it('debería retornar observable en enviarMensaje', () => {
      const result = service.enviarMensaje('CONV-001', 'test');
      expect(result.subscribe).toBeDefined();
    });

    it('debería emitir nuevo mensaje desde subject', (done) => {
      service.nuevoMensaje$.subscribe((mensaje) => {
        expect(mensaje).toBeDefined();
        done();
      });

      // Simular envío de mensaje
      const mockMensaje: Mensaje = {
        id: 'MSG-999',
        conversacionId: 'CONV-001',
        remitente: 'soporte',
        contenido: 'Respuesta',
        timestamp: new Date(),
        leido: false,
      };

      service.nuevoMensaje$.subscribe((msg) => {
        if (msg.id === 'MSG-999') {
          expect(msg.contenido).toBe('Respuesta');
          done();
        }
      });
    });
  });

  describe('Manejo de Errores', () => {
    it('debería manejar error al obtener conversación', () => {
      service.obtenerConversacion().subscribe(
        () => {
          /* success */
        },
        (error) => {
          expect(error).toBeDefined();
        }
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/chat/conversacion-actual`);
      req.error(new ErrorEvent('Server error'), { status: 500 });
    });

    it('debería manejar error al enviar mensaje', () => {
      service.enviarMensaje('CONV-001', 'test').subscribe(
        () => {
          /* success */
        },
        (error) => {
          expect(error).toBeDefined();
        }
      );

      const req = httpMock.expectOne(`${environment.apiUrl}/chat/conversaciones/CONV-001/mensajes`);
      req.error(new ErrorEvent('Network error'), { status: 0 });
    });
  });

  describe('Estados de Conversación', () => {
    it('debería actualizar estado correctamente', () => {
      const mockConversacionActiva: Conversacion = {
        id: 'CONV-001',
        usuarioId: 'USER-123',
        estado: 'activa',
        tema: 'Consulta',
        fechaInicio: new Date(),
        noLeidosCount: 3,
      };

      service.obtenerConversacion().subscribe((conv) => {
        expect(conv.estado).toBe('activa');
        expect(conv.noLeidosCount).toBe(3);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/chat/conversacion-actual`);
      req.flush(mockConversacionActiva);
    });
  });
});
