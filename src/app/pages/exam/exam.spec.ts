import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { Exam } from './exam';
import { AuthService } from '../../services/auth.service';

describe('Exam', () => {
  let component: Exam;
  let fixture: ComponentFixture<Exam>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Exam],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            obtenerSesion: () => null,
            cerrarSesion: () => undefined
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Exam);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
