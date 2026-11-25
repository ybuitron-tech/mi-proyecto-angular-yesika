import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { EvaluationService } from '../../services/evaluations.service';
import { TeacherService } from '../../services/teacher.service';
import { ScaleService } from '../../services/scale.service';
import { AuthService } from '../../services/auth.service';

import { EvaluationModel } from '../../models/evaluation';
import { TeacherModel } from '../../models/teacher';
import { ScaleModel } from '../../models/scales';

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './evaluations.html',
  styleUrls: ['./evaluations.css']
})
export class Evaluations implements OnInit {

  evaluacion: EvaluationModel = {
    nombre: '',
    tipo: 'multiple',
    cantidad: 0,
    escala: '',
    docente: '',
    escalaId: undefined,
    docenteId: undefined,
    preguntas: []
  };

  docentes: TeacherModel[] = [];
  escalas: ScaleModel[] = [];

  constructor(
    private router: Router,
    private evaluationService: EvaluationService,
    private teacherService: TeacherService,
    private scaleService: ScaleService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.evaluationService.inicializarEvaluacion();

    try {
      await this.teacherService.inicializarDatos();
    } catch (error) {
      console.warn('No se pudieron cargar los docentes', error);
    }

    try {
      await this.scaleService.inicializar();
    } catch (error) {
      console.warn('No se pudieron cargar las escalas', error);
    }

    this.cargarDocentes();
    this.cargarEscalas();
  }

  cargarDocentes(): void {
    this.docentes = this.teacherService.getDocentes();
  }

  cargarEscalas(): void {
    this.escalas = this.scaleService.getEscalas();

    if (this.escalas.length > 0 && !this.evaluacion.escala) {
      this.seleccionarEscala(this.escalas[0].nombre);
    }
  }

  seleccionarEscala(nombre: string): void {
    this.evaluacion.escala = nombre;
    this.evaluacion.escalaId = this.escalas.find(e => e.nombre === nombre)?.id;
  }

  seleccionarDocente(nombre: string): void {
    this.evaluacion.docente = nombre;
    this.evaluacion.docenteId = this.docentes.find(d => d.nombre === nombre)?.id;
  }

  validarFormulario(): string | null {
    const e = this.evaluacion;

    e.nombre = e.nombre.trim();
    e.escala = e.escala.trim();
    e.docente = e.docente.trim();

    const reglas = [
      () => !e.nombre && 'Ingrese el nombre de la evaluación',
      () => {
        if (!e.cantidad || Number(e.cantidad) <= 0) {
          return 'Ingrese una cantidad válida de preguntas';
        }
        return null;
      },
      () => (!e.escala || !e.escalaId) && 'Seleccione una escala válida',
      () => (!e.docente || !e.docenteId) && 'Seleccione un docente válido',
      () => {
        const existe = this.evaluationService.getEvaluaciones().some((ev: EvaluationModel) =>
          ev.nombre.trim().toLowerCase() === e.nombre.toLowerCase()
        );
        return existe && 'Ya existe una evaluación con ese nombre';
      }
    ];

    for (const regla of reglas) {
      const error = regla();
      if (error) return error;
    }

    return null;
  }

  async crearEvaluacion(): Promise<void> {
    const error = this.validarFormulario();

    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Revise el formulario',
        text: error
      });
      return;
    }

    try {
      await this.evaluationService.guardarEvaluacion({
        ...this.evaluacion,
        cantidad: Number(this.evaluacion.cantidad),
        preguntas: []
      });

      Swal.fire({
        icon: 'success',
        title: 'Evaluación creada',
        text: 'Ahora agrega las preguntas correspondientes.',
        confirmButtonText: 'Agregar preguntas'
      }).then(() => {
        this.router.navigate(['/preguntas']);
      });
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo crear la evaluación',
        text: error?.error?.message || 'Verifica la conexión con el backend.'
      });
      console.error(error);
    }
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
