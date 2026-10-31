import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { environment } from '../environments/environment';
import { AuthGuard } from './guards/auth.guard';

/** Mientras el hospedaje se formaliza, /reservas y /pagos muestran el aviso de "aún no recibimos reservas". */
const avisoPreparacion = () => import('./components/aviso-preparacion/aviso-preparacion').then(m => m.AvisoPreparacion);

// El inicio se carga de una vez; el resto de páginas se descarga solo cuando
// se visitan (lazy loading), para que el sitio abra más rápido.
export const routes: Routes = [
  { path: '', component: Home, title: 'Inicio' },
  { path: 'inicio', component: Home, title: 'Inicio' },
  {
    path: 'habitaciones/:id', title: 'Detalle de habitación',
    loadComponent: () => import('./components/habitaciones/habitacion-detalle').then(m => m.HabitacionDetalle),
  },
  {
    path: 'habitaciones', pathMatch: 'full', title: 'Habitaciones',
    loadComponent: () => import('./components/habitaciones/habitaciones').then(m => m.Habitaciones),
  },
  { path: 'galeria', title: 'Galería', loadComponent: () => import('./components/galeria/galeria').then(m => m.Galeria) },
  { path: 'reservas', title: 'Reservar', loadComponent: environment.reservasHabilitadas ? () => import('./components/reservas/reservas').then(m => m.Reservas) : avisoPreparacion },
  { path: 'servicios', title: 'Servicios', loadComponent: () => import('./components/servicios/servicios').then(m => m.Servicios) },
  { path: 'contacto', title: 'Contacto', loadComponent: () => import('./components/contacto/contacto').then(m => m.Contacto) },
  {
    path: 'confirmacion', title: 'Reserva confirmada',
    loadComponent: () => import('./components/confirmacion/confirmacion').then(m => m.Confirmacion),
  },
  { path: 'perfil', title: 'Mi perfil', canActivate: [AuthGuard], loadComponent: () => import('./components/perfil/perfil').then(m => m.Perfil) },
  {
    path: 'cambiar-contrasena', title: 'Cambiar contraseña', canActivate: [AuthGuard],
    loadComponent: () => import('./components/cambiar-contrasena/cambiar-contrasena').then(m => m.CambiarContrasena),
  },
  {
    path: 'chat-soporte', title: 'Chat de soporte', canActivate: [AuthGuard],
    loadComponent: () => import('./components/chat-soporte/chat-soporte').then(m => m.ChatSoporte),
  },
  {
    path: 'reset-password', title: 'Restablecer contraseña',
    loadComponent: () => import('./components/restablecer-contrasena/restablecer-contrasena').then(m => m.RestablecerContrasena),
  },
  {
    path: 'politicas', title: 'Políticas y reglamento',
    loadComponent: () => import('./components/politicas/politicas').then(m => m.Politicas),
  },
  { path: 'pagos', title: 'Pago de la reserva', loadComponent: environment.reservasHabilitadas ? () => import('./components/pagos/pagos').then(m => m.Pagos) : avisoPreparacion },
  { path: '**', redirectTo: '' }
];
