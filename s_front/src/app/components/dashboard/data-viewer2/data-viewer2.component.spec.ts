import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataViewer2Component } from './data-viewer2.component';

describe('DataViewer2Component', () => {
  let component: DataViewer2Component;
  let fixture: ComponentFixture<DataViewer2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataViewer2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataViewer2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
