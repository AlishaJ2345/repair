import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraErrorComponent } from './camera-error.component';

describe('CameraErrorComponent', () => {
  let component: CameraErrorComponent;
  let fixture: ComponentFixture<CameraErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CameraErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CameraErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
