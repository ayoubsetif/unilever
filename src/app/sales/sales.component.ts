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
	dashboard: any = [];
	displayedColumns: string[] = ['salesman', 'totalNetValue', 'orderStatus'];
	firstDate: string = '';
	lastDate: string = '';

	ngOnInit() {
		this.salesman =  JSON.parse(localStorage.getItem('configUnilever')!);
	}

    uploadFile(event: any) {
		this.file = event.target.files[0];
		const fileReader = new FileReader();
		fileReader.onload = (e) => {
			const worksheet = this.readFile(fileReader);
			const arr = XLSX.utils.sheet_to_json(worksheet, {raw: true });
			this.data = arr;	
			this.firstDate = _.head(_.compact(_.uniq(arr.map((m: any) => m['DELIVERYDATE']))));
			this.lastDate =  _.last(_.compact(_.uniq(arr.map((m: any) => m['DELIVERYDATE']))));
			const dashbord: any = [];
			const bySalesamn = _.groupBy(arr, 'SALESMAN_NAME');
			Object.keys(bySalesamn).map(m => {
				// console.log('m', m);
				const aon = bySalesamn[m].map((p:any) => p['NET_VALUE']);
				const netValue = _.reduce(aon, function(a, b) { return a + b; }, 0);
				// console.log('status', _.compact(_.uniq(arr.filter((f:any)=> f['SALESMAN_NAME'] === m  ).map((m: any) => m['ORDER_STATUS']))))
				dashbord.push({
					salesman: m,
					netValue: netValue.toFixed(2),
					status: _.compact(_.uniq(arr.filter((f:any)=> f['SALESMAN_NAME'] === m  ).map((m: any) => m['ORDER_STATUS'])))
				})
			})
			this.dashboard = dashbord;
			this.salesmanList = _.compact(_.uniq(arr.map((m: any) => m['SALESMAN_NAME'])));
		};
		fileReader.readAsArrayBuffer(this.file);
	}

	selectVendor(event: any) {
		const sale: any = [];
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
						if(sumq > 0 ) {
							// total quantities more than 0 to avoid having articles with 0 quantity
							if(sum === 0 ) {
								//price for ERP use avoid simple 0 and do 0.001 instead
								aSale['sales'].push([t[e][0]['id'], t[e][0]['name'], '', sumq, 0.001  , 0  ]);
							} else {
								aSale['sales'].push([t[e][0]['id'], t[e][0]['name'], '', sumq, sum / sumq , 0 ]);
							}
						}
					})
				} else {
					const a = _.groupBy(ss, 'id')[m][0];
					aSale['sales'].push([a['id'], a['name'], '', a['quantity'], a['totalPrice'] / a['quantity'], a['totalPrice']  ]);
				}
			});
			sale.push(aSale);
		});
		this.sales = sale;
	}

	download() {
		const vendorSales = JSON.parse(JSON.stringify(this.sales));
		vendorSales.forEach((v:any) => {
			v.sales.map((m:any) => m[5] = m[4] * m[3]);
			v.sales.unshift(['Code Article', 'Article', 'Quantité conditionnée ', 'Quantité', 'Prix unitaire', 'Sous-total'  ])
			
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
		globalSales.forEach((s:any) => { s[11] = s[9] * s[10] });

		globalSales.unshift([
			'Entrepot ', 'Marque ', 'Vendeur',
			'Code client', 'Client', 'Emplacement',
			'Code Article', 'Article', 'Quantité conditionnée ',
			'Quantité', 'Prix unitaire', 'Sous-total'
		]);

		// not optimal but why XD
		const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(<any>globalSales);

		/* generate workbook and add the worksheet */
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'GlobalSales');

		/* save to file */
		XLSX.writeFile(wb, `Vente Globale.xlsx`);
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
