/**
 * Base de conocimiento del asistente: preguntas frecuentes del Hospedaje
 * Sebastián en los 6 idiomas del sitio. Para cambiar una respuesta, editar
 * aquí. Los precios salen del catálogo de reservas, así que se actualizan
 * solos cuando cambian las tarifas.
 */
import { Language } from '../../services/translate.service';
import { CATALOGO_HABITACIONES } from '../reservas/reserva.catalogo';

export type Texto = Record<Language, string>;

export interface Accion {
  etiqueta: Texto;
  ruta?: string;            // enlace interno (routerLink)
  href?: string;            // enlace externo (tel:, mailto:)
}

export interface Intencion {
  id: string;
  /** Palabras clave en cualquier idioma, sin tildes y en minúscula. */
  claves: string[];
  /** Texto del botón cuando se ofrece como pregunta sugerida. */
  pregunta: Texto;
  respuesta: Texto;
  acciones?: Accion[];
  /** Preguntas que tiene sentido sugerir después de esta respuesta. */
  siguientes?: string[];
}

// ── Datos reales del hospedaje ────────────────────────────────
export const CONTACTO = {
  telefonos: [
    { texto: '+57 314 755 6717', href: 'tel:+573147556717' },
    { texto: '+57 311 340 8867', href: 'tel:+573113408867' },
  ],
  correo: 'hospedajesebastianfilandia@gmail.com',
  direccion: 'Carrera 3ra #5-65, Filandia, Quindío',
};

/**
 * Los precios salen de la base de datos (editables en SOGO): las respuestas
 * llevan marcadores {individual}, {familiar}, {pasadia} y {grupal} que el chat
 * reemplaza por la tarifa por persona en temporada baja ("desde").
 */
const TOTAL_HABITACIONES = CATALOGO_HABITACIONES.length;

// ── Textos de la interfaz ─────────────────────────────────────
export const UI: Record<string, Texto> = {
  titulo: {
    es: 'Asistente de Hospedaje Sebastián', en: 'Hospedaje Sebastián Assistant', fr: 'Assistant de Hospedaje Sebastián',
    pt: 'Assistente do Hospedaje Sebastián', ko: 'Hospedaje Sebastián 도우미', zh: 'Hospedaje Sebastián 助手',
  },
  subtitulo: {
    es: 'Disponible para ayudarte', en: 'Here to help you', fr: 'Disponible pour vous aider',
    pt: 'Disponível para ajudar', ko: '언제든지 도와드릴게요', zh: '随时为您服务',
  },
  saludo: {
    es: '¡Hola! Bienvenido a Hospedaje Sebastián. ¿En qué puedo ayudarte?',
    en: 'Hi! Welcome to Hospedaje Sebastián. How can I help you?',
    fr: 'Bonjour ! Bienvenue à Hospedaje Sebastián. Comment puis-je vous aider ?',
    pt: 'Olá! Bem-vindo ao Hospedaje Sebastián. Como posso ajudar?',
    ko: '안녕하세요! Hospedaje Sebastián에 오신 것을 환영합니다. 무엇을 도와드릴까요?',
    zh: '您好！欢迎来到 Hospedaje Sebastián。有什么可以帮您？',
  },
  abrir: {
    es: 'Abrir el asistente', en: 'Open the assistant', fr: "Ouvrir l'assistant",
    pt: 'Abrir o assistente', ko: '도우미 열기', zh: '打开助手',
  },
  burbuja: {
    es: '¿Necesitas ayuda?', en: 'Need help?', fr: "Besoin d'aide ?", pt: 'Precisa de ajuda?', ko: '도움이 필요하세요?', zh: '需要帮助吗？',
  },
  cerrar: { es: 'Cerrar el asistente', en: 'Close the assistant', fr: "Fermer l'assistant", pt: 'Fechar o assistente', ko: '도우미 닫기', zh: '关闭助手' },
  reiniciar: { es: 'Empezar de nuevo', en: 'Start over', fr: 'Recommencer', pt: 'Recomeçar', ko: '처음부터', zh: '重新开始' },
  escribe: {
    es: 'Escribe tu pregunta…', en: 'Type your question…', fr: 'Écrivez votre question…',
    pt: 'Escreva sua pergunta…', ko: '질문을 입력하세요…', zh: '请输入您的问题…',
  },
  etiquetaCampo: {
    es: 'Tu pregunta para el asistente', en: 'Your question for the assistant', fr: "Votre question pour l'assistant",
    pt: 'Sua pergunta para o assistente', ko: '도우미에게 할 질문', zh: '您要问助手的问题',
  },
  enviar: { es: 'Enviar', en: 'Send', fr: 'Envoyer', pt: 'Enviar', ko: '보내기', zh: '发送' },
  sugerencias: {
    es: 'Preguntas sugeridas', en: 'Suggested questions', fr: 'Questions suggérées',
    pt: 'Perguntas sugeridas', ko: '추천 질문', zh: '推荐问题',
  },
  escribiendo: {
    es: 'El asistente está escribiendo…', en: 'The assistant is typing…', fr: "L'assistant écrit…",
    pt: 'O assistente está digitando…', ko: '도우미가 입력 중입니다…', zh: '助手正在输入…',
  },
  tu: { es: 'Tú', en: 'You', fr: 'Vous', pt: 'Você', ko: '나', zh: '您' },
  asistente: { es: 'Asistente', en: 'Assistant', fr: 'Assistant', pt: 'Assistente', ko: '도우미', zh: '助手' },
  nota: {
    es: 'Respuestas automáticas. Para casos especiales, escríbenos.',
    en: 'Automatic answers. For special requests, write to us.',
    fr: 'Réponses automatiques. Pour les demandes spéciales, écrivez-nous.',
    pt: 'Respostas automáticas. Para casos especiais, fale conosco.',
    ko: '자동 답변입니다. 특별한 요청은 문의해 주세요.',
    zh: '自动回复。如有特殊需求，请联系我们。',
  },
  noEntendi: {
    es: 'No estoy seguro de haber entendido. Prueba con una de estas preguntas o escríbenos y te respondemos personalmente.',
    en: "I'm not sure I understood. Try one of these questions, or write to us and we'll answer personally.",
    fr: "Je ne suis pas sûr d'avoir compris. Essayez l'une de ces questions ou écrivez-nous, nous vous répondrons personnellement.",
    pt: 'Não tenho certeza se entendi. Tente uma destas perguntas ou fale conosco e responderemos pessoalmente.',
    ko: '잘 이해하지 못했어요. 아래 질문 중 하나를 선택하시거나 문의해 주시면 직접 답변드릴게요.',
    zh: '抱歉，我可能没有理解。请试试下面的问题，或联系我们，我们会亲自回复。',
  },
};

