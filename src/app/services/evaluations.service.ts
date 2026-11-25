import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { EvaluationModel } from '../models/evaluation';
import { QuestionModel } from '../models/question';
import { QuestionsService } from './questions.service';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {

  private readonly apiUrl = `${environment.apiUrl}/evaluaciones`;
  private readonly LIST_KEY = 'evaluaciones';
  private readonly ACTIVE_KEY = 'evaluacionActiva';
  private lista: EvaluationModel[] = [];

  constructor(
    private http: HttpClient,
    private questionsService: QuestionsService
  ) {}

  /** Carga las evaluaciones desde la API; si falla, usa la caché local. */
  async inicializarEvaluacion(): Promise<EvaluationModel[]> {
    try {
      const data = await firstValueFrom(this.http.get<any[]>(this.apiUrl));
      this.lista = (data || []).map(ev => this.mapear(ev));
    } catch (error) {
      console.warn('No se pudieron cargar las evaluaciones de la API; se usa caché local', error);
      this.lista = this.leerListaLocal();
    }

    localStorage.setItem(this.LIST_KEY, JSON.stringify(this.lista));

    if (!this.getEvaluacion() && this.lista.length) {
      const activa = this.lista.find(e => (e.preguntas?.length || 0) > 0) || this.lista[0];
      localStorage.setItem(this.ACTIVE_KEY, JSON.stringify(activa));
    }

    return this.lista;
  }

  getEvaluaciones(): EvaluationModel[] {
    if (!this.lista.length) this.lista = this.leerListaLocal();
    return this.lista;
  }

  /** Crea la evaluación en la API y la deja como activa. */
  async guardarEvaluacion(evaluacion: EvaluationModel): Promise<EvaluationModel> {
    const payload = {
      nombre: evaluacion.nombre.trim(),
      tipo: evaluacion.tipo,
      cantidad: Number(evaluacion.cantidad),
      docenteId: evaluacion.docenteId,
      escalaId: evaluacion.escalaId
    };

    const creada = await firstValueFrom(this.http.post<any>(this.apiUrl, payload));
    const mapeada = this.mapear(creada);

    this.lista = [mapeada, ...this.lista];
    localStorage.setItem(this.LIST_KEY, JSON.stringify(this.lista));
    this.setEvaluacionActiva(mapeada);
    return mapeada;
  }

  /** Persiste el banco de preguntas y asocia los ids a la evaluación activa. */
  async asignarPreguntas(preguntas: QuestionModel[]): Promise<void> {
    const activa = this.getEvaluacion();
    if (!activa?.id) return;

    const ids: number[] = [];
    for (const pregunta of preguntas) {
      const guardada = pregunta.id
        ? await this.questionsService.actualizar(pregunta.id, pregunta)
        : await this.questionsService.crear(pregunta);
      ids.push(guardada.id || pregunta.id!);
    }

    await firstValueFrom(
      this.http.post(`${this.apiUrl}/${activa.id}/preguntas`, { preguntas: ids })
    );

    activa.preguntas = preguntas.map((p, i) => ({ ...p, id: ids[i] }));
    this.actualizarEnLista(activa);
    this.setEvaluacionActiva(activa);
  }

  async eliminarEvaluacion(nombre: string): Promise<void> {
    const evaluacion = this.getEvaluaciones().find(e => e.nombre === nombre);
    if (evaluacion?.id) {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${evaluacion.id}`));
    }
    this.lista = this.lista.filter(e => e.nombre !== nombre);
    localStorage.setItem(this.LIST_KEY, JSON.stringify(this.lista));

    const activa = this.getEvaluacion();
    if (activa?.nombre === nombre) localStorage.removeItem(this.ACTIVE_KEY);
  }

  setEvaluacionActiva(evaluacion: EvaluationModel): void {
    localStorage.setItem(this.ACTIVE_KEY, JSON.stringify(evaluacion));
  }

  getEvaluacion(): EvaluationModel | null {
    const data = localStorage.getItem(this.ACTIVE_KEY);
    if (!data || data === 'null') return null;
    try {
      return JSON.parse(data) as EvaluationModel;
    } catch {
      return null;
    }
  }

  limpiarEvaluacion(): void {
    localStorage.removeItem(this.ACTIVE_KEY);
  }

  private actualizarEnLista(evaluacion: EvaluationModel): void {
    const index = this.lista.findIndex(e => e.id === evaluacion.id);
    if (index >= 0) this.lista[index] = evaluacion;
    localStorage.setItem(this.LIST_KEY, JSON.stringify(this.lista));
  }

  private leerListaLocal(): EvaluationModel[] {
    const data = localStorage.getItem(this.LIST_KEY);
    if (!data || data === 'null') return [];
    try {
      return JSON.parse(data) as EvaluationModel[];
    } catch {
      return [];
    }
  }

  private mapear(ev: any): EvaluationModel {
    return {
      id: ev.id,
      nombre: ev.nombre,
      tipo: ev.tipo,
      cantidad: ev.cantidad,
      escala: ev.escala?.nombre || '',
      docente: ev.docente?.nombre || '',
      escalaId: ev.escala?.id,
      docenteId: ev.docente?.id,
      preguntas: (ev.preguntas || []).map((rel: any) => {
        const q = rel.question || rel;
        return {
          id: q.id,
          enunciado: q.enunciado || '',
          opcionA: q.opcionA || '',
          opcionB: q.opcionB || '',
          opcionC: q.opcionC || '',
          opcionD: q.opcionD || '',
          respuesta: q.respuesta || '',
          tiempo: q.tiempo ?? null
        };
      })
    };
  }
}
