import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './results.html',
  styleUrls: ['./results.css']
})
export class Results {

  constructor(private router: Router) {}

  filtro: string = '';
  estudianteSeleccionado: any = null;

  resultados = [
    { estudiante: 'Juan Pérez', identificacion: '1001', nota: 4.8 },
    { estudiante: 'Maria Lopez', identificacion: '1002', nota: 2.5 },
    { estudiante: 'Carlos Ruiz', identificacion: '1003', nota: 3.5 }
  ];

  get resultadosFiltrados() {
    return this.resultados.filter(r =>
      r.estudiante.toLowerCase().includes(this.filtro.toLowerCase()) ||
      r.identificacion.includes(this.filtro)
    );
  }

  seleccionarEstudiante(r: any) {
    this.estudianteSeleccionado = r;
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

      localStorage.removeItem('usuarioActivo');

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