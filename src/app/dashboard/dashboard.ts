import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {

  estudiantes = [
    { nombre: 'Juan', nota: 4.8 },
    { nombre: 'María', nota: 3.2 },
    { nombre: 'Carlos', nota: 2.5 },
    { nombre: 'Ana', nota: 4.0 }
  ];

  getPromedio(): number {
    const suma = this.estudiantes.reduce((acc, e) => acc + e.nota, 0);
    return this.estudiantes.length ? suma / this.estudiantes.length : 0;
  }

  getAprobados(): number {
    return this.estudiantes.filter(e => e.nota >= 3).length;
  }

  getEnRiesgo(): number {
    return this.estudiantes.filter(e => e.nota < 3).length;
  }

  analisisIA(): string {
    const promedio = this.getPromedio();

    if (promedio >= 4) {
      return '🧠 IA: Alto rendimiento general del curso';
    } 
    else if (promedio >= 3) {
      return '🧠 IA: Rendimiento estable con algunos riesgos';
    } 
    else {
      return '🧠 IA: Bajo rendimiento, se recomienda refuerzo';
    }
  }
  mostrar = false;

toggleDashboard() {
  this.mostrar = !this.mostrar;
}
}