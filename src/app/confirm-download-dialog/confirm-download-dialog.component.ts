import { Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-download-dialog',
  templateUrl: './confirm-download-dialog.component.html',
  styleUrls: ['./confirm-download-dialog.component.scss']
})
export class ConfirmDownloadDialogComponent {
  invoiceNumber = null;
  totalTTC = 0;

  constructor(
	  public dialogRef: MatDialogRef<ConfirmDownloadDialogComponent>,
	  @Inject(MAT_DIALOG_DATA) public data: any,
	) {
    this.invoiceNumber = data.invoiceNumber;
    this.totalTTC = data.totalFactureTTC
  }
  
	onClick(validation: boolean): void {
	  this.dialogRef.close(validation);
	}
}
