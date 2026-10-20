// =====================================================================
// Política de reservas y cancelación · Reglamento interno · Política de
// tratamiento de datos personales (Ley 1581 de 2012).
//
// El huésped las acepta en el último paso de la reserva y el backend guarda
// la fecha y la VERSION_POLITICAS aceptada. Si se cambia cualquier texto
// de fondo, se actualiza la versión aquí y en ReservaService.VERSION_POLITICAS.
// =====================================================================

export const VERSION_POLITICAS = '2026-10-20';
export const VIGENTE_DESDE = '20 de octubre de 2026';

/** Datos del hospedaje (GET /api/hospedaje, editables en SOGO). Vacíos → se usan los de por defecto. */
export interface DatosHospedaje {
  nombre: string;
  razonSocial: string;
  nit: string;
  rnt: string;
  direccion: string;
  correo: string;
  telefonos: string;
  whatsapp: string;
}

export const HOSPEDAJE_POR_DEFECTO: DatosHospedaje = {
  nombre: 'Hospedaje Sebastián',
  razonSocial: '',
  nit: '',
  rnt: '',
  direccion: 'Carrera 3ra #5-65, Filandia, Quindío',
  correo: 'hospedajesebastianfilandia@gmail.com',
  telefonos: '+57 314 755 6717 · +57 311 340 8867',
  whatsapp: '+57 314 755 6717',
};

export type IdPolitica = 'reserva' | 'reglamento' | 'datos';

export interface SeccionPolitica {
  titulo: string;
  parrafos?: string[];
  puntos?: string[];
}

export interface DocumentoPolitica {
  id: IdPolitica;
  titulo: string;
  corto: string;
  intro: string;
  secciones: SeccionPolitica[];
}

