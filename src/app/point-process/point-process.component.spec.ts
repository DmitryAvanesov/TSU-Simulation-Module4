import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PointProcessComponent } from './point-process.component';

describe('PointProcessComponent', () => {
  let component: PointProcessComponent;
  let fixture: ComponentFixture<PointProcessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PointProcessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PointProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
