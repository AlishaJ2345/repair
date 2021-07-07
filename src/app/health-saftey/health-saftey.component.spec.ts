import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthSafteyComponent } from './health-saftey.component';

describe('HealthSafteyComponent', () => {
  let component: HealthSafteyComponent;
  let fixture: ComponentFixture<HealthSafteyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthSafteyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthSafteyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