export function documentosPoliticas(h: DatosHospedaje): DocumentoPolitica[] {
  const contacto = `${h.correo} o por WhatsApp al ${h.whatsapp}`;
  const responsable = [
    h.razonSocial || h.nombre,
    h.razonSocial && h.razonSocial !== h.nombre ? `(nombre comercial: ${h.nombre})` : '',
    h.nit ? `· NIT ${h.nit}` : '',
    h.rnt ? `· RNT ${h.rnt}` : '',
  ].filter(Boolean).join(' ');

  return [
    {
      id: 'reserva',
      titulo: 'Política de reservas y cancelación',
      corto: 'Reservas y cancelación',
      intro: `Estas condiciones aplican a las reservas hechas en ${h.nombre} a través de esta página. Al confirmar tu reserva declaras que las leíste y las aceptas.`,
      secciones: [
        {
          titulo: 'Cómo se confirma tu reserva',
          puntos: [
            'Tu reserva queda confirmada cuando Wompi aprueba el pago del valor total. Mientras el pago no esté aprobado, la reserva queda pendiente.',
            'Al confirmarse te enviamos un correo con tu código de reserva (RSV-…) y un código QR.',
            'Las tarifas son por persona y por noche (pasadía y grupos de trabajo: por persona y por día), según la temporada de la fecha de llegada.',
            'Bebés de 0 a 3 años no pagan; niños de 4 a 10 años pagan el 60 % de la tarifa; desde los 11 años se paga la tarifa completa.',
            'El valor que ves antes de pagar es el que se cobra: se calcula con las tarifas vigentes en ese momento.',
          ],
        },
        {
          titulo: 'Horarios',
          puntos: [
            'Llegada (check-in): de 3:00 p.m. a 10:00 p.m. Si vas a llegar más tarde, avísanos con anticipación.',
            'Salida (check-out): hasta las 12:00 m.',
            'Pasadía: de 10:00 a.m. a 8:00 p.m. Grupos de trabajo: de 8:00 a.m. a 6:00 p.m.',
            'Llegar antes o salir más tarde solo es posible si hay disponibilidad; pregúntanos.',
          ],
        },
        {
          titulo: 'Cancelación y reembolsos',
          puntos: [
            'Si cancelas hasta 72 horas antes de las 3:00 p.m. del día de llegada, te devolvemos el 100 % de lo pagado.',
            'Si cancelas con menos de 72 horas o no llegas, se cobra el valor de la primera noche y te devolvemos el resto.',
            'Pasadías y grupos de trabajo: reembolso del 100 % si cancelas hasta 72 horas antes; después no hay reembolso.',
            'Si decides irte antes de la fecha de salida, las noches no usadas no se reembolsan.',
            'Los reembolsos se hacen al mismo medio con el que pagaste, a través de Wompi. El tiempo en que se reflejan depende de tu banco o entidad.',
            `Para cancelar, escríbenos con tu código de reserva a ${contacto}. Cuenta la fecha y hora en que recibimos tu mensaje.`,
          ],
        },
        {
          titulo: 'Cambios de fecha',
          puntos: [
            'Puedes pedir un cambio de fechas escribiéndonos con tu código de reserva. Está sujeto a disponibilidad.',
            'Si lo pides con al menos 72 horas de anticipación no tiene costo; solo se ajusta la diferencia si las nuevas fechas tienen otra tarifa.',
            'Un cambio pedido con menos de 72 horas se trata como una cancelación.',
          ],
        },
        {
          titulo: 'Si nosotros no podemos recibirte',
          parrafos: [
            'Si por fuerza mayor o por una causa nuestra no podemos prestarte el servicio, te devolvemos el 100 % de lo pagado o te ofrecemos nuevas fechas, como prefieras.',
          ],
        },
        {
          titulo: 'Registro de huéspedes',
          puntos: [
            'Al llegar, cada huésped adulto presenta su documento de identidad (cédula, cédula de extranjería o pasaporte). Es obligatorio por ley para el registro hotelero; los huéspedes extranjeros se reportan a Migración Colombia.',
            'Solo pueden hospedarse las personas incluidas en la reserva, y no pueden ser más de las reservadas.',
            'Los menores de edad deben venir con su padre, su madre o un adulto responsable, y presentar su documento (registro civil o tarjeta de identidad). Si vienen con un adulto distinto a sus padres, este debe traer una autorización escrita de ellos.',
          ],
        },
      ],
    },
    {
      id: 'reglamento',
      titulo: 'Reglamento interno',
      corto: 'Reglamento interno',
      intro: 'Para que todos disfruten su estadía y la casa se conserve en buen estado, te pedimos cumplir estas normas.',
      secciones: [
        {
          titulo: 'Convivencia',
          puntos: [
            'Horario de silencio: de 10:00 p.m. a 7:00 a.m. El resto del día, mantén la música y el volumen moderados.',
            'Trata con respeto a los demás huéspedes, a los vecinos y a nuestro personal.',
          ],
        },
        {
          titulo: 'Visitantes',
          parrafos: [
            'No se permiten visitantes. Solo pueden ingresar a la casa las personas registradas en la reserva.',
          ],
        },
        {
          titulo: 'Prohibido fumar dentro de la casa',
          parrafos: [
            'No se permite fumar ni usar vapeadores dentro de la casa (habitaciones, baños y zonas comunes interiores). Solo se puede en las zonas exteriores.',
          ],
        },
        {
          titulo: 'Mascotas',
          puntos: [
            'Somos pet friendly: se admite máximo una mascota por reserva. Avísanos al reservar (en el campo de observaciones).',
            'La mascota está bajo el cuidado y la responsabilidad de su dueño, debe ir con correa en las zonas comunes y sus desechos deben recogerse.',
            'No hay cargo fijo por la mascota: solo se cobran la limpieza o las reparaciones si deja daños o suciedad fuera de lo normal.',
          ],
        },
        {
          titulo: 'Cuidado de la casa',
          puntos: [
            'Cuida los muebles, la lencería y los equipos. Los daños causados por huéspedes o mascotas se cobran según el costo de reparación o reposición.',
            'Si usas la cocina, déjala limpia y lava la loza que utilices.',
            'Ayúdanos a ahorrar agua y energía: apaga luces y equipos cuando salgas.',
          ],
        },
        {
          titulo: 'Seguridad',
          puntos: [
            'Está prohibido ingresar armas, pólvora, sustancias ilícitas o materiales inflamables.',
            'No se permiten fiestas ni eventos que no hayan sido contratados como pasadía o grupo de trabajo.',
            'Cuida tus objetos de valor y cierra puertas y ventanas al salir. El hospedaje no responde por objetos dejados sin cuidado.',
          ],
        },
        {
          titulo: 'Protección de niñas, niños y adolescentes',
          parrafos: [
            `${h.nombre} rechaza toda forma de explotación y abuso sexual de niñas, niños y adolescentes, y denuncia cualquier caso ante las autoridades, como lo exigen la Ley 679 de 2001 y la Ley 1336 de 2009. Si conoces un caso, denúncialo en la Línea 141 del ICBF o en la Línea 123.`,
          ],
        },
        {
          titulo: 'Si no se cumplen estas normas',
          parrafos: [
            'Incumplir este reglamento puede llevar a terminar la estadía sin reembolso, además del cobro de los daños que se hayan causado.',
          ],
        },
      ],
    },
    {
      id: 'datos',
      titulo: 'Política de tratamiento de datos personales',
      corto: 'Datos personales',
      intro: 'Así cuidamos y usamos tus datos personales, conforme a la Ley 1581 de 2012 y sus decretos reglamentarios.',
      secciones: [
        {
          titulo: 'Responsable',
          parrafos: [
            `${responsable}. Dirección: ${h.direccion}. Correo: ${h.correo}. Teléfonos: ${h.telefonos}.`,
          ],
        },
        {
          titulo: 'Qué datos recogemos',
          puntos: [
            'De identificación: nombre, apellido, tipo y número de documento.',
            'De contacto: correo electrónico, teléfono y país.',
            'De tu reserva: fechas, acompañantes (número y rango de edad) y las observaciones que nos escribas.',
            'No recibimos ni guardamos los datos de tus tarjetas ni cuentas bancarias: los pagos se procesan directamente en Wompi.',
            'Los datos de menores de edad se piden solo para el registro obligatorio de huéspedes y se tratan respetando sus derechos.',
          ],
        },
        {
          titulo: 'Para qué los usamos',
          puntos: [
            'Gestionar tu reserva, tu estadía y tus pagos.',
            'Hacer el registro hotelero y los reportes que exige la ley (por ejemplo, a Migración Colombia para huéspedes extranjeros).',
            'Facturar y cumplir nuestras obligaciones contables y tributarias.',
            'Enviarte correos sobre tu reserva y atender tus peticiones, quejas y reclamos.',
          ],
          parrafos: [
            'No vendemos tus datos ni los usamos para enviarte publicidad sin tu autorización.',
          ],
        },
        {
          titulo: 'Con quién los compartimos',
          parrafos: [
            'Solo con los proveedores que nos ayudan a prestar el servicio (procesamiento de pagos, envío de correos y alojamiento de nuestro sistema), que deben protegerlos, y con las autoridades cuando la ley lo exige.',
          ],
        },
        {
          titulo: 'Tus derechos',
          puntos: [
            'Conocer, actualizar y rectificar tus datos.',
            'Pedir prueba de la autorización que nos diste.',
            'Saber cómo hemos usado tus datos.',
            'Revocar la autorización y pedir que borremos tus datos, cuando no exista un deber legal de conservarlos.',
            'Presentar quejas ante la Superintendencia de Industria y Comercio.',
            'Consultar tus datos de forma gratuita.',
          ],
        },
        {
          titulo: 'Cómo ejercerlos',
          parrafos: [
            `Escríbenos a ${h.correo} con el asunto "Datos personales", tu nombre, tu número de documento y lo que necesitas. Respondemos las consultas en máximo 10 días hábiles y los reclamos en máximo 15 días hábiles, como indica la ley.`,
          ],
        },
        {
          titulo: 'Conservación y seguridad',
          parrafos: [
            'Protegemos tus datos con medidas técnicas y administrativas razonables. Los conservamos mientras dure la relación contigo y hasta 5 años después de tu estadía, o por el tiempo que exijan las normas contables, tributarias y de registro de huéspedes.',
          ],
        },
        {
          titulo: 'Vigencia',
          parrafos: [
            `Esta política rige desde el ${VIGENTE_DESDE}. Si la cambiamos, publicaremos la nueva versión en esta página.`,
          ],
        },
      ],
    },
  ];
}

/** Lo más importante, para mostrar junto a la casilla de aceptación. */
export function puntosClave(deDia: boolean): { icono: 'clock' | 'calendar' | 'moon' | 'users' | 'id'; texto: string }[] {
  return [
    deDia
      ? { icono: 'clock', texto: 'Pasadía de 10:00 a.m. a 8:00 p.m. · grupos de trabajo de 8:00 a.m. a 6:00 p.m.' }
      : { icono: 'clock', texto: 'Llegada de 3:00 p.m. a 10:00 p.m. · salida hasta las 12:00 m.' },
    deDia
      ? { icono: 'calendar', texto: 'Cancelación con reembolso total hasta 72 horas antes; después no hay reembolso.' }
      : { icono: 'calendar', texto: 'Cancelación con reembolso total hasta 72 horas antes; después, o si no llegas, se cobra la primera noche.' },
    { icono: 'moon', texto: 'Silencio de 10:00 p.m. a 7:00 a.m. No se fuma dentro de la casa.' },
    { icono: 'users', texto: 'Solo ingresan las personas de la reserva: no se permiten visitantes.' },
    { icono: 'id', texto: 'Cada adulto presenta su documento al llegar; los menores vienen con un adulto responsable.' },
  ];
}
