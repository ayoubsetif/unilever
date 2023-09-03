import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';

@Component({
  selector: 'app-verify-stock',
  templateUrl: './verify-stock.component.html',
  styleUrls: ['./verify-stock.component.scss']
})
export class VerifyStockComponent {
	displayedColumns: string[] = ['itemCode', 'itemName', 'sasQuantity', 'erpQuantity', 'diff'];
	file!: File;
	arrayBuffer: any;
	stockSas: any = [];
	stockErp: any = [];
	SASemplacement: any = [];
	ERPemplacement: any = [];
	secondPlacement = '';
	selectedSas: any = [];
	selectedErp: any = [];
	comparator: any = [];

  	uploadSASFile(event: any) {
		this.file = event.target.files[0];
		const fileName = event.target.files[0].name;
		const fileReader = new FileReader();
		fileReader.onload = (e) => {
			const worksheet = this.readFile(fileReader);
			const arr = XLSX.utils.sheet_to_json(worksheet, {raw: true });
			// console.log('data', arr)
			const sas: any = [];
			arr.forEach((l:any)=> {
				sas.push({
					itemcode: l['ITEM_CODE'],
					itemName: l['ITEM_NAME'],
					quantity: fileName === 'Warehouse+QOH+stocks+deducting+reserved.xlsx' ? l['REMAINING_IN PIECE'] : l['QTY_IN_PIECE'] , // QTY_IN_PIECE
					emplacement: l['ACCOUNT_NAME']
				})
			});
			this.SASemplacement = _.compact(_.uniq(arr.map((m: any) => m['ACCOUNT_NAME'])));
			this.stockSas = sas;
		};
		fileReader.readAsArrayBuffer(this.file);
	}

	uploadERPFile(event: any) {
		this.file = event.target.files[0];
		const fileReader = new FileReader();
		fileReader.onload = (e) => {
			const worksheet = this.readFile(fileReader);
			const arr = XLSX.utils.sheet_to_json(worksheet, {raw: true });
			const erp: any = [];
			let emplacement = "";
			_.drop(arr, 1).forEach((l:any)=> {
				if(l['__EMPTY_1']) {
				emplacement = l['__EMPTY_1'];
				this.secondPlacement = l['__EMPTY_1'];
				} else {
					emplacement = this.secondPlacement;
				}
				erp.push({
					itemcode: l['__EMPTY_2'] ? this.getProduct(l['__EMPTY_2']).id : "",
					itemName: l['__EMPTY_2'] ? this.getProduct(l['__EMPTY_2']).name : "",
					quantity: l['Total'],
					emplacement: emplacement
				})
			})
			this.ERPemplacement = _.compact(_.uniq(erp.map((m: any) => m['emplacement'])));
			this.stockErp = erp;
		};
		fileReader.readAsArrayBuffer(this.file);
	}

	getProduct(prod: any) {
		const id = prod.split('[')[1].split(']')[0];
		const name = _.trim(prod.split('[')[1].split(']')[1]);
		return { id: id, name: name };
	}

  	selectSasEmplacement(event: any) {
    	this.selectedSas = this.stockSas.filter((f:any) => f['emplacement'] === event.value);
    	this.comparator = this.compareArrays(this.selectedSas, this.selectedErp).filter((f:any) => f['quantity'] !== 0 && f['itemcode'] !== "");
	}

  	selectErpEmplacement(event: any) {
    	this.selectedErp = this.stockErp.filter((f:any) => f['emplacement'] === event.value);
    	this.comparator = this.compareArrays(this.selectedSas, this.selectedErp).filter((f:any) => f['quantity'] !== 0 && f['itemcode'] !== "");
  	}

	compareArrays(sas: any[], erp: any[]) {
		const uniqueSAS = sas.filter(f => {
			return !erp.some(o => f['itemcode'] === o['itemcode'] && f['quantity'] === o['quantity'] );
		});
		const uniqueErp = erp.filter(f => {
			return !sas.some(o => f['itemcode'] === o['itemcode'] && f['quantity'] === o['quantity']);
		});
		const diff = JSON.parse(JSON.stringify(_.uniqBy(uniqueSAS.concat(uniqueErp), 'itemcode')));

		diff.forEach((d:any) => {
			const m = sas.find(f => f['itemcode'] === d['itemcode']);
			const r = erp.find(q => q['itemcode'] === d['itemcode']);
			if (!m) {
				d['quantity'] = r['quantity'] - 0;
				d['sasQuantity'] = 0;
				d['erpQuantity'] = r['quantity'];
			} else if (!r) {
				d['quantity'] = 0 - m['quantity'];
				d['erpQuantity'] = 0;
				d['sasQuantity'] = m['quantity'];
			}	else {
				d['erpQuantity'] = r['quantity'];
				d['sasQuantity'] = m['quantity'];
				d['quantity'] = r['quantity'] - m['quantity'];
			}
		});
		return diff;
	}

	download() {
		const compare: any = [];
		this.comparator.forEach((e:any) => {
			compare.push([e['itemcode'], e['itemName'], e['sasQuantity'], e['erpQuantity'], e['quantity']])
		})
		compare.unshift(['Item code', 'Item Name', 'Quantity(SaS)', 'Quantity(ErP)', 'Diff' ])
		const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(compare);
		/* generate workbook and add the worksheet */
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
		/* save to file */
		XLSX.writeFile(wb, `${this.comparator[0]['emplacement']}.xlsx`);
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
