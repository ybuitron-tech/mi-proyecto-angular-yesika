import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { StudentService } from '../../services/student.service';
import { AuthService } from '../../services/auth.service';
import { StudentModel } from '../../models/student';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './student.html',
  styleUrls: ['./student.css']
})
export class Student implements OnInit {

  estudiante: StudentModel = {
    nombre: '',
    apellido: '',
    identificacion: '',
    correo: '',
    password: '',
    estado: 'activo',
    nota: 0,
    estadoResultado: 'pendiente'
  };

  listaEstudiantes: StudentModel[] = [];
  filtro: string = '';
  editando: boolean = false;
  idEdicion: number | null = null;
  cargando: boolean = false;

  constructor(
    private router: Router,
    private studentService: StudentService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargarEstudiantes();
  }

  async cargarEstudiantes(): Promise<void> {
    this.cargando = true;
    try {
      this.listaEstudiantes = await this.studentService.cargar();
    } catch (error) {
      this.mostrarError('No se pudo conectar con el backend. Verifica que esté encendido.');
      console.error(error);
    } finally {
      this.cargando = false;
    }
  }

  get estudiantesFiltrados(): StudentModel[] {
    return this.listaEstudiantes.filter(est =>
      `${est.nombre} ${est.apellido}`.toLowerCase().includes(this.filtro.toLowerCase()) ||
      est.identificacion.toLowerCase().includes(this.filtro.toLowerCase()) ||
      est.correo.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }

  async guardarEstudiante(): Promise<void> {
    const e = this.estudiante;

    const reglas = [
      () => !e.nombre.trim() && 'El nombre es obligatorio',
      () => !e.apellido.trim() && 'El apellido es obligatorio',
      () => !e.identificacion.trim() && 'La identificación es obligatoria',
      () => !/^[0-9]+$/.test(e.identificacion) && 'La identificación debe ser numérica',
      () => e.identificacion.length < 5 && 'La identificación debe tener mínimo 5 dígitos',
      () => !e.correo.trim() && 'El correo es obligatorio',
      () => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.correo) && 'Correo inválido',
      () => !this.editando && !e.password.trim() && 'La contraseña es obligatoria',
      () => !this.editando && e.password.length < 6 && 'La contraseña debe tener mínimo 6 caracteres'
    ];

    const errores = reglas
      .map(r => r())
      .filter(m => m) as string[];

    if (errores.length) {
      this.mostrarError(errores.join(', '));
      return;
    }

    try {
      if (!this.editando && await this.studentService.existeIdentificacion(e.identificacion)) {
        this.mostrarError('Ya existe un estudiante con esa identificación');
        return;
      }

      if (this.editando && this.idEdicion !== null) {
        await this.studentService.actualizar(this.idEdicion, this.estudiante);
        await this.mostrarExito('Estudiante actualizado');
      } else {
        await this.studentService.registrar(this.estudiante);
        await this.mostrarExito('Estudiante registrado');
      }

      await this.cargarEstudiantes();
      this.limpiarFormulario();
    } catch (error) {
      this.mostrarError(this.mensajeBackend(error));
      console.error(error);
    }
  }

  editarEstudiante(index: number): void {
    const est = this.estudiantesFiltrados[index];
    if (!est?.id) return;

    this.estudiante = { ...est, password: '' };
    this.editando = true;
    this.idEdicion = est.id;
  }

  async eliminarEstudiante(index: number): Promise<void> {
    const est = this.estudiantesFiltrados[index];
    if (!est?.id) return;

    Swal.fire({
      title: '¿Eliminar estudiante?',
      text: `${est.nombre} ${est.apellido}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar'
    }).then(async res => {
      if (!res.isConfirmed) return;

      try {
        await this.studentService.eliminar(est.id!);
        await this.cargarEstudiantes();
        if (this.idEdicion === est.id) this.limpiarFormulario();
        await this.mostrarExito('Eliminado');
      } catch (error) {
        this.mostrarError(this.mensajeBackend(error));
        console.error(error);
      }
    });
  }

  cancelar(): void {
    this.limpiarFormulario();
  }

  limpiarFormulario(): void {
    this.estudiante = {
      nombre: '',
      apellido: '',
      identificacion: '',
      correo: '',
      password: '',
      estado: 'activo',
      nota: 0,
      estadoResultado: 'pendiente'
    };

    this.editando = false;
    this.idEdicion = null;
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

  obtenerPerfilIA(nota: number): string {
    if (nota >= 4.5) {
      return '🏆 Estudiante destacado';
    }
    else if (nota >= 3.5) {
      return '👍 Buen estudiante';
    }
    else if (nota >= 3) {
      return '🟡 Estudiante en proceso de mejora';
    }
    else {
      return '⚠️ Requiere acompañamiento';
    }
  }

  private mostrarError(mensaje: string) {
    Swal.fire({ icon: 'error', title: 'Error', text: mensaje });
  }

  private mostrarExito(mensaje: string) {
    return Swal.fire({
      icon: 'success',
      title: mensaje,
      timer: 1200,
      showConfirmButton: false
    });
  }

  private mensajeBackend(error: any): string {
    return error?.error?.message || 'No se pudo completar la operación. Intenta de nuevo.';
  }
}
