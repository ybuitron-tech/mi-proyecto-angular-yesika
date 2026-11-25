import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { Teacher } from './teacher';

describe('Teacher', () => {
  let component: Teacher;
  let fixture: ComponentFixture<Teacher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Teacher],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Teacher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
