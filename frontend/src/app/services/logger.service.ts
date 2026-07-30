/**
 * Servicio de logging para la aplicación
 * Proporciona métodos para registrar mensajes en diferentes niveles
 */

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  source?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Máximo de logs a mantener en memoria
  private logColors = {
    error: 'color: #e74c3c; font-weight: bold;',
    warn: 'color: #f39c12; font-weight: bold;',
    info: 'color: #3498db; font-weight: bold;',
    debug: 'color: #9b59b6; font-weight: bold;',
  };

  constructor() {
    if (!environment.production && environment.enableLogging) {
      console.log(
        '%c🚀 Logger Service Inicializado',
        'color: #27ae60; font-weight: bold;'
      );
    }
  }

  /**
   * Registrar un error
   */
  error(message: string, data?: any, source?: string): void {
    this.log('error', message, data, source);
  }

  /**
   * Registrar una advertencia
   */
  warn(message: string, data?: any, source?: string): void {
    this.log('warn', message, data, source);
  }

  /**
   * Registrar información
   */
  info(message: string, data?: any, source?: string): void {
    this.log('info', message, data, source);
  }

  /**
   * Registrar información de debug
   */
  debug(message: string, data?: any, source?: string): void {
    this.log('debug', message, data, source);
  }

  /**
   * Método interno de logging
   */
  private log(
    level: LogLevel,
    message: string,
    data?: any,
    source?: string
  ): void {
    // Verificar nivel de logging configurado
    if (!this.debeRegistrar(level)) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      source: source || this.obtenerFuente(),
    };

    this.logs.push(logEntry);

    // Limitar cantidad de logs en memoria
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Imprimir a consola
    this.imprimirConsola(logEntry);

    // Guardar en localStorage en modo debug
    if (!environment.production) {
      this.guardarEnLocal(logEntry);
    }
  }

  /**
   * Verificar si debe registrarse según nivel configurado
   */
  private debeRegistrar(level: LogLevel): boolean {
    if (!environment.enableLogging) {
      return false;
    }

    const niveles: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    const indexNivelActual = niveles.indexOf(environment.logLevel as LogLevel);
    const indexNivelLog = niveles.indexOf(level);

    return indexNivelLog <= indexNivelActual;
  }

  /**
   * Imprimir en consola con estilos
   */
  private imprimirConsola(entry: LogEntry): void {
    if (!environment.enableLogging) return;

    const timestamp = entry.timestamp.split('T')[1].substring(0, 8);
    const source = entry.source ? ` [${entry.source}]` : '';
    const mensaje = `${timestamp} ${entry.message}${source}`;

    const color = this.logColors[entry.level];

    if (entry.data) {
      console.log(`%c${entry.level.toUpperCase()}: ${mensaje}`, color, entry.data);
    } else {
      console.log(`%c${entry.level.toUpperCase()}: ${mensaje}`, color);
    }
  }

  /**
   * Guardar log en localStorage
   */
  private guardarEnLocal(entry: LogEntry): void {
    try {
      const logsLocal = localStorage.getItem('app_logs');
      const logs = logsLocal ? JSON.parse(logsLocal) : [];
      logs.push(entry);

      // Mantener máximo 100 logs locales
      if (logs.length > 100) {
        logs.shift();
      }

      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Error guardando logs en localStorage:', error);
    }
  }

  /**
   * Obtener fuente del log (nombre de archivo y línea)
   */
  private obtenerFuente(): string {
    try {
      const error = new Error();
      const stack = error.stack || '';
      const lineas = stack.split('\n');

      // Buscar la línea relevante (saltarse las internas del servicio)
      for (let i = 3; i < lineas.length; i++) {
        const linea = lineas[i];
        if (linea && !linea.includes('LoggerService')) {
          // Extraer nombre del archivo
          const match = linea.match(/(\w+\.ts):(\d+)/);
          if (match) {
            return `${match[1]}:${match[2]}`;
          }
        }
      }
    } catch (error) {
      // Silenciosamente fallar si no podemos obtener la fuente
    }

    return 'unknown';
  }

  /**
   * Obtener todos los logs
   */
  obtenerLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Obtener logs por nivel
   */
  obtenerLogsPorNivel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Obtener logs por fuente
   */
  obtenerLogsPorFuente(source: string): LogEntry[] {
    return this.logs.filter((log) => log.source?.includes(source));
  }

  /**
   * Obtener últimos N logs
   */
  obtenerUltimosLogs(cantidad: number = 50): LogEntry[] {
    return this.logs.slice(-cantidad);
  }

  /**
   * Limpiar todos los logs
   */
  limpiarLogs(): void {
    this.logs = [];
    try {
      localStorage.removeItem('app_logs');
    } catch (error) {
      console.error('Error limpiando logs:', error);
    }
  }

  /**
   * Exportar logs a JSON
   */
  exportarLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Descargar logs como archivo
   */
  descargarLogs(): void {
    const contenido = this.exportarLogs();
    const blob = new Blob([contenido], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Registrar rendimiento
   */
  registrarRendimiento(nombreOperacion: string, duracion: number): void {
    const mensaje = `⏱️ ${nombreOperacion} completado en ${duracion}ms`;
    this.info(mensaje);
  }

  /**
   * Iniciar medición de tiempo
   */
  iniciarMedicion(nombreOperacion: string): () => void {
    const inicio = performance.now();

    return () => {
      const fin = performance.now();
      const duracion = fin - inicio;
      this.registrarRendimiento(nombreOperacion, Math.round(duracion));
    };
  }

  /**
   * Agrupar logs por nivel
   */
  agruparPorNivel(): { [key in LogLevel]: LogEntry[] } {
    return {
      error: this.obtenerLogsPorNivel('error'),
      warn: this.obtenerLogsPorNivel('warn'),
      info: this.obtenerLogsPorNivel('info'),
      debug: this.obtenerLogsPorNivel('debug'),
    };
  }

  /**
   * Obtener resumen de logs
   */
  obtenerResumen(): {
    total: number;
    errores: number;
    advertencias: number;
    info: number;
    debug: number;
    ultimoLog: LogEntry | null;
  } {
    return {
      total: this.logs.length,
      errores: this.obtenerLogsPorNivel('error').length,
      advertencias: this.obtenerLogsPorNivel('warn').length,
      info: this.obtenerLogsPorNivel('info').length,
      debug: this.obtenerLogsPorNivel('debug').length,
      ultimoLog: this.logs[this.logs.length - 1] || null,
    };
  }

  /**
   * Imprimir resumen en consola
   */
  imprimirResumen(): void {
    const resumen = this.obtenerResumen();
    console.table(resumen);
  }

  /**
   * Depuración: imprimir todos los logs
   */
  depurar(): void {
    if (environment.enableDebugMode) {
      console.group('📋 Resumen de Logs');
      console.table(this.obtenerResumen());
      console.groupEnd();

      console.group('🔍 Logs Agrupados por Nivel');
      console.table(this.agruparPorNivel());
      console.groupEnd();

      console.log('%c📊 Datos Detallados', 'color: #3498db; font-weight: bold;');
      console.table(this.obtenerUltimosLogs(20));
    }
  }
}
