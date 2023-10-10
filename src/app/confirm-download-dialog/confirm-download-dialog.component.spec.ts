import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDownloadDialogComponent } from './confirm-download-dialog.component';

describe('ConfirmDownloadDialogComponent', () => {
  let component: ConfirmDownloadDialogComponent;
  let fixture: ComponentFixture<ConfirmDownloadDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmDownloadDialogComponent]
    });
    fixture = TestBed.createComponent(ConfirmDownloadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
