import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesByCustomerComponent } from './sales-by-customer.component';

describe('SalesByCustomerComponent', () => {
  let component: SalesByCustomerComponent;
  let fixture: ComponentFixture<SalesByCustomerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalesByCustomerComponent]
    });
    fixture = TestBed.createComponent(SalesByCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
