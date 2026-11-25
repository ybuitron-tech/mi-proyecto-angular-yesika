import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { StudentService } from '../../services/student.service';
import { TeacherService } from '../../services/teacher.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  identificacion: string = '';
  password: string = '';
  rol: string = 'estudiante';
  cargando = false;

  constructor(
    private router: Router,
    private studentService: StudentService,
    private teacherService: TeacherService,
    private authService: AuthService
  ) {}

  async iniciarSesion(): Promise<void> {
    if (!this.identificacion || !this.password || !this.rol) {
      Swal.fire({
        icon: 'error',
        title: 'Campos incompletos',
        text: 'Complete todos los campos'
      });
      return;
    }

    this.cargando = true;

    try {
      if (this.rol === 'docente') {
        const respuesta = await this.teacherService.login(this.identificacion, this.password);

        this.authService.guardarToken(respuesta.access_token);
        this.authService.guardarSesion({
          tipo: 'docente',
          data: respuesta.docente
        });

        await this.router.navigate(['/docentes']);
        return;
      }

      if (this.rol === 'estudiante') {
        const respuesta = await this.studentService.login(this.identificacion, this.password);

        this.authService.guardarToken(respuesta.access_token);
        this.authService.guardarSesion({
          tipo: 'estudiante',
          data: respuesta.estudiante
        });

        await this.router.navigate(['/examen']);
        return;
      }

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Rol no válido'
      });
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.error?.message || 'No se pudo iniciar sesión. Verifica el backend.'
      });
      console.error(error);
    } finally {
      this.cargando = false;
    }
  }

  irRegistro() {
    this.router.navigate(['/registro']);
  }
}
