import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentService } from '../services/student.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  mostrar = false;
  estudiantes: { nombre: string; nota: number }[] = [];

  constructor(private studentService: StudentService) {}

  async ngOnInit(): Promise<void> {
    await this.cargarEstudiantes();
  }

  async cargarEstudiantes(): Promise<void> {
    try {
      const lista = await this.studentService.cargar();
      this.estudiantes = lista.map(est => ({
        nombre: `${est.nombre} ${est.apellido}`.trim(),
        nota: Number(est.nota ?? 0)
      }));
    } catch (error) {
      console.warn('No se pudo cargar el dashboard desde la API', error);
      this.estudiantes = [];
    }
  }

  toggleDashboard() {
    this.mostrar = !this.mostrar;
  }

  getPromedio() {
    if (!this.estudiantes.length) return 0;
    const suma = this.estudiantes.reduce((acc, e) => acc + e.nota, 0);
    return suma / this.estudiantes.length;
  }

  getAprobados() {
    return this.estudiantes.filter(e => e.nota >= 3).length;
  }

  getEnRiesgo() {
    return this.estudiantes.filter(e => e.nota > 0 && e.nota < 3).length;
  }

  analisisIA() {
    const promedio = this.getPromedio();

    if (promedio >= 4) return '🧠 IA: Alto rendimiento general del curso';
    if (promedio >= 3) return '🧠 IA: Rendimiento estable con algunos riesgos';
    return '🧠 IA: Bajo rendimiento, se recomienda refuerzo';
  }
}
