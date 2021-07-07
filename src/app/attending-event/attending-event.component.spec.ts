import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendingEventComponent } from './attending-event.component';

describe('AttendingEventComponent', () => {
  let component: AttendingEventComponent;
  let fixture: ComponentFixture<AttendingEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttendingEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendingEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
