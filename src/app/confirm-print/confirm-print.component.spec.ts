import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmPrintComponent } from './confirm-print.component';

describe('ConfirmPrintComponent', () => {
  let component: ConfirmPrintComponent;
  let fixture: ComponentFixture<ConfirmPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
