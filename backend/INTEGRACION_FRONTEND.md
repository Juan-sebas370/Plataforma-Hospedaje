# 🔗 Guía de Integración Frontend ↔ Backend

## URLs de los Servicios

### Desarrollo
- **Frontend (Angular)**: `http://localhost:4200`
- **Backend (Java)**: `http://localhost:3000/api`
- **Mongo Express**: `http://localhost:8081`

### Cambios Necesarios en el Frontend

El frontend ya debería estar configurado para usar los endpoints, pero verifica:

#### 1. Configurar el `environment` (Angular)

En `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

En `frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-dominio.com/api'  // URL de producción
};
```

#### 2. Servicio de API (Angular)

Crea o actualiza `frontend/src/app/services/api.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  // Auth
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, 
      { email, password });
  }

  registro(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/registro`, data);
  }

  // Habitaciones
  getHabitaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/habitaciones`);
  }

  getHabitacionesDisponibles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/habitaciones/disponibles`);
  }

  getHabitacion(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/habitaciones/${id}`);
  }

  // Reservas
  getReservas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservas`, 
      { headers: this.getHeaders() });
  }

  getReservasPorUsuario(usuarioId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservas/usuario/${usuarioId}`, 
      { headers: this.getHeaders() });
  }

  crearReserva(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas`, data, 
      { headers: this.getHeaders() });
  }

  actualizarReserva(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/reservas/${id}`, data, 
      { headers: this.getHeaders() });
  }

  cancelarReserva(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/reservas/${id}/cancelar`, {}, 
      { headers: this.getHeaders() });
  }
}
```

#### 3. Componente de Login (Ejemplo)

En `frontend/src/app/components/login/login.ts`:

```typescript
import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  
  email: string = '';
  password: string = '';
  error: string = '';
  loading: boolean = false;

  constructor(private apiService: ApiService, private router: Router) {}

  login() {
    this.loading = true;
    this.error = '';

    this.apiService.login(this.email, this.password).subscribe({
      next: (response) => {
        // Guardar token en localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify(response));
        
        // Redirigir al inicio
        this.router.navigate(['/home']);
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al iniciar sesión';
        this.loading = false;
      }
    });
  }
}
```

#### 4. Interceptor para JWT (Recomendado)

Crea `frontend/src/app/interceptors/auth.interceptor.ts`:

```typescript
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('token');

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}
```

Registra el interceptor en `app.config.ts`:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        // ... otros interceptors
      ])
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};
```

## Flujo de Autenticación

```
1. Usuario entra en /login
2. Introduce email y contraseña
3. Frontend envía POST /api/auth/login
4. Backend valida y retorna JWT Token
5. Frontend guarda token en localStorage
6. Frontend incluye token en Authorization header para peticiones autenticadas
7. Backend valida token en cada petición protegida
8. Si todo ok, retorna datos; si no, retorna 401/403
```

## Headers Requeridos

Todas las peticiones a `/api` deben incluir:

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123"
}
```

Peticiones autenticadas:

```
GET /api/reservas
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
Content-Type: application/json
```

## CORS

El backend está configurado para aceptar peticiones desde:
- `http://localhost:4200` (desarrollo)
- `http://localhost:3000` (tests)

Para producción, cambiar en `src/main/java/com/hotelsebasitian/config/CorsConfig.java`.

## Manejo de Errores

Las respuestas pueden ser:

### Success (200)
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "usuario@example.com",
  "nombre": "Juan",
  ...
}
```

### Error (400, 401, 500)
```json
{
  "error": "Descripción del error",
  "message": "Detalles adicionales"
}
```

Implementa en tu componente:

```typescript
this.apiService.getHabitaciones().subscribe({
  next: (habitaciones) => {
    this.habitaciones = habitaciones;
  },
  error: (error) => {
    console.error('Error:', error.status, error.error);
    // Mostrar mensaje de error al usuario
  }
});
```

## Testing

### Con cURL
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Con Postman
1. Importa `Hospedaje_Sebastian_API.postman_collection.json`
2. En la variable `token`, pega el JWT obtenido del login
3. Prueba los endpoints

### Con Angular HttpClient
```typescript
this.http.get('http://localhost:3000/api/habitaciones').subscribe(data => {
  console.log(data);
});
```

## Deployment a Producción

### Frontend (Angular)
```bash
cd frontend
ng build --configuration production
# Los archivos estarán en dist/
```

### Backend (Java)
```bash
cd backend
mvn clean package
# Sube el JAR al servidor y ejecuta:
java -jar hospedaje-sebastian-1.0.0.jar
```

## Variables de Entorno en Producción

**Frontend** (.env):
```
ANGULAR_API_URL=https://api.tudominio.com
```

**Backend** (variables del sistema):
```
JWT_SECRET=tu-secreto-muy-seguro-cambiar-aqui
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/hospedaje_db
SERVER_PORT=8080
```

## Checklist de Integración

- [ ] Frontend compilado y ejecutándose en `http://localhost:4200`
- [ ] Backend compilado y ejecutándose en `http://localhost:3000/api`
- [ ] MongoDB funcionando (`http://localhost:8081`)
- [ ] API `/health` retorna `{status: "OK"}`
- [ ] Puedo registrarme desde el frontend
- [ ] Puedo iniciar sesión desde el frontend
- [ ] Puedo ver las habitaciones
- [ ] Puedo crear una reserva
- [ ] Token JWT se guarda en localStorage
- [ ] Las peticiones incluyen el Authorization header

## Soporte

Si algo no funciona:

1. Verifica que backend está corriendo: `curl http://localhost:3000/api/health`
2. Revisa los logs del backend (consola de Maven)
3. Abre Mongo Express: `http://localhost:8081`
4. Instala la extensión "Redux DevTools" para ver el estado
5. Abre la consola del navegador (F12) para ver errores

¡Lista la integración! 🎉