const IR_RESERVAR: Accion = {
  ruta: '/reservas',
  etiqueta: { es: 'Reservar ahora', en: 'Book now', fr: 'Réserver', pt: 'Reservar agora', ko: '지금 예약하기', zh: '立即预订' },
};
const VER_HABITACIONES: Accion = {
  ruta: '/habitaciones',
  etiqueta: { es: 'Ver habitaciones', en: 'See rooms', fr: 'Voir les chambres', pt: 'Ver quartos', ko: '객실 보기', zh: '查看客房' },
};
const VER_SERVICIOS: Accion = {
  ruta: '/servicios',
  etiqueta: { es: 'Ver servicios', en: 'See services', fr: 'Voir les services', pt: 'Ver serviços', ko: '서비스 보기', zh: '查看服务' },
};
const VER_CONTACTO: Accion = {
  ruta: '/contacto',
  etiqueta: { es: 'Ir a contacto', en: 'Contact us', fr: 'Nous contacter', pt: 'Fale conosco', ko: '문의하기', zh: '联系我们' },
};
const VER_GALERIA: Accion = {
  ruta: '/galeria',
  etiqueta: { es: 'Ver galería', en: 'See gallery', fr: 'Voir la galerie', pt: 'Ver galeria', ko: '갤러리 보기', zh: '查看相册' },
};
const LLAMAR: Accion = {
  href: CONTACTO.telefonos[0].href,
  etiqueta: {
    es: `Llamar al ${CONTACTO.telefonos[0].texto}`, en: `Call ${CONTACTO.telefonos[0].texto}`, fr: `Appeler le ${CONTACTO.telefonos[0].texto}`,
    pt: `Ligar para ${CONTACTO.telefonos[0].texto}`, ko: `${CONTACTO.telefonos[0].texto} 전화하기`, zh: `致电 ${CONTACTO.telefonos[0].texto}`,
  },
};
const CORREO: Accion = {
  href: `mailto:${CONTACTO.correo}`,
  etiqueta: { es: 'Enviar un correo', en: 'Send an email', fr: 'Envoyer un e-mail', pt: 'Enviar um e-mail', ko: '이메일 보내기', zh: '发送邮件' },
};

