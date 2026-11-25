import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { Evaluations } from './evaluations';

describe('Evaluations', () => {
  let component: Evaluations;
  let fixture: ComponentFixture<Evaluations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Evaluations],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Evaluations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
