import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '', // Home page
    renderMode: RenderMode.Prerender
  },
  {
    path: 'inicio', // Home alias
    renderMode: RenderMode.Prerender
  },
  {
    path: 'habitaciones/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'habitaciones',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'galeria',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'servicios',
    renderMode: RenderMode.Prerender
  },
  // Routes with form-based components: rendered in the browser (static hosting, no Node server)
  {
    path: 'reservas',
    renderMode: RenderMode.Client
  },
  {
    path: 'contacto',
    renderMode: RenderMode.Client
  },
  {
    path: 'confirmacion',
    renderMode: RenderMode.Client
  },
  {
    path: 'perfil',
    renderMode: RenderMode.Client
  },
  {
    path: 'cambiar-contrasena',
    renderMode: RenderMode.Client
  },
  {
    path: 'chat-soporte',
    renderMode: RenderMode.Client
  },
  {
    path: 'pagos',
    renderMode: RenderMode.Client
  },
  // Catch all other routes
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
