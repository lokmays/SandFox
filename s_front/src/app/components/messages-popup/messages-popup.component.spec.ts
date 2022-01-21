import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagesPopupComponent } from './messages-popup.component';

describe('MessagesPopupComponent', () => {
  let component: MessagesPopupComponent;
  let fixture: ComponentFixture<MessagesPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessagesPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagesPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
