import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { ScaleService } from '../../services/scale.service';
import { AuthService } from '../../services/auth.service';
import { ScaleModel } from '../../models/scales';

@Component({
  selector: 'app-scale',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './scale.html',
  styleUrls: ['./scale.css']
})
export class Scale implements OnInit {

  busqueda: string = '';
  editando: boolean = false;
  indexEditando: number = -1;

  listaEscalas: ScaleModel[] = [];

  nuevaEscala: ScaleModel = {
    nombre: '',
    min: 0,
    max: 0
  };

  constructor(
    private scaleService: ScaleService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargarEscalas();
  }

  async cargarEscalas(): Promise<void> {
    await this.scaleService.inicializar();
    this.listaEscalas = [...this.scaleService.getEscalas()];
    this.cd.detectChanges();
  }

  get escalasFiltradas(): ScaleModel[] {
    const texto = this.busqueda.trim().toLowerCase();
    return this.listaEscalas.filter(escala =>
      escala.nombre.toLowerCase().includes(texto)
    );
  }

  async agregarEscala(): Promise<void> {
    const nombre = this.nuevaEscala.nombre.trim();
    const min = Number(this.nuevaEscala.min);
    const max = Number(this.nuevaEscala.max);

    if (!nombre) {
      Swal.fire('Campo requerido', 'Por favor, ingresa un nombre para la escala', 'error');
      return;
    }

    if (min >= max) {
      Swal.fire('Datos inválidos', 'La nota mínima debe ser menor que la nota máxima', 'error');
      return;
    }

    const nombreExiste = this.listaEscalas.some((escala, index) =>
      escala.nombre.toLowerCase() === nombre.toLowerCase() &&
      index !== this.indexEditando
    );

    if (nombreExiste) {
      Swal.fire('Escala duplicada', 'Ya existe una escala con ese nombre', 'warning');
      return;
    }

    const escalaGuardar: ScaleModel = { nombre, min, max };

    try {
      if (this.editando && this.indexEditando !== -1) {
        await this.scaleService.actualizarEscala(this.indexEditando, escalaGuardar);
        this.mostrarExito('Escala actualizada');
      } else {
        await this.scaleService.agregarEscala(escalaGuardar);
        this.mostrarExito('Escala guardada');
      }

      this.limpiarFormulario();
      await this.cargarEscalas();
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar la escala', 'error');
      console.error(error);
    }
  }

  editarEscala(escala: ScaleModel): void {
    const index = this.listaEscalas.findIndex(e => (e.id && e.id === escala.id) || e.nombre === escala.nombre);

    if (index === -1) {
      Swal.fire('Error', 'No se encontró la escala seleccionada', 'error');
      return;
    }

    this.editando = true;
    this.indexEditando = index;
    this.nuevaEscala = { ...escala };
  }

  async eliminarEscala(escala: ScaleModel): Promise<void> {
    const index = this.listaEscalas.findIndex(e => (e.id && e.id === escala.id) || e.nombre === escala.nombre);

    if (index === -1) {
      Swal.fire('Error', 'No se encontró la escala seleccionada', 'error');
      return;
    }

    const res = await Swal.fire({
      title: `¿Deseas eliminar la escala "${escala.nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!res.isConfirmed) return;

    try {
      await this.scaleService.eliminarEscala(index);
      this.listaEscalas = this.listaEscalas.filter((_, i) => i !== index);

      if (this.editando && this.indexEditando === index) {
        this.limpiarFormulario();
      }

      this.cd.detectChanges();
      this.mostrarExito('Escala eliminada');
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar la escala', 'error');
      console.error(error);
    }
  }

  limpiarFormulario(): void {
    this.nuevaEscala = {
      nombre: '',
      min: 0,
      max: 0
    };

    this.editando = false;
    this.indexEditando = -1;
  }

  mostrarExito(mensaje: string): void {
    Swal.fire({
      icon: 'success',
      title: mensaje,
      timer: 1000,
      showConfirmButton: false
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

  mostrarNotificaciones(): void {
    Swal.fire({
      icon: 'info',
      title: 'Notificaciones',
      text: 'No hay notificaciones nuevas'
    });
  }
}
