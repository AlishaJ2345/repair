import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoUploadsComponent } from './photo-uploads.component';

describe('PhotoUploadsComponent', () => {
  let component: PhotoUploadsComponent;
  let fixture: ComponentFixture<PhotoUploadsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhotoUploadsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotoUploadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
