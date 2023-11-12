import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargingComponent } from './charging.component';

describe('ChargingComponent', () => {
  let component: ChargingComponent;
  let fixture: ComponentFixture<ChargingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChargingComponent]
    });
    fixture = TestBed.createComponent(ChargingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
