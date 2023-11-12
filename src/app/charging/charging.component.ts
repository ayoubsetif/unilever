import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';

@Component({
  selector: 'app-charging',
  templateUrl: './charging.component.html',
  styleUrls: ['./charging.component.scss']
})
export class ChargingComponent {
	file!: File;
	salesmanList: any = [];
	arrayBuffer: any;
	data: any = [];
	charging: any = [];
	globaleCharging: any = [];
	salesman: any = {};
	postDate: any = [];

	ngOnInit() {
		this.salesman =  JSON.parse(localStorage.getItem('configUnilever')!);
	}

 	 uploadFile(event: any) {
		this.file = event.target.files[0];
		const fileReader = new FileReader();
		fileReader.onload = (e) => {
			const worksheet = this.readFile(fileReader);
			const arr = XLSX.utils.sheet_to_json(worksheet, {raw: true });
			// console.log('arr', arr)	
			this.data = arr.map((m:any) => {
				return { salesmanName: m['PERSON_NAME'], salesmanCode: m['PERSON_CODE'], postDate: m['POST_DATE'], transNumber: m['TRANS_NO'], articleCode: m['MATERIAL_CODE'], articleName: m['MATERIAL_DESCRIPTION'], quantity: m['QTY_IN_PIECE']}
			})
			// console.log('data', this.data)
			this.salesmanList = _.compact(_.uniq(arr.map((m: any) => m['PERSON_NAME'])));
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
		const first_sheet_name = workbook.SheetNames[1];
		return workbook.Sheets[first_sheet_name];
	}

	selectSalesman(event: any) {
		const transfert: any = [];
		event.value.forEach((v: any) => {
			transfert.push(this.data.filter((f:any) => f['salesmanName'] === v))
		});
		this.charging = transfert;
		this.postDate = _.uniqBy(_.flatten(transfert).map((m: any) => {return { postDate: m['postDate'], salesman: m['salesmanName'] }}), 'postDate');
	}

	selectPostDate(event: any) {
		const transfert: any = [];
		event.value.forEach((v:any) => {
			transfert.push(_.flatten(this.charging).filter((f:any) => f['postDate'] === v))
		})
		this.globaleCharging = transfert;
	}

	download() {
		const salesmanChargin = JSON.parse(JSON.stringify(this.globaleCharging));
		salesmanChargin.forEach((v:any) => {
			const singleCHarge = v.map((m:any) => { return [ m['articleCode'],m['articleName'],'',m['quantity']] });
			singleCHarge.unshift(['Code Article', 'Article', 'Quantité conditionnée ', 'Quantité' ])			
			const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(singleCHarge);
			const wb: XLSX.WorkBook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
			XLSX.writeFile(wb, `${v[0]['salesmanName']}.xlsx`);
		});
	}

	downloadGroupedTransfers() {
		const salesmanCharging = JSON.parse(JSON.stringify(this.globaleCharging));
		let globaleCharge: any = [];
		salesmanCharging.forEach((v:any) => {
			const singleCHarge = v.map((m:any) => { return [ m['articleCode'],m['articleName'],'',m['quantity']] });
			singleCHarge.forEach((sale: any) => {
				sale.unshift(
					this.salesman[v[0]['salesmanName']]['Depot'], this.salesman[v[0]['salesmanName']]['Marque'],
					'Stock', this.salesman[v[0]['salesmanName']]['emplacement']
				);
			});
			globaleCharge.push(singleCHarge);
		});
		
		globaleCharge = _.flatten(globaleCharge);
		globaleCharge.unshift([
			'Entrepot ', 'Marque ', 'Emplacement Source',
			'Emplacement déstination',
			'Code Article', 'Article', 'Quantité conditionnée ',
			'Quantité'
		]);
		// not optimal but why XD
		const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(globaleCharge);

		/* generate workbook and add the worksheet */
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Chargement globale');

		/* save to file */
		XLSX.writeFile(wb, `chargement globale.xlsx`);
	}

}
