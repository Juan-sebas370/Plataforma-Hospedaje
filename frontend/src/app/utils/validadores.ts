/**
 * Validadores y utilidades compartidas
 */

export class ValidadorUtils {
  /**
   * Valida un email
   */
  static validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Valida un teléfono (mínimo 7 dígitos)
   */
  static validarTelefono(telefono: string): boolean {
    const soloNumeros = telefono.replace(/\D/g, '');
    return soloNumeros.length >= 7;
  }

  /**
   * Valida contraseña fuerte
   */
  static validarContraseniaFuerte(contrasenia: string): {
    esValida: boolean;
    requisitos: {
      minusculas: boolean;
      mayusculas: boolean;
      numeros: boolean;
      caracteresespeciales: boolean;
      longitud: boolean;
    };
  } {
    return {
      esValida:
        /[a-z]/.test(contrasenia) &&
        /[A-Z]/.test(contrasenia) &&
        /[0-9]/.test(contrasenia) &&
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(contrasenia) &&
        contrasenia.length >= 8,
      requisitos: {
        minusculas: /[a-z]/.test(contrasenia),
        mayusculas: /[A-Z]/.test(contrasenia),
        numeros: /[0-9]/.test(contrasenia),
        caracteresespeciales: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
          contrasenia
        ),
        longitud: contrasenia.length >= 8,
      },
    };
  }

  /**
   * Calcula la fortaleza de una contraseña (0-100)
   */
  static calcularFortaleza(contrasenia: string): number {
    if (!contrasenia) return 0;

    let fortaleza = 0;

    // Longitud
    if (contrasenia.length >= 8) fortaleza += 20;
    if (contrasenia.length >= 12) fortaleza += 10;
    if (contrasenia.length >= 16) fortaleza += 10;

    // Caracteres
    if (/[a-z]/.test(contrasenia)) fortaleza += 15;
    if (/[A-Z]/.test(contrasenia)) fortaleza += 15;
    if (/[0-9]/.test(contrasenia)) fortaleza += 15;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(contrasenia)) fortaleza += 15;

    return Math.min(fortaleza, 100);
  }

  /**
   * Valida un nombre
   */
  static validarNombre(nombre: string): boolean {
    return nombre.trim().length >= 3 && nombre.trim().length <= 100;
  }

  /**
   * Valida una ciudad
   */
  static validarCiudad(ciudad: string): boolean {
    return ciudad.trim().length >= 2 && ciudad.trim().length <= 50;
  }

  /**
   * Valida un país
   */
  static validarPais(pais: string): boolean {
    return pais.trim().length >= 2 && pais.trim().length <= 50;
  }

  /**
   * Limpia y formatea un número de teléfono
   */
  static formatearTelefono(telefono: string): string {
    const soloNumeros = telefono.replace(/\D/g, '');
    if (soloNumeros.length === 0) return '';
    if (soloNumeros.length <= 3) return soloNumeros;
    if (soloNumeros.length <= 6) {
      return `${soloNumeros.slice(0, 3)}-${soloNumeros.slice(3)}`;
    }
    return `${soloNumeros.slice(0, 3)}-${soloNumeros.slice(3, 6)}-${soloNumeros.slice(6)}`;
  }

  /**
   * Valida una URL
   */
  static validarURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Valida un archivo (tamaño y tipo)
   */
  static validarArchivo(
    archivo: File,
    tiposPermitidos: string[] = ['image/jpeg', 'image/png', 'image/webp'],
    tamanoMaxMB: number = 5
  ): { valido: boolean; error?: string } {
    if (!tiposPermitidos.includes(archivo.type)) {
      return { valido: false, error: 'Tipo de archivo no permitido' };
    }

    if (archivo.size > tamanoMaxMB * 1024 * 1024) {
      return {
        valido: false,
        error: `El archivo no debe superar ${tamanoMaxMB}MB`,
      };
    }

    return { valido: true };
  }

  /**
   * Valida una fecha de nacimiento
   */
  static validarFechaNacimiento(fecha: string): {
    valida: boolean;
    edad?: number;
    error?: string;
  } {
    const fechaNac = new Date(fecha);
    const hoy = new Date();

    if (fechaNac > hoy) {
      return { valida: false, error: 'La fecha no puede ser futura' };
    }

    const edad = hoy.getFullYear() - fechaNac.getFullYear();
    if (edad < 18) {
      return { valida: false, error: 'Debes ser mayor de 18 años' };
    }
    if (edad > 120) {
      return { valida: false, error: 'Fecha inválida' };
    }

    return { valida: true, edad };
  }

  /**
   * Genera un mensaje de error amigable
   */
  static generarMensajeError(codigoError: number | string): string {
    const errores: { [key: string]: string } = {
      '400': 'Solicitud inválida. Por favor verifica los datos.',
      '401': 'No autenticado. Por favor inicia sesión.',
      '403': 'No tienes permiso para realizar esta acción.',
      '404': 'El recurso no fue encontrado.',
      '409': 'Conflicto: Este dato ya existe.',
      '422': 'Los datos proporcionados no son válidos.',
      '500': 'Error del servidor. Intenta más tarde.',
      '503': 'Servicio no disponible. Intenta más tarde.',
      'network':
        'Error de conexión. Verifica tu internet y intenta nuevamente.',
      'timeout':
        'La solicitud tardó demasiado tiempo. Por favor intenta de nuevo.',
    };

    return errores[codigoError] || 'Ocurrió un error inesperado. Intenta nuevamente.';
  }

  /**
   * Sanitiza una cadena de caracteres (XSS prevention)
   */
  static sanitizar(texto: string): string {
    const mapa: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return texto.replace(/[&<>"']/g, (char) => mapa[char]);
  }
}

/**
 * Utilidades de formato
 */
export class FormatoUtils {
  /**
   * Formatea una moneda
   */
  static formatearMoneda(cantidad: number, moneda: string = 'COP'): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: 0,
    }).format(cantidad);
  }

  /**
   * Formatea una fecha
   */
  static formatearFecha(fecha: Date | string, formato: string = 'es-CO'): string {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return new Intl.DateTimeFormat(formato, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  /**
   * Formatea una hora
   */
  static formatearHora(fecha: Date | string): string {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Formatea un nombre completo
   */
  static capitalizarNombre(nombre: string): string {
    return nombre
      .toLowerCase()
      .split(' ')
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  }

  /**
   * Obtiene las iniciales de un nombre
   */
  static obtenerIniciales(nombre: string): string {
    return nombre
      .split(' ')
      .map((palabra) => palabra.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }

  /**
   * Formatea un número de tarjeta
   */
  static formatearTarjeta(numero: string): string {
    return numero
      .replace(/\s/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim();
  }

  /**
   * Obtiene los últimos 4 dígitos de una tarjeta
   */
  static obtenerUltimosDigitos(numero: string): string {
    return numero.replace(/\s/g, '').slice(-4);
  }

  /**
   * Formatea un porcentaje
   */
  static formatearPorcentaje(valor: number, decimales: number = 2): string {
    return `${valor.toFixed(decimales)}%`;
  }

  /**
   * Calcula el tiempo transcurrido desde una fecha
   */
  static tiempoTranscurrido(fecha: Date | string): string {
    const ahora = new Date();
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const diferencia = ahora.getTime() - fechaObj.getTime();

    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (segundos < 60) return `hace ${segundos}s`;
    if (minutos < 60) return `hace ${minutos}m`;
    if (horas < 24) return `hace ${horas}h`;
    if (dias < 7) return `hace ${dias}d`;

    return this.formatearFecha(fechaObj);
  }
}

/**
 * Utilidades de almacenamiento
 */
export class AlmacenamientoUtils {
  /**
   * Obtiene un valor del localStorage
   */
  static obtener<T>(clave: string): T | null {
    try {
      const valor = localStorage.getItem(clave);
      return valor ? JSON.parse(valor) : null;
    } catch (error) {
      console.error(`Error al obtener ${clave} del localStorage:`, error);
      return null;
    }
  }

  /**
   * Almacena un valor en localStorage
   */
  static almacenar<T>(clave: string, valor: T): void {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
    } catch (error) {
      console.error(`Error al almacenar ${clave} en localStorage:`, error);
    }
  }

  /**
   * Elimina un valor del localStorage
   */
  static eliminar(clave: string): void {
    try {
      localStorage.removeItem(clave);
    } catch (error) {
      console.error(`Error al eliminar ${clave} del localStorage:`, error);
    }
  }

  /**
   * Limpia todo el localStorage
   */
  static limpiar(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error al limpiar localStorage:', error);
    }
  }

  /**
   * Obtiene un valor del sessionStorage
   */
  static obtenerSesion<T>(clave: string): T | null {
    try {
      const valor = sessionStorage.getItem(clave);
      return valor ? JSON.parse(valor) : null;
    } catch (error) {
      console.error(`Error al obtener ${clave} del sessionStorage:`, error);
      return null;
    }
  }

  /**
   * Almacena un valor en sessionStorage
   */
  static almacenarSesion<T>(clave: string, valor: T): void {
    try {
      sessionStorage.setItem(clave, JSON.stringify(valor));
    } catch (error) {
      console.error(`Error al almacenar ${clave} en sessionStorage:`, error);
    }
  }
}
