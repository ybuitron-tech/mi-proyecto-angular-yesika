import { Component, HostListener, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { EvaluationService } from '../../services/evaluations.service';
import { StudentService } from '../../services/student.service';
import { AuthService } from '../../services/auth.service';
import { EvaluationModel } from '../../models/evaluation';

@Component({
  selector: 'app-exam',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './exam.html',
  styleUrls: ['./exam.css']
})
export class Exam implements OnDestroy {

  evaluacion: EvaluationModel | null = null;
  estudiante: any = null;
  respuestas: any[] = [];
  evaluacionesDisponibles: EvaluationModel[] = [];
  nombreUsuario: string = '';

  evaluacionBloqueada: boolean = false;
  preguntaActual: number = 0;

  tiempoRestante = signal<number | null>(null);
  temporizador: any = null;

  constructor(
    private router: Router,
    private evaluationService: EvaluationService,
    private studentService: StudentService,
    private authService: AuthService
  ) {
    void this.cargarExamen();
  }

  ngOnDestroy(): void {
    this.detenerTemporizador();
  }

  async cargarExamen(): Promise<void> {
    this.detenerTemporizador();

    const sesion = this.authService.obtenerSesion();
    if (!sesion) {
      Swal.fire({
        icon: 'error',
        title: 'No hay sesión activa',
        text: 'Debe iniciar sesión'
      }).then(() => {
        void this.router.navigate(['/']);
      });
      return;
    }

    this.estudiante = sesion;
    this.nombreUsuario =
      sesion.data?.nombre ||
      sesion.data?.data?.nombre ||
      'Usuario';

    await this.evaluationService.inicializarEvaluacion();

    this.evaluacionesDisponibles = this.evaluationService.getEvaluaciones().filter(
      (e: EvaluationModel) => (e.preguntas || []).length > 0
    );

    localStorage.removeItem('evaluacionActiva');

    this.evaluacion = null;
    this.respuestas = [];
    this.preguntaActual = 0;
    this.tiempoRestante.set(null);
    this.evaluacionBloqueada = false;
  }

  seleccionarEvaluacion(evaluacion: EvaluationModel): void {
    if (this.yaPresentoEvaluacion(evaluacion)) return;

    this.detenerTemporizador();

    this.evaluacion = evaluacion;
    this.evaluacionBloqueada = false;
    this.preguntaActual = 0;
    this.tiempoRestante.set(null);

    this.evaluationService.setEvaluacionActiva(evaluacion);
    this.respuestas = new Array(this.evaluacion.preguntas.length).fill('');

    this.iniciarTemporizador();
  }

  responder(index: number, valor: any): void {
    this.respuestas[index] = valor;
  }

  iniciarTemporizador(): void {
    this.detenerTemporizador();
    if (!this.evaluacion) return;

    const pregunta = this.evaluacion.preguntas[this.preguntaActual];
    const tiempo = Number(pregunta?.tiempo);

    if (!tiempo || tiempo <= 0) {
      this.tiempoRestante.set(null);
      return;
    }

    this.tiempoRestante.set(tiempo);

    this.temporizador = setInterval(() => {
      const tiempoActual = this.tiempoRestante();
      if (tiempoActual === null) return;

      const nuevoTiempo = tiempoActual - 1;
      this.tiempoRestante.set(nuevoTiempo);

      if (nuevoTiempo <= 0) this.tiempoAgotado();
    }, 1000);
  }

  detenerTemporizador(): void {
    if (this.temporizador) {
      clearInterval(this.temporizador);
      this.temporizador = null;
    }
  }

  tiempoAgotado(): void {
    this.detenerTemporizador();

    if (!String(this.respuestas[this.preguntaActual] || '').trim()) {
      this.respuestas[this.preguntaActual] = 'SIN_RESPONDER';
    }

    Swal.fire({
      icon: 'warning',
      title: 'Tiempo agotado',
      text: 'Se terminó el tiempo para esta pregunta.',
      timer: 1200,
      showConfirmButton: false
    }).then(() => {
      this.siguientePregunta(true);
    });
  }

  siguientePregunta(porTiempo: boolean = false): void {
    if (!this.evaluacion) return;

    if (!porTiempo && !String(this.respuestas[this.preguntaActual] || '').trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Respuesta requerida',
        text: 'Debe responder esta pregunta antes de continuar.'
      });
      return;
    }

    if (this.preguntaActual < this.evaluacion.preguntas.length - 1) {
      this.preguntaActual++;
      this.iniciarTemporizador();
      return;
    }

    void this.finalizarExamen(true);
  }

  @HostListener('document:visibilitychange')
  detectarCambioDePestana(): void {
    if (!this.evaluacion || this.evaluacionBloqueada) return;
    if (document.hidden) {
      this.evaluacionBloqueada = true;
      void this.anularEvaluacionPorCambioDePestana();
    }
  }

  async anularEvaluacionPorCambioDePestana(): Promise<void> {
    this.detenerTemporizador();

    const total = this.evaluacion?.preguntas?.length || 0;

    const resultado = {
      estudiante: this.nombreUsuario,
      identificacion: this.estudiante?.data?.identificacion || '',
      evaluacion: this.evaluacion?.nombre || '',
      docente: this.evaluacion?.docente || '',
      totalPreguntas: total,
      correctas: 0,
      nota: 0,
      estado: 'Anulado por cambio de pestaña',
      fecha: new Date().toLocaleString()
    };

    this.guardarEnHistorial(resultado);
    await this.guardarNotaEnAPI(0, 'reprobado');

    localStorage.removeItem('evaluacionActiva');

    this.evaluacion = null;
    this.respuestas = [];
    this.preguntaActual = 0;
    this.tiempoRestante.set(null);

    Swal.fire({
      icon: 'warning',
      title: 'Evaluación anulada',
      text: 'Cambiaste de pestaña durante la evaluación. La evaluación fue cerrada.',
      confirmButtonText: 'Aceptar'
    }).then(() => {
      void this.cargarExamen();
    });
  }

  async finalizarExamen(automatico: boolean = false): Promise<void> {
    if (!this.evaluacion) return;

    if (!automatico) {
      const sinResponder = this.respuestas.some(r => String(r).trim() === '');
      if (sinResponder) {
        Swal.fire({
          icon: 'warning',
          title: 'Faltan respuestas',
          text: 'Debes responder todas las preguntas'
        });
        return;
      }
    }

    this.detenerTemporizador();

    let correctas = 0;
    this.evaluacion.preguntas.forEach((pregunta: any, i: number) => {
      if (this.normalizar(pregunta.respuesta) === this.normalizar(this.respuestas[i])) {
        correctas++;
      }
    });

    const total = this.evaluacion.preguntas.length || 1;
    const notaMaxima = this.obtenerNotaMaxima(this.evaluacion.escala);
    const nota = Number(((correctas / total) * notaMaxima).toFixed(2));
    const aprobado = nota >= 3;

    const resultado = {
      estudiante: this.nombreUsuario,
      identificacion: this.estudiante?.data?.identificacion || '',
      evaluacion: this.evaluacion.nombre,
      docente: this.evaluacion.docente,
      totalPreguntas: total,
      correctas: correctas,
      nota,
      estado: aprobado ? 'Aprobado' : 'Reprobado',
      fecha: new Date().toLocaleString()
    };

    this.guardarEnHistorial(resultado);
    await this.guardarNotaEnAPI(nota, aprobado ? 'aprobado' : 'reprobado');

    this.evaluacionBloqueada = true;

    Swal.fire({
      icon: 'success',
      title: automatico ? 'Examen finalizado automáticamente' : 'Examen finalizado',
      html: `
        <p>Has completado la evaluación correctamente.</p>
        <p><strong>Tu nota fue:</strong> ${nota.toFixed(2)}</p>
      `,
      confirmButtonText: 'Aceptar'
    }).then(() => {
      localStorage.removeItem('evaluacionActiva');

      this.evaluacion = null;
      this.respuestas = [];
      this.preguntaActual = 0;
      this.tiempoRestante.set(null);

      this.evaluacionesDisponibles = this.evaluationService.getEvaluaciones().filter(
        (e: EvaluationModel) => (e.preguntas || []).length > 0
      );

      this.evaluacionBloqueada = false;
    });
  }

  private normalizar(valor: any): string {
    const texto = String(valor ?? '').trim().toUpperCase();
    if (['V', 'VERDADERO', 'SI', 'SÍ', 'TRUE'].includes(texto)) return 'V';
    if (['F', 'FALSO', 'NO', 'FALSE'].includes(texto)) return 'F';
    return texto;
  }

  private obtenerNotaMaxima(escala: string): number {
    const partes = String(escala || '').split('-');
    if (partes.length > 1) {
      const maxima = Number(partes[1].trim());
      if (Number.isFinite(maxima) && maxima > 0) return maxima;
    }
    return 5;
  }

  private guardarEnHistorial(resultado: any): void {
    try {
      const historial = JSON.parse(localStorage.getItem('resultados') || '[]');
      const lista = Array.isArray(historial) ? historial : [];
      lista.push(resultado);
      localStorage.setItem('resultados', JSON.stringify(lista));
    } catch {
      localStorage.setItem('resultados', JSON.stringify([resultado]));
    }
  }

  private async guardarNotaEnAPI(nota: number, estadoResultado: string): Promise<void> {
    const id = this.estudiante?.data?.id ?? this.estudiante?.id;
    if (!id) return;

    try {
      await this.studentService.guardarResultado(Number(id), nota, estadoResultado);
    } catch (error) {
      console.warn('No se pudo guardar la nota en la API; queda en el historial local', error);
    }
  }

  yaPresentoEvaluacion(evaluacion: EvaluationModel): boolean {
    let historial: any[] = [];
    try {
      historial = JSON.parse(localStorage.getItem('resultados') || '[]');
    } catch {
      historial = [];
    }

    const identificacion = this.estudiante?.data?.identificacion || '';
    return historial.some(r =>
      r.identificacion === identificacion && r.evaluacion === evaluacion.nombre
    );
  }

  volverASeleccionar(): void {
    this.detenerTemporizador();

    this.evaluacion = null;
    this.respuestas = [];
    this.preguntaActual = 0;
    this.tiempoRestante.set(null);
    this.evaluacionBloqueada = false;

    localStorage.removeItem('evaluacionActiva');
  }

  confirmarAbandonarExamen(): void {
    Swal.fire({
      title: 'Abandonar examen',
      text: 'Si abandonas el examen, se perderán las respuestas no enviadas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, abandonar',
      cancelButtonText: 'Continuar examen'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.volverASeleccionar();
    });
  }

  confirmarCerrarSesion(): void {
    Swal.fire({
      title: 'Cerrar sesión',
      text: '¿Deseas cerrar tu sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then(res => {
      if (!res.isConfirmed) return;
      this.cerrarSesion();
    });
  }

  cerrarSesion(): void {
    this.detenerTemporizador();
    this.authService.cerrarSesion();

    Swal.fire({
      icon: 'success',
      title: 'Sesión cerrada',
      timer: 1200,
      showConfirmButton: false
    }).then(() => {
      void this.router.navigate(['/']);
    });
  }
}
