import { InjectionToken } from '@angular/core';
import { Language } from '../../services/translate.service';
import { Accion, INTENCIONES, Intencion, SUGERENCIAS_AYUDA, UI } from './conocimiento';

/** Lo que el asistente contesta a una consulta. */
export interface RespuestaBot {
  texto: string;
  acciones: Accion[];
  /** Ids de preguntas para ofrecer como siguientes sugerencias. */
  sugerencias: string[];
  /** Id de la intención reconocida (null si no se entendió). */
  intencion: string | null;
}

/**
 * Contrato de cualquier "cerebro" del asistente. Hoy se usa el de preguntas
 * frecuentes; para agregar inteligencia artificial más adelante basta con
 * otra implementación (que llame al backend) y cambiar el proveedor de
 * MOTOR_CHATBOT — la ventana del chat no cambia.
 */
export interface MotorChatbot {
  responder(consulta: string, idioma: Language): Promise<RespuestaBot>;
  /** Respuesta directa a una pregunta sugerida (sin interpretar texto). */
  responderIntencion(id: string, idioma: Language): RespuestaBot;
}

/** "¿Cuánto cuesta?" → "cuanto cuesta": minúsculas, sin tildes ni signos. */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .normalize('NFC')
    .replace(/[¿?¡!.,;:()"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const ES_LATINO = /^[a-z0-9 ]+$/;

/**
 * Motor de preguntas frecuentes: busca las palabras clave de cada intención
 * en la consulta (en cualquiera de los idiomas) y responde en el idioma del
 * sitio. En alfabeto latino la clave debe aparecer al inicio de una palabra
 * ("hora" no debe encontrarse dentro de "ahora"); en coreano y chino basta
 * con que aparezca.
 */
export class MotorPreguntasFrecuentes implements MotorChatbot {
  async responder(consulta: string, idioma: Language): Promise<RespuestaBot> {
    const texto = ' ' + normalizar(consulta) + ' ';
    let mejor: Intencion | null = null;
    let mejorPuntaje = 0;

    for (const intencion of INTENCIONES) {
      let puntaje = 0;
      for (const clave of intencion.claves) {
        const coincide = ES_LATINO.test(clave)
          ? new RegExp(`[^a-z0-9]${clave.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(texto)
          : texto.includes(clave);
        if (coincide) puntaje += 1 + clave.length / 10;   // claves largas pesan más
      }
      // Un saludo solo gana si no se preguntó nada más.
      if (intencion.id === 'saludo') puntaje *= 0.5;
      if (puntaje > mejorPuntaje) {
        mejor = intencion;
        mejorPuntaje = puntaje;
      }
    }

    if (!mejor) {
      return { texto: UI['noEntendi'][idioma], acciones: [], sugerencias: SUGERENCIAS_AYUDA, intencion: null };
    }
    return this.responderIntencion(mejor.id, idioma);
  }

  responderIntencion(id: string, idioma: Language): RespuestaBot {
    const intencion = INTENCIONES.find(i => i.id === id)!;
    return {
      texto: intencion.respuesta[idioma],
      acciones: intencion.acciones ?? [],
      sugerencias: intencion.siguientes ?? [],
      intencion: intencion.id,
    };
  }
}

export const MOTOR_CHATBOT = new InjectionToken<MotorChatbot>('MOTOR_CHATBOT', {
  providedIn: 'root',
  factory: () => new MotorPreguntasFrecuentes(),
});
