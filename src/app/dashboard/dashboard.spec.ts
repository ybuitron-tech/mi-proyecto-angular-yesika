import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;

  beforeEach(async () => {
    component = new DashboardComponent({ cargar: async () => [] } as any);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
