export interface StudentModel {
  id?: number;
  nombre: string;
  apellido: string;
  identificacion: string;
  correo: string;
  password: string;
  estado: string;
  // Campos solo de UI (no existen en el backend)
  nota?: number;
  estadoResultado?: string;
}
