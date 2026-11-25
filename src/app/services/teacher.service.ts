import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { RespuestaLogin } from './auth.service';
import { TeacherModel } from '../models/teacher';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  private readonly apiUrl = `${environment.apiUrl}/profesores`;
  private lista: TeacherModel[] = [];

  constructor(private http: HttpClient) {}

  async inicializarDatos(): Promise<TeacherModel[]> {
    return this.cargar();
  }

  async cargar(): Promise<TeacherModel[]> {
    this.lista = await firstValueFrom(
      this.http.get<TeacherModel[]>(this.apiUrl)
    );
    return this.lista;
  }

  getDocentes(): TeacherModel[] {
    return this.lista;
  }

  async existeIdentificacion(identificacion: string): Promise<boolean> {
    await this.cargar();
    return this.lista.some(d => d.identificacion === identificacion);
  }

  async agregar(docente: TeacherModel): Promise<TeacherModel> {
    const creado = await firstValueFrom(
      this.http.post<TeacherModel>(this.apiUrl, this.limpiar(docente))
    );
    await this.cargar();
    return creado;
  }

  async actualizar(id: number, docente: TeacherModel): Promise<TeacherModel> {
    const actualizado = await firstValueFrom(
      this.http.patch<TeacherModel>(`${this.apiUrl}/${id}`, this.limpiar(docente))
    );
    await this.cargar();
    return actualizado;
  }

  async eliminar(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
    await this.cargar();
  }

  async login(identificacion: string, password: string): Promise<RespuestaLogin<TeacherModel>> {
    return firstValueFrom(
      this.http.post<RespuestaLogin<TeacherModel>>(`${this.apiUrl}/login`, { identificacion, password })
    );
  }

  private limpiar(docente: TeacherModel) {
    const payload: any = {
      nombre: docente.nombre,
      identificacion: docente.identificacion,
      correo: docente.correo,
      titulo: docente.titulo,
      estado: docente.estado
    };
    if (docente.password) payload.password = docente.password;
    return payload;
  }
}
