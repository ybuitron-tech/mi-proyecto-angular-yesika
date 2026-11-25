import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { QuestionModel } from '../models/question';

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  private readonly apiUrl = `${environment.apiUrl}/preguntas`;
  private KEY = 'evaluacionActiva';

  constructor(private http: HttpClient) {}

  /** Crea una pregunta en el banco de preguntas del backend. */
  async crear(pregunta: QuestionModel): Promise<QuestionModel> {
    return firstValueFrom(
      this.http.post<QuestionModel>(this.apiUrl, this.limpiar(pregunta))
    );
  }

  async actualizar(id: number, pregunta: QuestionModel): Promise<QuestionModel> {
    return firstValueFrom(
      this.http.patch<QuestionModel>(`${this.apiUrl}/${id}`, this.limpiar(pregunta))
    );
  }

  private limpiar(pregunta: QuestionModel) {
    return {
      enunciado: pregunta.enunciado,
      opcionA: pregunta.opcionA || undefined,
      opcionB: pregunta.opcionB || undefined,
      opcionC: pregunta.opcionC || undefined,
      opcionD: pregunta.opcionD || undefined,
      respuesta: pregunta.respuesta,
      tiempo: pregunta.tiempo ?? undefined
    };
  }

  getEvaluacion(): any {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : null;
  }

  guardarEvaluacion(evaluacion: any) {
    localStorage.setItem(this.KEY, JSON.stringify(evaluacion));
  }

  getPreguntas(): QuestionModel[] {
    const evaluacion = this.getEvaluacion();
    return evaluacion?.preguntas || [];
  }

  agregarPregunta(pregunta: QuestionModel) {
    const evaluacion = this.getEvaluacion();
    if (!evaluacion) return;
    evaluacion.preguntas.push(pregunta);
    this.guardarEvaluacion(evaluacion);
  }

  actualizarPregunta(index: number, pregunta: QuestionModel) {
    const evaluacion = this.getEvaluacion();
    if (!evaluacion) return;
    evaluacion.preguntas[index] = pregunta;
    this.guardarEvaluacion(evaluacion);
  }

  eliminarPregunta(index: number) {
    const evaluacion = this.getEvaluacion();
    if (!evaluacion) return;
    evaluacion.preguntas.splice(index, 1);
    this.guardarEvaluacion(evaluacion);
  }

  limpiarEvaluacion() {
    localStorage.removeItem(this.KEY);
  }
}
