import { QuestionModel } from "./question";

export interface EvaluationModel {
  id?: number;
  nombre: string;
  tipo: 'multiple' | 'vf' | 'abierta';
  cantidad: number;
  /** Nombre de la escala (solo UI). */
  escala: string;
  /** Nombre del docente (solo UI). */
  docente: string;
  /** Ids reales usados por la API. */
  escalaId?: number;
  docenteId?: number;
  preguntas: QuestionModel[];
}
