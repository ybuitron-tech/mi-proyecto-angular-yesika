import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ScaleModel } from '../models/scales';

@Injectable({
  providedIn: 'root'
})
export class ScaleService {

  private readonly apiUrl = `${environment.apiUrl}/escalas`;
  private KEY = 'escalas';
  private lista: ScaleModel[] = [];

  private escalasBase: ScaleModel[] = [
    { nombre: '0 - 5', min: 0, max: 5 },
    { nombre: '0 - 3', min: 0, max: 3 },
    { nombre: '0 - 100', min: 0, max: 100 }
  ];

  constructor(private http: HttpClient) {}

  /** Carga las escalas desde la API; si falla, usa la caché/base local. */
  async inicializar(): Promise<ScaleModel[]> {
    try {
      const data = await firstValueFrom(this.http.get<ScaleModel[]>(this.apiUrl));
      this.lista = data && data.length ? data : [...this.escalasBase];
    } catch (error) {
      console.warn('No se pudieron cargar las escalas de la API; se usa caché local', error);
      this.lista = this.leerLocal();
    }
    this.guardarLocal();
    return this.lista;
  }

  getEscalas(): ScaleModel[] {
    if (!this.lista.length) this.lista = this.leerLocal();
    return this.lista;
  }

  async agregarEscala(escala: ScaleModel): Promise<ScaleModel> {
    let creada: ScaleModel = { ...escala };
    try {
      creada = await firstValueFrom(this.http.post<ScaleModel>(this.apiUrl, escala));
    } catch (error) {
      console.warn('No se pudo guardar la escala en la API; se guarda solo en local', error);
    }
    this.lista = [...this.lista, creada];
    this.guardarLocal();
    return creada;
  }

  async actualizarEscala(index: number, escala: ScaleModel): Promise<void> {
    const actual = this.lista[index];
    let actualizada: ScaleModel = { ...escala, id: actual?.id };

    try {
      if (actual?.id) {
        actualizada = await firstValueFrom(
          this.http.patch<ScaleModel>(`${this.apiUrl}/${actual.id}`, escala)
        );
      }
    } catch (error) {
      console.warn('No se pudo actualizar la escala en la API; se actualiza solo en local', error);
      actualizada = { ...escala, id: actual?.id };
    }

    this.lista[index] = actualizada;
    this.guardarLocal();
  }

  async eliminarEscala(index: number): Promise<void> {
    const escala = this.lista[index];
    try {
      if (escala?.id) {
        await firstValueFrom(this.http.delete(`${this.apiUrl}/${escala.id}`));
      }
    } catch (error) {
      console.warn('No se pudo eliminar la escala de la API; se elimina solo en local', error);
    }
    this.lista = this.lista.filter((_, i) => i !== index);
    this.guardarLocal();
  }

  private guardarLocal(): void {
    localStorage.setItem(this.KEY, JSON.stringify(this.lista));
  }

  private leerLocal(): ScaleModel[] {
    const data = localStorage.getItem(this.KEY);
    if (!data) return [...this.escalasBase];
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length ? parsed : [...this.escalasBase];
    } catch {
      return [...this.escalasBase];
    }
  }
}
