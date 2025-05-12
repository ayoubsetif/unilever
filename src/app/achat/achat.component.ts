import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDownloadDialogComponent } from '../confirm-download-dialog/confirm-download-dialog.component';

@Component({
  selector: 'app-achat',
  templateUrl: './achat.component.html',
  styleUrls: ['./achat.component.scss']
})
export class AchatComponent {
	file!: File;
	arrayBuffer: any;
	invoiceNumber: any = [];
  	data: any = [];
  	invoice: any = [];
	displayedColumns: string[] = ['itemCode', 'itemName', 'quantityCs', 'quantityEa', 'totalHt', 'discount', 'unitPrice', 'totalTTC'];
	discountFormControl = new FormControl('', null);
	selectedInvoice = null;

	constructor(public dialog: MatDialog) {}

  	uploadFile(event: any) {
		this.file = event.target.files[0];
		const fileReader = new FileReader();
		fileReader.onload = (e) => {
			const worksheet = this.readFile(fileReader);
			const arr = XLSX.utils.sheet_to_json(worksheet, {raw: true });
     		console.log('arr', arr)
			this.data = arr;	
			
			this.invoiceNumber = _.compact(_.uniq(arr.map((m: any) => m['TRANS_REF'])));
		};
		fileReader.readAsArrayBuffer(this.file);
	}

  	selectInvoice(event: any) {
		this.selectedInvoice = event.value;
    	const data: any = [];
		const discount = 9.45;
    	this.data.filter((f:any) => f['TRANS_REF'] === event.value).forEach((el:any) => {
      	data.push({
        	code: el['ITEMNO'], name: el['ITEMNAMEA'], quantityCs: el['QTY_IN_CRT'], quantityEA: el['QTY_IN_PIECE'],
			totalHt: el['NET_VALUE'],
			discount: this.discountFormControl.setValue(discount.toString()),
			totalTTC: (el['NET_VALUE'] - ((el['NET_VALUE'] * discount) / 100))* 1.19  , unitPrice: ((el['NET_VALUE'] - ((el['NET_VALUE'] * discount) / 100))* 1.19) /el['QTY_IN_PIECE']
      		})
    	});
    	this.invoice = data;
  	}

  	update(element: any) {
		element.discount = this.discountFormControl.value;
		element.unitPrice = (element.totalHt - ((element.totalHt * element.discount) / 100))* 1.19 / element.quantityEA;
		element.totalTTC =  (element.totalHt - ((element.totalHt * element.discount) / 100))* 1.19;
 	}

	getTotal(element: any) {
		return this.invoice.map((t:any) => t[element]).reduce((acc:any , value:any) => acc + value, 0);
	}

	openDialog() {
		const dialogRef = this.dialog.open(ConfirmDownloadDialogComponent, {
			 data: { invoiceNumber: this.selectedInvoice, totalFactureTTC: this.getTotal('totalTTC') },
		  });
	  
		  dialogRef.afterClosed().subscribe(result => {
			if(result) { this.download(); }
		  });
	}

	download() {
		const invoices: any = [];
		JSON.parse(JSON.stringify(this.invoice)).forEach((v:any)=> {
			invoices.push([ v['code'], v['name'], '',v['quantityEA'],v['unitPrice'], v['quantityEA'] * v['unitPrice']])
		});
		invoices.unshift(['Code Article', 'Article', 'Quantité conditionnée ', 'Quantité', 'Prix unitaire', 'Sous-total'  ])
		const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(invoices);
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
		XLSX.writeFile(wb, `${this.selectedInvoice}.xlsx`);
	}


  	readFile(fileReader: any) {
		this.arrayBuffer = fileReader.result;
		const data = new Uint8Array(this.arrayBuffer);
		const arr = new Array();
		for (let i = 0; i !== data.length; ++i) { arr[i] = String.fromCharCode(data[i]); }
		const bstr = arr.join('');
		const workbook = XLSX.read(bstr, {type: 'binary'});
		const first_sheet_name = workbook.SheetNames[1];
		return workbook.Sheets[first_sheet_name];
	}

}
