import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanNotesComponent } from './scan-notes.component';

describe('ScanNotesComponent', () => {
  let component: ScanNotesComponent;
  let fixture: ComponentFixture<ScanNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScanNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
