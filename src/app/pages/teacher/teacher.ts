import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { TeacherService } from '../../services/teacher.service';
import { TeacherModel } from '../../models/teacher';

@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './teacher.html',
  styleUrls: ['./teacher.css']
})
export class Teacher implements OnInit {

  docente: TeacherModel = {
    nombre: '',
    identificacion: '',
    correo: '',
    titulo: '',
    password: '',
    estado: 'activo'
  };

  listaDocentes: TeacherModel[] = [];

  editando = false;
  idEdicion: number | null = null;
  cargando = false;

  constructor(
    private router: Router,
    private teacherService: TeacherService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargarDocentes();
  }

  async cargarDocentes(): Promise<void> {
    this.cargando = true;
    try {
      this.listaDocentes = await this.teacherService.cargar();
    } catch (error) {
      this.mostrarError('No se pudo conectar con el backend. Verifica que esté encendido.');
      console.error(error);
    } finally {
      this.cargando = false;
    }
  }

  async validarFormulario(): Promise<string[]> {
    const d = this.docente;

    const reglas = [
      () => !d.nombre && 'El nombre es obligatorio',
      () => d.nombre.length < 3 && 'Nombre mínimo 3 caracteres',

      () => !d.identificacion && 'Identificación obligatoria',
      () => !/^[0-9]+$/.test(d.identificacion) && 'Solo números',

      () => !d.correo && 'Correo obligatorio',
      () => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo) && 'Correo inválido',

      () => !this.editando && !d.password && 'Contraseña obligatoria',
      () => !this.editando && d.password.length < 6 && 'Mínimo 6 caracteres'
    ];

    const errores = reglas
      .map(r => r())
      .filter(m => m) as string[];

    if (!this.editando && await this.teacherService.existeIdentificacion(d.identificacion)) {
      errores.push('Ya existe un docente con esa identificación');
    }

    return errores;
  }

  async guardarDocente(): Promise<void> {
    try {
      const errores = await this.validarFormulario();

      if (errores.length) {
        this.mostrarError(errores.join('\n'));
        return;
      }

      if (this.editando && this.idEdicion !== null) {
        await this.teacherService.actualizar(this.idEdicion, this.docente);
      } else {
        await this.teacherService.agregar(this.docente);
      }

      await this.cargarDocentes();
      const mensaje = this.editando
        ? 'Docente actualizado correctamente'
        : 'Docente guardado correctamente';
      this.limpiarFormulario();
      await this.mostrarExito(mensaje);
    } catch (error) {
      this.mostrarError(this.mensajeBackend(error));
      console.error(error);
    }
  }

  editarDocente(index: number): void {
    const docente = this.listaDocentes[index];
    if (!docente?.id) return;

    this.docente = { ...docente, password: '' };
    this.editando = true;
    this.idEdicion = docente.id;

    this.mostrarInfo(`Editando a ${this.docente.nombre}`);
  }

  async eliminarDocente(index: number): Promise<void> {
    const docente = this.listaDocentes[index];
    if (!docente?.id) return;

    Swal.fire({
      title: '¿Eliminar docente?',
      text: `Se eliminará a ${docente.nombre}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async res => {
      if (!res.isConfirmed) return;

      try {
        await this.teacherService.eliminar(docente.id!);
        await this.cargarDocentes();

        if (this.editando && this.idEdicion === docente.id) {
          this.limpiarFormulario();
        }

        await this.mostrarExito('Docente eliminado correctamente');
      } catch (error) {
        this.mostrarError(this.mensajeBackend(error));
        console.error(error);
      }
    });
  }

  cancelar(): void {
    if (!this.editando) return this.limpiarFormulario();

    Swal.fire({
      title: 'Cancelar edición',
      text: 'Se perderán los cambios',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    }).then(res => {
      if (res.isConfirmed) this.limpiarFormulario();
    });
  }

  limpiarFormulario(): void {
    this.docente = {
      nombre: '',
      identificacion: '',
      correo: '',
      titulo: '',
      password: '',
      estado: 'activo'
    };

    this.editando = false;
    this.idEdicion = null;
  }

  cerrarSesion(): void {
    Swal.fire({
      title: 'Cerrar sesión',
      text: '¿Desea salir del sistema?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Salir',
      cancelButtonText: 'Cancelar'
    }).then(res => {
      if (!res.isConfirmed) return;

      this.mostrarExito('Sesión cerrada').then(() => {
        this.router.navigate(['/']);
      });
    });
  }

  mostrarExito(mensaje: string) {
    return Swal.fire({
      icon: 'success',
      title: mensaje,
      timer: 1500,
      showConfirmButton: false
    });
  }

  mostrarError(mensaje: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje
    });
  }

  mostrarInfo(mensaje: string) {
    Swal.fire({
      icon: 'info',
      title: mensaje,
      timer: 1200,
      showConfirmButton: false
    });
  }

  mostrarNotificaciones(): void {
    Swal.fire({
      icon: 'info',
      title: 'Notificaciones',
      text: 'No hay notificaciones nuevas'
    });
  }

  private mensajeBackend(error: any): string {
    return error?.error?.message || 'No se pudo completar la operación. Intenta de nuevo.';
  }
}
