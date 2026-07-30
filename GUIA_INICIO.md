# 🏨 HOSPEDJE SEBASTIAN - Guía de Inicio Rápido

¡Tu proyecto de Hospedaje ha sido creado exitosamente! 🎉

## 📋 Lo que se ha creado:

### ✅ Backend (Node.js + Express)
- ✓ Servidor Express configurado
- ✓ Rutas API básicas
- ✓ Middlewares CORS y JSON
- ✓ Variables de entorno (.env)
- ✓ Estructura lista para MongoDB

### ✅ Frontend (Angular 17+)
- ✓ Proyecto Angular con SSR
- ✓ Componente **Nav** (Navegación bonita con gradiente)
- ✓ Componente **Footer** (Pie de página con información)
- ✓ Componente **Home** (Página principal completa)
- ✓ Rutas configuradas
- ✓ Estilos globales aplicados

## 🚀 Cómo ejecutar el proyecto:

### Frontend (Angular):
```bash
cd frontend
ng serve
```
- Abre tu navegador en: http://localhost:4200

### Backend (Node.js):
```bash
cd backend
npm install
npm run dev
```
- El servidor correrá en: http://localhost:3000

## 📁 Estructura del Proyecto:

```
HOSPEDJE-SEBASTIAN/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── nav/          ← Navegación
│   │   │   │   ├── footer/       ← Pie de página
│   │   │   │   └── home/         ← Página principal
│   │   │   ├── app.ts
│   │   │   ├── app.html
│   │   │   ├── app.css
│   │   │   └── app.routes.ts     ← Rutas
│   │   ├── styles.css            ← Estilos globales
│   │   └── index.html
│   └── package.json
│
├── backend/
│   ├── server.js                 ← Servidor principal
│   ├── package.json
│   ├── .env.example              ← Ejemplo de variables
│   └── README.md
│
└── README.md

```

## 🎨 Características del Diseño:

### Navegación (Nav):
- 🎨 Gradiente violeta moderno
- 📱 Responsive
- 🔗 Links: Inicio, Habitaciones, Reservas, Servicios, Contacto
- 🔘 Botones de Login y Registro

### Home (Inicio):
- 🌟 Hero section con call-to-action
- 📦 4 tarjetas de características
- 🛠️ Sección de servicios
- 💰 Call-to-action final con descuento

### Footer:
- ℹ️ Información del hospedaje
- 🔗 Enlaces rápidos
- 📞 Información de contacto
- ⏰ Horarios de check-in/check-out

## 🛠️ Próximos Pasos:

1. **Instalar dependencias del backend:**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar variables de entorno:**
   - Copia `.env.example` a `.env`
   - Configura tu base de datos

3. **Ejecutar el proyecto:**
   - Backend: `npm run dev`
   - Frontend: `ng serve`

4. **Agregar más componentes:**
   ```bash
   ng generate component components/nombre-componente
   ```

5. **Crear más rutas en el backend:**
   - Crear carpeta `routes/`
   - Agregar rutas para habitaciones, reservas, etc.

## 📚 Tecnología utilizada:

- **Frontend:** Angular 17, TypeScript, CSS3
- **Backend:** Node.js, Express, JWT
- **Base de Datos:** MongoDB (por configurar)
- **Estilos:** CSS puro con gradientes y animaciones

## 🎯 Componentes incluyen:

- ✨ Animaciones CSS
- 📱 Diseño responsive
- 🎨 Gradientes modernos
- 🔄 Efectos hover suaves
- 📦 Diseño tipo card

## 💡 Consejos:

1. El servidor Angular usa el puerto **4200**
2. El servidor Backend usa el puerto **3000**
3. Los componentes Angular están en `frontend/src/app/components/`
4. Los estilos globales están en `frontend/src/styles.css`

## 📞 Soporte:

Si necesitas agregar más funciones:
- Componentes de habitaciones
- Sistema de reservas
- Panel de administración
- Galería de fotos
- Sistema de pagos

¡Solo pídemelo y lo implementamos! 🚀

---
**Desarrollado por:** Sebastian
**Fecha:** Febrero 2026
**Versión:** 1.0.0
