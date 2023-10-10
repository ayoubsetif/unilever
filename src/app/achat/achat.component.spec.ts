import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AchatComponent } from './achat.component';

describe('AchatComponent', () => {
  let component: AchatComponent;
  let fixture: ComponentFixture<AchatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AchatComponent]
    });
    fixture = TestBed.createComponent(AchatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
