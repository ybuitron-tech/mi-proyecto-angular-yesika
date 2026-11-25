import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { StudentModel } from '../models/student';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private readonly apiUrl = `${environment.apiUrl}/estudiantes`;
  private lista: StudentModel[] = [];

  constructor(private http: HttpClient) {}

  async cargar(): Promise<StudentModel[]> {
    this.lista = await firstValueFrom(
      this.http.get<StudentModel[]>(this.apiUrl)
    );
    return this.lista;
  }

  getEstudiantes(): StudentModel[] {
    return this.lista;
  }

  async existeIdentificacion(identificacion: string): Promise<boolean> {
    await this.cargar();
    return this.lista.some(est => est.identificacion === identificacion);
  }

  async registrar(estudiante: StudentModel): Promise<StudentModel> {
    const creado = await firstValueFrom(
      this.http.post<StudentModel>(this.apiUrl, this.limpiar(estudiante))
    );
    await this.cargar();
    return creado;
  }

  async actualizar(id: number, estudiante: StudentModel): Promise<StudentModel> {
    const actualizado = await firstValueFrom(
      this.http.patch<StudentModel>(`${this.apiUrl}/${id}`, this.limpiar(estudiante))
    );
    await this.cargar();
    return actualizado;
  }

  async eliminar(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
    await this.cargar();
  }

  async login(identificacion: string, password: string): Promise<StudentModel> {
    return firstValueFrom(
      this.http.post<StudentModel>(`${this.apiUrl}/login`, { identificacion, password })
    );
  }

  // El backend no acepta nota/estadoResultado (son solo de la UI).
  private limpiar(estudiante: StudentModel) {
    const payload: any = {
      nombre: estudiante.nombre,
      apellido: estudiante.apellido,
      identificacion: estudiante.identificacion,
      correo: estudiante.correo,
      estado: estudiante.estado
    };
    if (estudiante.password) payload.password = estudiante.password;
    return payload;
  }
}
