import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Habitaciones } from './components/habitaciones/habitaciones';
import { HabitacionDetalle } from './components/habitaciones/habitacion-detalle';
import { Reservas } from './components/reservas/reservas';
import { Servicios } from './components/servicios/servicios';
import { Contacto } from './components/contacto/contacto';
import { Galeria } from './components/galeria/galeria';
import { Confirmacion } from './components/confirmacion/confirmacion';
import { Perfil } from './components/perfil/perfil';
import { CambiarContrasena } from './components/cambiar-contrasena/cambiar-contrasena';
import { ChatSoporte } from './components/chat-soporte/chat-soporte';
import { Pagos } from './components/pagos/pagos';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'inicio', component: Home },
  { path: 'habitaciones/:id', component: HabitacionDetalle },
  { path: 'habitaciones', component: Habitaciones, pathMatch: 'full' },
  { path: 'galeria', component: Galeria },
  { path: 'reservas', component: Reservas },
  { path: 'servicios', component: Servicios },
  { path: 'contacto', component: Contacto },
  { path: 'confirmacion', component: Confirmacion },
  { path: 'perfil', component: Perfil },
  { path: 'cambiar-contrasena', component: CambiarContrasena },
  { path: 'chat-soporte', component: ChatSoporte },
  { path: 'pagos', component: Pagos },
  { path: '**', redirectTo: '' }
];
