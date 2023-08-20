import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
	file!: File;
	arrayBuffer: any;

  constructor(private snackBar: MatSnackBar) { }

  uploadConfigFile(event: any) {
		this.file = event.target.files[0];
		const fileReader = new FileReader();
		fileReader.onload = (e) => {
			const worksheet = this.readFile(fileReader);
			const arr = XLSX.utils.sheet_to_json(worksheet, {raw: true });

			const config = _.keyBy(arr, 'clientSAS');
			localStorage.setItem('configUnilever', JSON.stringify(config));
			this.snackBar.open('Configuration saved', 'Ok', { duration : 7000 });
		};
		fileReader.readAsArrayBuffer(this.file);
	}

  readFile(fileReader: any) {
		this.arrayBuffer = fileReader.result;
		const data = new Uint8Array(this.arrayBuffer);
		const arr = new Array();
		for (let i = 0; i !== data.length; ++i) { arr[i] = String.fromCharCode(data[i]); }
		const bstr = arr.join('');
		const workbook = XLSX.read(bstr, {type: 'binary'});
		const first_sheet_name = workbook.SheetNames[0];
		return workbook.Sheets[first_sheet_name];
	}

}
