export interface QuestionModel {
  id?: number;
  enunciado: string;
  opcionA: string;
  opcionB: string;
  opcionC: string;
  opcionD: string;
  respuesta: string;
  /** Segundos; null = sin límite. */
  tiempo: number | null;
}
