import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { Questions } from './questions';

describe('Questions', () => {
  let component: Questions;
  let fixture: ComponentFixture<Questions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Questions],
      providers: [provideHttpClient(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Questions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
