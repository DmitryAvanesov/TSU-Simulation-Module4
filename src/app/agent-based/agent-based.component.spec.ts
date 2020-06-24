import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentBasedComponent } from './agent-based.component';

describe('AgentBasedComponent', () => {
  let component: AgentBasedComponent;
  let fixture: ComponentFixture<AgentBasedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentBasedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentBasedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
