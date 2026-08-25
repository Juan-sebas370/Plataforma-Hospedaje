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
    renderMode: RenderMode.Server
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
  // Routes with form-based components - use SSR without prerendering
  {
    path: 'reservas',
    renderMode: RenderMode.Server
  },
  {
    path: 'contacto',
    renderMode: RenderMode.Server
  },
  {
    path: 'confirmacion',
    renderMode: RenderMode.Server
  },
  {
    path: 'perfil',
    renderMode: RenderMode.Server
  },
  {
    path: 'cambiar-contrasena',
    renderMode: RenderMode.Server
  },
  {
    path: 'chat-soporte',
    renderMode: RenderMode.Server
  },
  {
    path: 'pagos',
    renderMode: RenderMode.Server
  },
  // Catch all other routes
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
