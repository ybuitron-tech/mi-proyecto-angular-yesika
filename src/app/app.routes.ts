import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Student } from './pages/student/student';
import { Teacher } from './pages/teacher/teacher';
import { Evaluations } from './pages/evaluations/evaluations';
import { Questions } from './pages/questions/questions';
import { Results } from './pages/results/results';
import { Scale } from './pages/scale/scale';
import { Exam } from './pages/exam/exam';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'registro', component: Register },
  { path: 'estudiantes', component: Student, canActivate: [authGuard] },
  { path: 'docentes', component: Teacher, canActivate: [authGuard] },
  { path: 'evaluaciones', component: Evaluations, canActivate: [authGuard] },
  { path: 'preguntas', component: Questions, canActivate: [authGuard] },
  { path: 'resultados', component: Results, canActivate: [authGuard] },
  { path: 'escalas', component: Scale, canActivate: [authGuard] },
  { path: 'examen', component: Exam, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }
];
