import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyStockComponent } from './verify-stock.component';

describe('VerifyStockComponent', () => {
  let component: VerifyStockComponent;
  let fixture: ComponentFixture<VerifyStockComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VerifyStockComponent]
    });
    fixture = TestBed.createComponent(VerifyStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
