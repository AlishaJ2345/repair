import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeLableComponent } from './make-lable.component';

describe('MakeLableComponent', () => {
  let component: MakeLableComponent;
  let fixture: ComponentFixture<MakeLableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MakeLableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MakeLableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
