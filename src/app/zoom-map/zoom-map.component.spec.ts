import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoomMapComponent } from './zoom-map.component';

describe('ZoomMapComponent', () => {
  let component: ZoomMapComponent;
  let fixture: ComponentFixture<ZoomMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZoomMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZoomMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
