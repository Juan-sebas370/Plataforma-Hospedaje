import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContactoRequest {
  nombre:    string;
  email:     string;
  telefono?: string;
  asunto:    string;
  mensaje:   string;
  categoria?: string;
}

export interface ContactoResponse {
  id:             number;
  estado:         string;
  fechaCreacion:  string;
  mensaje:        string;
}

@Injectable({ providedIn: 'root' })
export class ContactoService {
  private apiUrl = `${environment.apiUrl}/contactos`;

  constructor(private http: HttpClient) {}

  enviar(data: ContactoRequest): Observable<ContactoResponse> {
    return this.http.post<ContactoResponse>(this.apiUrl, data);
  }
}
