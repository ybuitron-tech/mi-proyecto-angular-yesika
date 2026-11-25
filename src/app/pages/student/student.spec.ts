import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { Student } from './student';

describe('Student', () => {
  let component: Student;
  let fixture: ComponentFixture<Student>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Student],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Student);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
