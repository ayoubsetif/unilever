import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';

@Component({
  selector: 'sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent {
	file!: File;
	arrayBuffer: any;
	salesmanList: any = [];
	sales: any = [];
	data: any = [];
	salesman: any = {};

	ngOnInit() {
		this.salesman =  JSON.parse(localStorage.getItem('config')!);
	}

    uploadFile(event: any) {
		this.file = event.target.files[0];
		const fileReader = new FileReader();
		fileReader.onload = (e) => {
			const worksheet = this.readFile(fileReader);
			const arr = XLSX.utils.sheet_to_json(worksheet, {raw: true });
			console.log('arr', arr)
			this.data = arr;
			this.salesmanList = _.compact(_.uniq(arr.map((m: any) => m['SALESMAN_NAME'])));
			console.log('salesmanList', this.salesmanList)
		};
		fileReader.readAsArrayBuffer(this.file);
	}

	selectVendor(event: any) {
		const sale: any = [];
		const Vreturn = [];
		event.value.forEach((v: any) => {
			const aSale: any = { id: v, sales: [], globalSales: []};
			const ss: any = [];
			this.data.filter((f:any) => f['SALESMAN_NAME'] === v).forEach((s: any) => {
				ss.push({
					id: s['ITEM_CODE'],
					name: s['ITEM_NAME'],
					price: '' ,
					quantity: s['QTY_IN_PIECE'],
					totalPrice: s['NET_VALUE']
				});
			});
			aSale['globalSales'] =ss;
			Object.keys(_.groupBy(ss, 'id')).map(m => {
				if (_.groupBy(ss, 'id')[m].length > 1) {
					const t = _.groupBy(_.groupBy(ss, 'id')[m], 'id');
					Object.keys(t).forEach(e => {
						const aon = t[e].map(p => p['totalPrice']);
						const sum = _.reduce(aon, function(a, b) { return a + b; }, 0);

						const aonq = t[e].map(p => p['quantity']);
						const sumq = _.reduce(aonq, function(a, b) { return a + b; }, 0);

						aSale['sales'].push([t[e][0]['id'], t[e][0]['name'], '', sumq,  sum / sumq , sum ]);
					})
				} else {
					const a = _.groupBy(ss, 'id')[m][0];
					aSale['sales'].push([a['id'], a['name'], '', a['quantity'], a['totalPrice'] / a['quantity'], a['totalPrice']  ]);
				}
			});
			console.log('asale', aSale)
			sale.push(aSale);
		});
		this.sales = sale;
		console.log('sale', this.sales)
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

	download() {
		const vendorSales = JSON.parse(JSON.stringify(this.sales));
		vendorSales.forEach((v:any) => {
			v.sales.unshift(['Code Article', 'Article', 'Quantité conditionnée ', 'Quantité', 'Prix unitaire', 'Sous-total'  ]);
			console.log('a sale', v.sales)
			const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(v.sales);

			/* generate workbook and add the worksheet */
			const wb: XLSX.WorkBook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

			/* save to file */
			XLSX.writeFile(wb, `${v.id}.xlsx`);
		});
	}

	downloadGroupedSales() {
		const vendorSales = JSON.parse(JSON.stringify(this.sales));
		vendorSales.forEach((v:any) => {
			v.sales.forEach((sale: any) => {
				sale.unshift(
					this.salesman[v.id]['Depot'], this.salesman[v.id]['Marque'], this.salesman[v.id]['vendeur'],
					this.salesman[v.id]['codeClient'], this.salesman[v.id]['client'],
					this.salesman[v.id]['emplacement']
				);
			});
		});
		const globalSales = _.flatten(vendorSales.map((m: any) => m.sales));
		console.log('test', globalSales)
		//globalSales.forEach(s => { s[11] = s[9] * s[10] });

		globalSales.unshift([
			'Entrepot ', 'Marque ', 'Vendeur',
			'Code client', 'Client', 'Emplacement',
			'Code Article', 'Article', 'Quantité conditionnée ',
			'Quantité', 'Prix unitaire', 'Sous-total'
		]);

		//const test = [];
		//test.push(globalSales)
		// not optimal but why XD
		//const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(globalSales.filter((f:any) => f[9] !== 0));
		const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(<any>globalSales);

		/* generate workbook and add the worksheet */
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'GlobalSales');

		/* save to file */
		XLSX.writeFile(wb, `Vente Globale.xlsx`);
	}

}
