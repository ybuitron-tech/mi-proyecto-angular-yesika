import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { TeacherService } from './teacher.service';
import { environment } from '../../environments/environment';

describe('TeacherService', () => {
  let service: TeacherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(TeacherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('carga los docentes desde la API', async () => {
    const promesa = service.cargar();

    const req = httpMock.expectOne(`${environment.apiUrl}/profesores`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, nombre: 'Juan Perez' }]);

    const lista = await promesa;
    expect(lista.length).toBe(1);
    expect(lista[0].nombre).toBe('Juan Perez');
  });
});
