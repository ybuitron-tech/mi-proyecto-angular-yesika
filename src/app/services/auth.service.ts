import { Injectable } from '@angular/core';

export interface SesionActiva {
  tipo: 'estudiante' | 'docente';
  data: any;
}

export interface RespuestaLogin<T> {
  access_token: string;
  token_type: string;
  expires_in: number;
  estudiante?: T;
  docente?: T;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'usuarioActivo';

  guardarToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  guardarSesion(sesion: SesionActiva): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(sesion));
  }

  obtenerSesion(): SesionActiva | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SesionActiva;
    } catch {
      return null;
    }
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken() && !!this.obtenerSesion();
  }

  cerrarSesion(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('evaluacionActiva');
  }
}