// ── Preguntas frecuentes ──────────────────────────────────────
export const INTENCIONES: Intencion[] = [
  {
    id: 'habitaciones',
    claves: ['habitacion', 'cuarto', 'cama', 'camarote', 'bano', 'room', 'bed', 'bathroom', 'chambre', 'lit', 'quarto', 'cama', 'banheiro', '객실', '방', '침대', '房间', '客房', '床'],
    pregunta: { es: 'Conocer las habitaciones', en: 'See the rooms', fr: 'Découvrir les chambres', pt: 'Conhecer os quartos', ko: '객실 알아보기', zh: '了解客房' },
    respuesta: {
      es: `Tenemos ${TOTAL_HABITACIONES} habitaciones en dos pisos, para 2 o 4 personas cada una. Algunas tienen baño privado y otras comparten baño entre dos habitaciones. También puedes reservar un piso completo o toda la casa (hasta 20 personas).`,
      en: `We have ${TOTAL_HABITACIONES} rooms on two floors, each for 2 or 4 people. Some have a private bathroom and others share one between two rooms. You can also book a whole floor or the entire house (up to 20 people).`,
      fr: `Nous avons ${TOTAL_HABITACIONES} chambres sur deux étages, pour 2 ou 4 personnes chacune. Certaines ont une salle de bain privée, d'autres la partagent entre deux chambres. Vous pouvez aussi réserver un étage entier ou toute la maison (jusqu'à 20 personnes).`,
      pt: `Temos ${TOTAL_HABITACIONES} quartos em dois andares, para 2 ou 4 pessoas cada. Alguns têm banheiro privativo e outros compartilham entre dois quartos. Você também pode reservar um andar inteiro ou a casa toda (até 20 pessoas).`,
      ko: `2개 층에 총 ${TOTAL_HABITACIONES}개의 객실이 있으며, 객실당 2명 또는 4명이 묵을 수 있습니다. 전용 욕실이 있는 객실과 두 객실이 함께 쓰는 욕실이 있습니다. 한 층 전체나 집 전체(최대 20명)도 예약할 수 있습니다.`,
      zh: `我们在两层楼共有 ${TOTAL_HABITACIONES} 间客房，每间可住 2 或 4 人。部分客房有独立卫浴，部分为两间客房共用。您也可以预订整层或整栋房子（最多 20 人）。`,
    },
    acciones: [VER_HABITACIONES, VER_GALERIA],
    siguientes: ['precios', 'grupos', 'reservar'],
  },
  {
    id: 'precios',
    claves: ['precio', 'costo', 'cuesta', 'cuestan', 'cobran', 'cuanto', 'vale', 'coute', 'coutent', 'custa', 'custam', 'how much', 'tarifa', 'valor', 'barato', 'disponib', 'libre', 'fecha', 'price', 'cost', 'how much', 'rate', 'availab', 'prix', 'tarif', 'combien', 'disponib', 'preco', 'quanto', 'disponiv', '가격', '요금', '얼마', '예약 가능', '价格', '多少钱', '费用', '空房'],
    pregunta: {
      es: 'Consultar precios y disponibilidad', en: 'Prices and availability', fr: 'Prix et disponibilités',
      pt: 'Preços e disponibilidade', ko: '가격 및 예약 가능 여부', zh: '价格与空房',
    },
    respuesta: {
      es: 'Las tarifas son por persona: hospedaje desde {individual} por persona cada noche, pasadía desde {pasadia} y grupo de trabajo desde {grupal} por persona. El precio final depende de la temporada (baja, media o alta) y de cuántas personas vienen; los niños de 4 a 10 años pagan el 60 % y los bebés no pagan. En el reservador eliges tus fechas y ves al instante qué está libre y cuánto cuesta.',
      en: 'Rates are per person: lodging from {individual} per person per night, day pass from {pasadia} and work groups from {grupal} per person. The final price depends on the season (low, mid or high) and how many people are coming; children aged 4 to 10 pay 60% and babies stay free. In the booking tool you pick your dates and instantly see what is available and the price.',
      fr: 'Les tarifs sont par personne : hébergement à partir de {individual} par personne et par nuit, journée à partir de {pasadia} et groupes de travail à partir de {grupal} par personne. Le prix final dépend de la saison (basse, moyenne ou haute) et du nombre de personnes ; les enfants de 4 à 10 ans paient 60 % et les bébés ne paient pas. Dans l’outil de réservation, choisissez vos dates pour voir aussitôt les disponibilités et le prix.',
      pt: 'As tarifas são por pessoa: hospedagem a partir de {individual} por pessoa por noite, day use a partir de {pasadia} e grupos de trabalho a partir de {grupal} por pessoa. O preço final depende da temporada (baixa, média ou alta) e de quantas pessoas vêm; crianças de 4 a 10 anos pagam 60% e bebês não pagam. Na reserva você escolhe as datas e vê na hora o que está livre e o preço.',
      ko: '요금은 1인 기준입니다. 숙박은 1인 1박 {individual}부터, 데이유즈는 1인 {pasadia}부터, 워크숍 단체는 1인 {grupal}부터입니다. 최종 가격은 시즌(비수기·준성수기·성수기)과 인원에 따라 달라지며, 4~10세 어린이는 60%, 아기는 무료입니다. 예약 화면에서 날짜를 선택하면 예약 가능 여부와 가격을 바로 확인할 수 있습니다.',
      zh: '价格按人计算：住宿每人每晚 {individual} 起，日间套餐每人 {pasadia} 起，工作团体每人 {grupal} 起。最终价格取决于季节（淡季、平季或旺季）和人数；4–10 岁儿童按 60% 收费，婴儿免费。在预订页面选择日期，即可立即查看空房和价格。',
    },
    acciones: [IR_RESERVAR],
    siguientes: ['ninos', 'temporadas', 'reservar'],
  },
  {
    id: 'reservar',
    claves: ['reserv', 'apart', 'como hago', 'booking', 'book', 'reserve', 'reserver', 'reservar', '예약', '预订', '预定', '怎么订'],
    pregunta: { es: '¿Cómo puedo reservar?', en: 'How can I book?', fr: 'Comment réserver ?', pt: 'Como posso reservar?', ko: '어떻게 예약하나요?', zh: '如何预订？' },
    respuesta: {
      es: 'Reservar toma pocos minutos: 1) eliges tu plan, fechas y personas; 2) eliges habitación, piso o casa; 3) escribes tus datos; 4) confirmas y pagas en línea con Wompi. Recibes la confirmación por correo.',
      en: 'Booking takes just a few minutes: 1) choose your plan, dates and guests; 2) pick a room, floor or the whole house; 3) enter your details; 4) confirm and pay online with Wompi. You get the confirmation by email.',
      fr: "La réservation prend quelques minutes : 1) choisissez votre formule, vos dates et le nombre de personnes ; 2) une chambre, un étage ou la maison ; 3) vos coordonnées ; 4) confirmez et payez en ligne avec Wompi. La confirmation arrive par e-mail.",
      pt: 'Reservar leva poucos minutos: 1) escolha o plano, as datas e as pessoas; 2) escolha quarto, andar ou casa; 3) informe seus dados; 4) confirme e pague online com Wompi. A confirmação chega por e-mail.',
      ko: '예약은 몇 분이면 끝납니다: 1) 이용 유형, 날짜, 인원 선택 2) 객실·층·집 전체 선택 3) 정보 입력 4) Wompi로 온라인 결제 후 확정. 확인 메일을 보내드립니다.',
      zh: '预订只需几分钟：1）选择类型、日期和人数；2）选择客房、整层或整栋；3）填写个人信息；4）通过 Wompi 在线确认并付款。确认信息将发送到您的邮箱。',
    },
    acciones: [IR_RESERVAR],
    siguientes: ['pagos', 'precios', 'horarios'],
  },
  {
    id: 'servicios',
    claves: ['servicio', 'incluye', 'wifi', 'internet', 'cocina', 'lavander', 'agua caliente', 'toalla', 'tv', 'television', 'service', 'include', 'kitchen', 'laundry', 'towel', 'cuisine', 'linge', 'servico', 'inclui', 'cozinha', 'lavanderia', '서비스', '포함', '와이파이', '주방', '세탁', '服务', '包括', '厨房', '洗衣', '无线'],
    pregunta: { es: 'Consultar servicios', en: 'Services', fr: 'Les services', pt: 'Serviços', ko: '서비스 안내', zh: '服务介绍' },
    respuesta: {
      es: 'Incluido en tu estadía: WiFi gratis, agua caliente 24 horas, cocina equipada, lavandería, ropa de cama y toallas, sala de estar con TV y un mezanine con sala de juegos. Además somos pet friendly.',
      en: 'Included in your stay: free WiFi, 24-hour hot water, equipped kitchen, laundry, bed linen and towels, living room with TV and a mezzanine game room. We are also pet friendly.',
      fr: "Inclus dans votre séjour : WiFi gratuit, eau chaude 24 h/24, cuisine équipée, laverie, linge de lit et serviettes, salon avec TV et une mezzanine avec salle de jeux. Les animaux sont aussi les bienvenus.",
      pt: 'Incluído na sua estadia: WiFi grátis, água quente 24 horas, cozinha equipada, lavanderia, roupa de cama e toalhas, sala de estar com TV e um mezanino com sala de jogos. Também aceitamos pets.',
      ko: '숙박에 포함: 무료 와이파이, 24시간 온수, 주방, 세탁 시설, 침구 및 수건, TV가 있는 거실, 게임룸이 있는 메자닌. 반려동물 동반도 가능합니다.',
      zh: '住宿包含：免费 WiFi、24 小时热水、设备齐全的厨房、洗衣服务、床品和毛巾、带电视的客厅以及夹层游戏室。我们也欢迎宠物入住。',
    },
    acciones: [VER_SERVICIOS],
    siguientes: ['mascotas', 'horarios', 'ubicacion'],
  },
  {
    id: 'horarios',
    claves: ['horario', 'hora', 'check', 'entrada', 'salida', 'llegar tarde', 'llegada', 'time', 'arrival', 'heure', 'arrivee', 'depart', 'horario', 'chegada', 'saida', '체크인', '체크아웃', '시간', '入住', '退房', '时间'],
    pregunta: { es: 'Horarios de llegada y salida', en: 'Check-in and check-out', fr: "Horaires d'arrivée et de départ", pt: 'Horários de entrada e saída', ko: '체크인·체크아웃 시간', zh: '入住和退房时间' },
    respuesta: {
      es: 'Check-in de 3:00 p.m. a 10:00 p.m. y check-out hasta las 12:00 m. Pasadías de 10:00 a.m. a 8:00 p.m. y grupos de trabajo de 8:00 a.m. a 6:00 p.m. Atendemos las 24 horas: si llegas tarde, avísanos.',
      en: 'Check-in from 3:00 p.m. to 10:00 p.m. and check-out by 12:00 noon. Day passes from 10:00 a.m. to 8:00 p.m. and work groups from 8:00 a.m. to 6:00 p.m. We are available 24/7: if you arrive late, let us know.',
      fr: "Arrivée de 15 h à 22 h et départ avant 12 h. Journées de 10 h à 20 h et groupes de travail de 8 h à 18 h. Nous sommes joignables 24 h/24 : si vous arrivez tard, prévenez-nous.",
      pt: 'Check-in das 15h às 22h e check-out até as 12h. Day use das 10h às 20h e grupos de trabalho das 8h às 18h. Atendemos 24 horas: se chegar tarde, avise-nos.',
      ko: '체크인 오후 3시~10시, 체크아웃 정오 12시까지입니다. 데이유즈는 오전 10시~오후 8시, 워크숍 단체는 오전 8시~오후 6시입니다. 24시간 응대하니 늦게 도착하시면 미리 알려주세요.',
      zh: '入住时间为下午 3:00 至晚上 10:00，退房时间为中午 12:00 前。日间套餐为上午 10:00 至晚上 8:00，工作团体为上午 8:00 至下午 6:00。我们 24 小时服务，如晚到请提前告知。',
    },
    acciones: [VER_CONTACTO],
    siguientes: ['ubicacion', 'reservar'],
  },
  {
    id: 'ubicacion',
    claves: ['donde', 'ubica', 'direccion', 'llegar', 'mapa', 'filandia', 'where', 'location', 'address', 'map', 'adresse', 'carte', 'onde', 'endereco', 'localiza', '위치', '주소', '어디', '地址', '位置', '在哪'],
    pregunta: { es: '¿Dónde están ubicados?', en: 'Where are you located?', fr: 'Où êtes-vous situés ?', pt: 'Onde ficam?', ko: '위치가 어디인가요?', zh: '你们在哪里？' },
    respuesta: {
      es: `Estamos en ${CONTACTO.direccion}, en el corazón del Paisaje Cultural Cafetero.`,
      en: `We are at ${CONTACTO.direccion}, Colombia, in the heart of the Coffee Cultural Landscape.`,
      fr: `Nous sommes au ${CONTACTO.direccion}, Colombie, au cœur du Paysage culturel du café.`,
      pt: `Estamos na ${CONTACTO.direccion}, Colômbia, no coração da Paisagem Cultural do Café.`,
      ko: `주소는 콜롬비아 ${CONTACTO.direccion}이며, 커피 문화 경관 지역의 중심에 있습니다.`,
      zh: `我们位于哥伦比亚 ${CONTACTO.direccion}，地处咖啡文化景观区的中心。`,
    },
    acciones: [VER_CONTACTO],
    siguientes: ['horarios', 'contacto'],
  },
  {
    id: 'contacto',
    claves: ['contact', 'telefono', 'llamar', 'celular', 'correo', 'email', 'whatsapp', 'hablar', 'phone', 'call', 'mail', 'telephone', 'appeler', 'ligar', 'falar', '연락', '전화', '이메일', '联系', '电话', '邮件'],
    pregunta: { es: 'Hablar con una persona', en: 'Talk to a person', fr: 'Parler à quelqu’un', pt: 'Falar com uma pessoa', ko: '직원과 연락하기', zh: '联系工作人员' },
    respuesta: {
      es: `Con gusto te atendemos personalmente. Teléfonos: ${CONTACTO.telefonos.map(t => t.texto).join(' y ')}. Correo: ${CONTACTO.correo}. También puedes escribirnos desde el formulario de contacto.`,
      en: `We'll be happy to help you personally. Phones: ${CONTACTO.telefonos.map(t => t.texto).join(' and ')}. Email: ${CONTACTO.correo}. You can also write to us through the contact form.`,
      fr: `Nous serons ravis de vous aider personnellement. Téléphones : ${CONTACTO.telefonos.map(t => t.texto).join(' et ')}. E-mail : ${CONTACTO.correo}. Vous pouvez aussi utiliser le formulaire de contact.`,
      pt: `Teremos prazer em atendê-lo pessoalmente. Telefones: ${CONTACTO.telefonos.map(t => t.texto).join(' e ')}. E-mail: ${CONTACTO.correo}. Você também pode usar o formulário de contato.`,
      ko: `직접 도와드리겠습니다. 전화: ${CONTACTO.telefonos.map(t => t.texto).join(', ')}. 이메일: ${CONTACTO.correo}. 문의 양식으로도 연락하실 수 있습니다.`,
      zh: `我们很乐意为您提供人工服务。电话：${CONTACTO.telefonos.map(t => t.texto).join('、')}。邮箱：${CONTACTO.correo}。您也可以通过联系表单留言。`,
    },
    acciones: [VER_CONTACTO, LLAMAR, CORREO],
  },
  {
    id: 'pagos',
    claves: ['pago', 'pagar', 'tarjeta', 'pse', 'nequi', 'efectivo', 'wompi', 'payment', 'pay', 'card', 'cash', 'paiement', 'payer', 'carte', 'pagamento', 'cartao', '결제', '카드', '현금', '付款', '支付', '信用卡'],
    pregunta: { es: 'Formas de pago', en: 'Payment methods', fr: 'Moyens de paiement', pt: 'Formas de pagamento', ko: '결제 방법', zh: '付款方式' },
    respuesta: {
      es: 'El pago se hace en línea con Wompi, de forma segura: tarjeta débito o crédito, PSE, Nequi y otros medios. Tus datos bancarios nunca pasan por nuestro sistema.',
      en: 'Payment is made online and securely with Wompi: debit or credit card, PSE, Nequi and other methods. Your bank details never go through our system.',
      fr: 'Le paiement se fait en ligne en toute sécurité avec Wompi : carte de débit ou de crédit, PSE, Nequi et autres. Vos données bancaires ne passent jamais par notre système.',
      pt: 'O pagamento é feito online com segurança pela Wompi: cartão de débito ou crédito, PSE, Nequi e outros meios. Seus dados bancários nunca passam pelo nosso sistema.',
      ko: '결제는 Wompi를 통해 온라인으로 안전하게 진행됩니다. 체크·신용카드, PSE, Nequi 등을 사용할 수 있으며, 고객님의 금융 정보는 저희 시스템을 거치지 않습니다.',
      zh: '通过 Wompi 在线安全付款：支持借记卡或信用卡、PSE、Nequi 等方式。您的银行信息不会经过我们的系统。',
    },
    acciones: [IR_RESERVAR],
    siguientes: ['reservar', 'cancelacion'],
  },
  {
    id: 'mascotas',
    claves: ['mascota', 'perro', 'gato', 'pet', 'dog', 'cat', 'animal', 'chien', 'cachorro', 'gato', '반려', '강아지', '고양이', '宠物', '狗', '猫'],
    pregunta: { es: '¿Aceptan mascotas?', en: 'Are pets allowed?', fr: 'Acceptez-vous les animaux ?', pt: 'Aceitam pets?', ko: '반려동물 동반 가능한가요?', zh: '可以带宠物吗？' },
    respuesta: {
      es: 'Sí, somos pet friendly. Máximo una mascota por reserva, bajo responsabilidad del propietario y con correa en las zonas comunes. Puede aplicar un cargo adicional de limpieza.',
      en: "Yes, we're pet friendly. Maximum one pet per booking, under the owner's responsibility and on a leash in common areas. An extra cleaning fee may apply.",
      fr: "Oui, les animaux sont les bienvenus. Un animal maximum par réservation, sous la responsabilité du propriétaire et en laisse dans les espaces communs. Des frais de ménage peuvent s'appliquer.",
      pt: 'Sim, somos pet friendly. No máximo um pet por reserva, sob responsabilidade do tutor e com coleira nas áreas comuns. Pode haver taxa extra de limpeza.',
      ko: '네, 반려동물 동반이 가능합니다. 예약당 1마리까지, 보호자 책임 하에 공용 공간에서는 목줄을 착용해야 합니다. 추가 청소비가 발생할 수 있습니다.',
      zh: '可以，我们欢迎宠物。每次预订限带一只宠物，由主人负责看管，在公共区域需系牵引绳。可能会收取额外清洁费。',
    },
    acciones: [VER_SERVICIOS],
    siguientes: ['servicios', 'reservar'],
  },
  {
    id: 'grupos',
    claves: ['grupo', 'familia', 'piso completo', 'casa completa', 'toda la casa', 'muchas personas', 'amigos', 'group', 'family', 'whole house', 'entire', 'famille', 'groupe', 'maison entiere', 'familia', 'casa toda', '단체', '가족', '집 전체', '团体', '家庭', '整栋'],
    pregunta: { es: 'Viajo en grupo grande', en: "We're a large group", fr: 'Nous sommes un grand groupe', pt: 'Viajo em grupo grande', ko: '단체로 여행해요', zh: '我们是大团体' },
    respuesta: {
      es: 'Para grupos te conviene un piso completo (hasta 8 o 12 personas) o la casa completa (hasta 20 personas), con privacidad para ustedes. La tarifa es por persona, desde {familiar} cada noche, así que el precio depende de cuántos vienen y no del espacio. En el reservador te recomendamos la opción que mejor se ajusta a tu grupo.',
      en: 'For groups, a whole floor (up to 8 or 12 people) or the entire house (up to 20 people) gives you privacy. The rate is per person, from {familiar} per night, so the price depends on how many of you are coming, not on the space. The booking tool recommends the option that best fits your group.',
      fr: 'Pour les groupes, un étage entier (jusqu’à 8 ou 12 personnes) ou toute la maison (jusqu’à 20 personnes) vous offre de l’intimité. Le tarif est par personne, à partir de {familiar} la nuit : le prix dépend du nombre de personnes, pas de l’espace. L’outil de réservation vous recommande l’option la plus adaptée à votre groupe.',
      pt: 'Para grupos, vale a pena um andar inteiro (até 8 ou 12 pessoas) ou a casa toda (até 20 pessoas), com privacidade. A tarifa é por pessoa, a partir de {familiar} por noite, então o preço depende de quantas pessoas vêm e não do espaço. Na reserva recomendamos a opção que melhor se ajusta ao seu grupo.',
      ko: '단체라면 한 층 전체(8명 또는 12명)나 집 전체(최대 20명)를 프라이빗하게 이용하시는 것을 추천합니다. 요금은 1인 1박 {familiar}부터로, 공간이 아니라 인원에 따라 달라집니다. 예약 화면에서 단체에 가장 잘 맞는 옵션을 추천해 드립니다.',
      zh: '团体出行建议预订整层（最多 8 或 12 人）或整栋房子（最多 20 人），私密性更好。价格按人计算，每人每晚 {familiar} 起，因此价格取决于人数而不是空间。预订页面会为您推荐最适合团体的方案。',
    },
    acciones: [IR_RESERVAR],
    siguientes: ['precios', 'pasadia'],
  },
  {
    id: 'ninos',
    claves: ['nino', 'bebe', 'hijo', 'menor', 'child', 'kid', 'baby', 'enfant', 'bebe', 'crianca', 'filho', '아이', '어린이', '아기', '儿童', '孩子', '婴儿'],
    pregunta: { es: '¿Cuánto pagan los niños?', en: 'Do children pay?', fr: 'Les enfants paient-ils ?', pt: 'Crianças pagam?', ko: '어린이 요금은?', zh: '儿童怎么收费？' },
    respuesta: {
      es: 'Bebés de 0 a 3 años no pagan (duermen con sus papás). Niños de 4 a 10 años pagan el 60 % de la tarifa, y desde los 11 años pagan tarifa completa.',
      en: 'Babies 0–3 stay free (they sleep with their parents). Children 4–10 pay 60% of the rate, and from age 11 they pay the full rate.',
      fr: "Les bébés de 0 à 3 ans ne paient pas (ils dorment avec leurs parents). Les enfants de 4 à 10 ans paient 60 % du tarif, et dès 11 ans le tarif complet.",
      pt: 'Bebês de 0 a 3 anos não pagam (dormem com os pais). Crianças de 4 a 10 anos pagam 60% da tarifa, e a partir dos 11 anos pagam tarifa cheia.',
      ko: '0~3세 아기는 무료입니다(부모님과 함께 취침). 4~10세 어린이는 요금의 60%, 11세부터는 성인 요금입니다.',
      zh: '0–3 岁婴儿免费（与父母同睡）。4–10 岁儿童按 60% 收费，11 岁及以上按全价收费。',
    },
    acciones: [IR_RESERVAR],
    siguientes: ['precios', 'reservar'],
  },
  {
    id: 'temporadas',
    claves: ['temporada', 'temporada alta', 'festivo', 'fin de semana', 'season', 'holiday', 'weekend', 'saison', 'temporada', 'feriado', '시즌', '성수기', '주말', '季节', '旺季', '周末'],
    pregunta: { es: '¿Cómo funcionan las temporadas?', en: 'How do seasons work?', fr: 'Comment fonctionnent les saisons ?', pt: 'Como funcionam as temporadas?', ko: '시즌 요금은 어떻게 되나요?', zh: '季节价格如何计算？' },
    respuesta: {
      es: 'Temporada alta: del 15 de diciembre al 15 de enero, del 15 de junio al 15 de julio y Semana Santa. Temporada media: fines de semana y festivos. El resto del año es temporada baja, la más económica. En el calendario de reservas cada día muestra su temporada.',
      en: 'High season: Dec 15–Jan 15, Jun 15–Jul 15 and Holy Week. Mid season: weekends and public holidays. The rest of the year is low season, the most affordable. In the booking calendar each day shows its season.',
      fr: "Haute saison : du 15 décembre au 15 janvier, du 15 juin au 15 juillet et la Semaine sainte. Moyenne saison : week-ends et jours fériés. Le reste de l'année est la basse saison, la plus économique. Le calendrier de réservation indique la saison de chaque jour.",
      pt: 'Alta temporada: de 15 de dezembro a 15 de janeiro, de 15 de junho a 15 de julho e Semana Santa. Média: fins de semana e feriados. O resto do ano é baixa temporada, a mais econômica. No calendário de reservas cada dia mostra sua temporada.',
      ko: '성수기: 12월 15일~1월 15일, 6월 15일~7월 15일, 부활절 주간. 준성수기: 주말 및 공휴일. 그 외 기간은 가장 저렴한 비수기입니다. 예약 달력에서 날짜별 시즌을 확인할 수 있습니다.',
      zh: '旺季：12 月 15 日至 1 月 15 日、6 月 15 日至 7 月 15 日以及圣周。平季：周末和法定节假日。其余时间为淡季，价格最优惠。预订日历中每天都会显示对应季节。',
    },
    acciones: [IR_RESERVAR],
    siguientes: ['precios', 'reservar'],
  },
  {
    id: 'pasadia',
    claves: ['pasadia', 'dia de campo', 'cumpleanos', 'evento', 'reunion', 'celebra', 'trabajo', 'empresa', 'taller', 'day pass', 'day use', 'event', 'party', 'meeting', 'birthday', 'journee', 'evenement', 'reuniao', 'festa', '데이', '행사', '모임', '생일', '日间', '活动', '聚会', '会议'],
    pregunta: { es: 'Pasadías y eventos', en: 'Day passes and events', fr: 'Journées et événements', pt: 'Day use e eventos', ko: '데이유즈 및 행사', zh: '日间套餐与活动' },
    respuesta: {
      es: 'Ofrecemos pasadías para cumpleaños, reuniones y planes de día (10:00 a.m. a 8:00 p.m., desde {pasadia} por persona) y jornadas para grupos de trabajo con proyector y tablero (8:00 a.m. a 6:00 p.m., desde {grupal} por persona).',
      en: 'We offer day passes for birthdays, gatherings and day plans (10:00 a.m.–8:00 p.m., from {pasadia} per person) and workdays for teams with a projector and whiteboard (8:00 a.m.–6:00 p.m., from {grupal} per person).',
      fr: 'Nous proposons des journées pour anniversaires, réunions et sorties (10 h–20 h, à partir de {pasadia} par personne) et des journées de travail pour équipes avec projecteur et tableau (8 h–18 h, à partir de {grupal} par personne).',
      pt: 'Oferecemos day use para aniversários, encontros e passeios (10h–20h, a partir de {pasadia} por pessoa) e jornadas para equipes de trabalho com projetor e quadro (8h–18h, a partir de {grupal} por pessoa).',
      ko: '생일, 모임 등을 위한 데이유즈(오전 10시~오후 8시, 1인 {pasadia}부터)와 프로젝터·화이트보드를 갖춘 워크숍 단체 이용(오전 8시~오후 6시, 1인 {grupal}부터)을 제공합니다.',
      zh: '我们提供适合生日、聚会等的日间套餐（上午 10:00 至晚上 8:00，每人 {pasadia} 起），以及配备投影仪和白板的团队工作日套餐（上午 8:00 至下午 6:00，每人 {grupal} 起）。',
    },
    acciones: [IR_RESERVAR],
    siguientes: ['grupos', 'servicios'],
  },
  {
    id: 'cancelacion',
    claves: ['cancel', 'cancelar', 'cancelo', 'cancela', 'reembolso', 'devolu', 'cambiar fecha', 'modificar', 'refund', 'change date', 'annul', 'rembours', 'reembolso', '취소', '환불', '取消', '退款'],
    pregunta: { es: 'Cancelar o cambiar mi reserva', en: 'Cancel or change my booking', fr: 'Annuler ou modifier ma réservation', pt: 'Cancelar ou alterar reserva', ko: '예약 취소·변경', zh: '取消或更改预订' },
    respuesta: {
      es: 'Para cancelar o cambiar las fechas de una reserva, escríbenos o llámanos con tu código de reserva y te ayudamos personalmente con las condiciones de tu caso.',
      en: 'To cancel or change the dates of a booking, write or call us with your booking code and we will help you personally with the conditions for your case.',
      fr: "Pour annuler ou modifier les dates d'une réservation, écrivez-nous ou appelez-nous avec votre code de réservation : nous vous aiderons personnellement selon votre situation.",
      pt: 'Para cancelar ou mudar as datas de uma reserva, escreva ou ligue para nós com o código da reserva e ajudaremos pessoalmente com as condições do seu caso.',
      ko: '예약 취소나 날짜 변경은 예약 번호와 함께 연락 주시면 고객님의 상황에 맞는 조건을 직접 안내해 드립니다.',
      zh: '如需取消或更改预订日期，请携带预订编号联系我们，我们会根据您的情况亲自为您说明相关条件。',
    },
    acciones: [VER_CONTACTO, LLAMAR],
  },
  {
    id: 'accesibilidad',
    claves: ['accesib', 'discapacidad', 'sordo', 'silla de ruedas', 'lector', 'disab', 'deaf', 'wheelchair', 'accessib', 'handicap', 'sourd', 'acessib', 'deficien', '장애', '접근성', '청각', '无障碍', '残疾', '听障'],
    pregunta: { es: 'Accesibilidad', en: 'Accessibility', fr: 'Accessibilité', pt: 'Acessibilidade', ko: '접근성', zh: '无障碍' },
    respuesta: {
      es: 'Todo en este sitio se puede hacer por escrito, sin necesidad de llamar: reservar, pagar y escribirnos. Funciona con teclado y lectores de pantalla, y en el botón de accesibilidad de la barra superior puedes agrandar el texto o aumentar el contraste. Si necesitas algo especial durante tu estadía, cuéntanos.',
      en: 'Everything on this site can be done in writing, no calls needed: booking, paying and contacting us. It works with keyboard and screen readers, and with the accessibility button in the top bar you can enlarge text or increase contrast. If you need anything special during your stay, let us know.',
      fr: "Tout sur ce site peut se faire par écrit, sans appeler : réserver, payer et nous écrire. Il fonctionne au clavier et avec les lecteurs d'écran, et le bouton d'accessibilité de la barre supérieure permet d'agrandir le texte ou d'augmenter le contraste. Si vous avez un besoin particulier pendant votre séjour, dites-le-nous.",
      pt: 'Tudo neste site pode ser feito por escrito, sem ligar: reservar, pagar e falar conosco. Funciona com teclado e leitores de tela, e no botão de acessibilidade da barra superior você pode aumentar o texto ou o contraste. Se precisar de algo especial na estadia, conte-nos.',
      ko: '이 사이트의 모든 기능(예약, 결제, 문의)은 전화 없이 글로 이용할 수 있습니다. 키보드와 화면 낭독기로 사용할 수 있으며, 상단의 접근성 버튼으로 글자 크기나 대비를 높일 수 있습니다. 숙박 중 필요한 것이 있으면 알려주세요.',
      zh: '本网站的所有操作（预订、付款、联系我们）都可以通过文字完成，无需打电话。网站支持键盘和读屏软件，您还可以通过顶部的无障碍按钮放大文字或提高对比度。入住期间如有特殊需求，请告诉我们。',
    },
    acciones: [VER_CONTACTO],
  },
  {
    id: 'gracias',
    claves: ['gracias', 'chao', 'adios', 'perfecto', 'thank', 'thanks', 'bye', 'merci', 'au revoir', 'obrigad', 'tchau', '감사', '고마', '谢谢', '再见'],
    pregunta: { es: 'Gracias', en: 'Thanks', fr: 'Merci', pt: 'Obrigado', ko: '감사합니다', zh: '谢谢' },
    respuesta: {
      es: '¡Con mucho gusto! Te esperamos en Filandia. Si tienes otra pregunta, aquí estoy.',
      en: "You're welcome! We look forward to seeing you in Filandia. If you have another question, I'm here.",
      fr: 'Avec plaisir ! Nous vous attendons à Filandia. Pour toute autre question, je suis là.',
      pt: 'Por nada! Esperamos você em Filandia. Se tiver outra pergunta, estou aqui.',
      ko: '천만에요! 필란디아에서 뵙기를 기다리겠습니다. 다른 질문이 있으면 언제든 물어보세요.',
      zh: '不客气！期待在菲兰迪亚与您相见。如有其他问题，随时问我。',
    },
    acciones: [IR_RESERVAR],
  },
  {
    id: 'saludo',
    claves: ['hola', 'buenas', 'buenos dias', 'hello', 'hi', 'hey', 'bonjour', 'salut', 'ola', 'oi', 'bom dia', '안녕', '你好', '您好'],
    pregunta: { es: 'Hola', en: 'Hello', fr: 'Bonjour', pt: 'Olá', ko: '안녕하세요', zh: '你好' },
    respuesta: {
      es: '¡Hola! Cuéntame qué necesitas o elige una de las preguntas de abajo.',
      en: 'Hi! Tell me what you need or choose one of the questions below.',
      fr: 'Bonjour ! Dites-moi ce dont vous avez besoin ou choisissez une question ci-dessous.',
      pt: 'Olá! Conte o que precisa ou escolha uma das perguntas abaixo.',
      ko: '안녕하세요! 필요한 것을 말씀해 주시거나 아래 질문 중 하나를 선택하세요.',
      zh: '您好！请告诉我您的需求，或选择下面的问题。',
    },
  },
];

/** Preguntas que se sugieren al abrir el asistente. */
export const SUGERENCIAS_INICIALES = ['habitaciones', 'precios', 'servicios', 'reservar'];
/** Preguntas que se sugieren cuando no se entendió la consulta. */
export const SUGERENCIAS_AYUDA = ['precios', 'reservar', 'horarios', 'contacto'];
