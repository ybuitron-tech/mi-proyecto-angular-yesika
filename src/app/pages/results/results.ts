import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { StudentService } from '../../services/student.service';
import { AuthService } from '../../services/auth.service';
import { StudentModel } from '../../models/student';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './results.html',
  styleUrls: ['./results.css']
})
export class Results implements OnInit {

  listaResultados: any[] = [];
  filtro: string = '';
  estudianteSeleccionado: any = null;

  constructor(
    private router: Router,
    private studentService: StudentService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargarResultados();
  }

  /** Combina las notas guardadas en la API con el detalle del examen local. */
  async cargarResultados(): Promise<void> {
    const historial: any[] = this.leerHistorial();
    const porIdentificacion = new Map<string, any>();
    historial.forEach(r => porIdentificacion.set(r.identificacion, r));

    let estudiantes: StudentModel[] = [];
    try {
      estudiantes = await this.studentService.cargar();
    } catch (error) {
      console.warn('No se pudieron cargar los resultados de la API; se usa historial local', error);
    }

    this.listaResultados = estudiantes.map(est => {
      const extra = porIdentificacion.get(est.identificacion) || {};
      const nota = est.nota != null ? Number(est.nota) : Number(extra.nota ?? 0);
      return {
        id: est.id,
        estudiante: `${est.nombre} ${est.apellido}`.trim(),
        identificacion: est.identificacion,
        nota,
        evaluacion: extra.evaluacion || 'No registrada',
        docente: extra.docente || 'No registrado',
        correctas: extra.correctas ?? 0,
        totalPreguntas: extra.totalPreguntas ?? 0,
        fecha: extra.fecha || 'No registrada'
      };
    });

    const conocidos = new Set(estudiantes.map(e => e.identificacion));
    historial.forEach(r => {
      if (!conocidos.has(r.identificacion)) {
        this.listaResultados.push({ ...r, nota: Number(r.nota ?? 0) });
      }
    });
  }

  private leerHistorial(): any[] {
    try {
      const data = JSON.parse(localStorage.getItem('resultados') || '[]');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  get resultadosFiltrados(): any[] {
    const texto = this.filtro.trim().toLowerCase();
    return this.listaResultados.filter(r =>
      String(r.estudiante || '').toLowerCase().includes(texto) ||
      String(r.identificacion || '').toLowerCase().includes(texto)
    );
  }

  esAprobado(resultado: any): boolean {
    return Number(resultado.nota) >= 3;
  }

  obtenerEstado(resultado: any): string {
    return this.esAprobado(resultado) ? 'Aprobado' : 'Reprobado';
  }

  obtenerMensaje(resultado: any): string {
    return this.esAprobado(resultado)
      ? 'El estudiante aprobó la evaluación.'
      : 'El estudiante no aprobó la evaluación.';
  }

  obtenerFeedbackIA(nota: number): string {
    const valor = Number(nota);
    if (valor >= 4.5) return '⭐ Destacado';
    if (valor >= 3.5) return '✔️ Buen desempeño';
    if (valor >= 3) return '🟡 En mejora';
    return '⚠️ Refuerzo';
  }

  seleccionarEstudiante(resultado: any): void {
    this.estudianteSeleccionado = resultado;
    this.verReporte(resultado);
  }

  verReporte(resultado: any): void {
    Swal.fire({
      title: 'Centro de reportes',
      html: `
        <div style="text-align:left; line-height:1.8;">
          <p><strong>Estudiante:</strong> ${resultado.estudiante || 'No registrado'}</p>
          <p><strong>Identificación:</strong> ${resultado.identificacion || 'No registrada'}</p>
          <p><strong>Evaluación:</strong> ${resultado.evaluacion || 'No registrada'}</p>
          <p><strong>Docente:</strong> ${resultado.docente || 'No registrado'}</p>
          <p><strong>Correctas:</strong> ${resultado.correctas ?? 0}</p>
          <p><strong>Total preguntas:</strong> ${resultado.totalPreguntas ?? 0}</p>
          <p><strong>Nota:</strong> ${resultado.nota ?? 0}</p>
          <p><strong>Estado:</strong> ${this.obtenerEstado(resultado)}</p>
          <p><strong>Fecha:</strong> ${resultado.fecha || 'No registrada'}</p>
          <hr>
          <p><strong>Informe:</strong> ${this.obtenerMensaje(resultado)}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  }

  mostrarNotificaciones(): void {
    Swal.fire({
      icon: 'info',
      title: 'Notificaciones',
      text: 'No hay notificaciones nuevas'
    });
  }

  cerrarSesion(): void {
    Swal.fire({
      title: 'Cerrar sesión',
      text: '¿Desea salir del sistema?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Salir',
      cancelButtonText: 'Cancelar'
    }).then((res) => {
      if (!res.isConfirmed) return;

      this.authService.cerrarSesion();

      Swal.fire({
        icon: 'success',
        title: 'Sesión cerrada',
        timer: 1200,
        showConfirmButton: false
      }).then(() => {
        this.router.navigate(['/']);
      });
    });
  }
}
