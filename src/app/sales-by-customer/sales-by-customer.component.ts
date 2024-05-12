import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';

@Component({
  selector: 'app-sales-by-customer',
  templateUrl: './sales-by-customer.component.html',
  styleUrls: ['./sales-by-customer.component.scss']
})
export class SalesByCustomerComponent {
  file!: File;
	arrayBuffer: any;
	salesmanList: any = [];
	data: any = [];
  	customerList: any = [];
	customers: any = [];
	sales: any = [];
	salesman: any = {};
	selected: any = [];

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
			this.salesmanList = _.compact(_.uniqBy(arr.map((m: any) => ({ salesmanName: m['SALESMAN_NAME'], salesmanId: m['SALESMAN_CODE'] })), 'salesmanId'));
			this.customerList = _.compact(_.uniqBy(arr.map((m: any) => ({ salesman: m['SALESMAN_NAME'], salesmanId: m['SALESMAN_CODE'] ,id: m['CUSTOMER_CODE'], name: m['CUSTOMER_NAME']})), 'id'));
			this.customers = [...this.customerList];
		};
		fileReader.readAsArrayBuffer(this.file);
	}

  	selectVendor(event: any) {
		let ct: any = [];
		event.value.forEach((v: any) => {
      		this.customerList.filter((f: any) => f['salesmanId'] === v).forEach((t: any) => { ct.push(t) })
		});
    	this.customers = ct;
	}

    selectCustomer(event: any) {
		const sale: any = [];
		event.value.forEach((v: any) => {
			const aSale: any = { id: v['id'], name: v['name'], sales: [], globalSales: []};
			const ss: any = [];
			this.data.filter((f:any) => f['CUSTOMER_CODE'] === v['id']).forEach((s: any) => {
				ss.push({
					id: s['ITEM_CODE'],
					name: s['ITEM_NAME'],
					price: '' ,
					quantity: s['QTY_IN_PIECE'],
					totalPrice: s['NET_VALUE'],
					orderNumber: s['ORDERNO']
				});
			});
			aSale['globalSales'] =ss;
			Object.keys(_.groupBy(ss, 'id')).map(m => {
				if (_.groupBy(ss, 'id')[m].length > 1) {
					const t = _.groupBy(_.groupBy(ss, 'id')[m], 'id');
					Object.keys(t).forEach(e => {
						const freeSales = t[e].filter(f => f['totalPrice'] === 0);
						const notFreeSales = t[e].filter(f => f['totalPrice'] !== 0);
						
						const aon =notFreeSales.map(p => p['totalPrice']);
						const sum = _.reduce(aon, function(a, b) { return a + b; }, 0);

						const aonq = notFreeSales.map(p => p['quantity']);
						const sumq = _.reduce(aonq, function(a, b) { return a + b; }, 0);

						if(sumq > 0 ) {
							if(sum === 0 ) {
								aSale['sales'].push([t[e][0]['id'], t[e][0]['name'], '', sumq, 0.001 , 0 ]);
							} else {
								aSale['sales'].push([t[e][0]['id'], t[e][0]['name'], '', sumq, sum / sumq , 0 ]);
							}
						}
						
						const aonn =freeSales.map(p => p['totalPrice']);
						const sumn = _.reduce(aonn, function(a, b) { return a + b; }, 0);

						const aonqn = freeSales.map(p => p['quantity']);
						const sumqn = _.reduce(aonqn, function(a, b) { return a + b; }, 0);
						
						// total quantities more than 0 to avoid having articles with 0 quantity
						if(sumqn > 0 ) {
							if(sumn === 0 ) {
								aSale['sales'].push([t[e][0]['id'], t[e][0]['name'], '', sumqn, 0.001 , 0 ]);

							} else {
								aSale['sales'].push([t[e][0]['id'], t[e][0]['name'], '', sumqn, sumn / sumqn , 0 ]);
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
		this.selected = event.value;
    }

	download() {
		const customerSales = JSON.parse(JSON.stringify(this.sales));	
		customerSales.forEach((v:any) => {
			const byOrder = _.groupBy(v['globalSales'], 'orderNumber');
			Object.keys(byOrder).forEach(e => {
				let sale: any = [];
				byOrder[e].forEach(el => {
					if(el['totalPrice'] === 0) {
						sale.push([el['id'], el['name'], '', el['quantity'], 0.001, el['quantity'] * 0.001])
					} else {
						sale.push([el['id'], el['name'], '', el['quantity'], el['totalPrice'] / el['quantity'], el['totalPrice']])
					}
				})					
				sale.unshift(['Code Article', 'Article', 'Quantité conditionnée ', 'Quantité', 'Prix unitaire', 'Sous-total'  ])
				const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sale);
				const wb: XLSX.WorkBook = XLSX.utils.book_new();
				XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
				XLSX.writeFile(wb, `${v.name} - ${e}.xlsx`);
			})
		});
	}

	downloadSingle() {
		const vendorSales = JSON.parse(JSON.stringify(this.sales));
		vendorSales.forEach((v:any) => {
			v.sales.map((m:any) => {
				if(m[4] === 0) { m[4] = 0.001 }
			})
			v.sales.map((m:any) => m[5] = m[4] * m[3]);

			v.sales.unshift(['Code Article', 'Article', 'Quantité conditionnée ', 'Quantité', 'Prix unitaire', 'Sous-total'  ])
			const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(v.sales);
			/* generate workbook and add the worksheet */
			const wb: XLSX.WorkBook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
			/* save to file */
			XLSX.writeFile(wb, `${v.name}.xlsx`);
		});
	}

	downloadGroupedSales() {
		const vendorSales = JSON.parse(JSON.stringify(this.sales));
		vendorSales.forEach((v:any) => {
			v.sales.forEach((sale: any) => {
				sale.unshift(
					this.salesman[v.name]['Depot'], this.salesman[v.name]['Marque'], this.salesman[v.name]['vendeur'],
					this.salesman[v.name]['codeClient'], this.salesman[v.name]['client'],
					this.salesman[v.name]['emplacement']
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

	downloadFiltredSales() {
		const ss: any = [];
		// not selected
		_.difference(this.customers, this.selected).forEach((v: any) => {
			this.data.filter((f:any) => f['CUSTOMER_CODE'] === v['id']).forEach((s: any) => {
				ss.push({
					id: s['ITEM_CODE'],
					name: s['ITEM_NAME'],
					price: '' ,
					quantity: s['QTY_IN_PIECE'],
					totalPrice: s['NET_VALUE'],
					orderNumber: s['ORDERNO']
				});
			});
		});
		const sales: any = [];
		Object.keys(_.groupBy(ss, 'id')).map(m => {
			if (_.groupBy(ss, 'id')[m].length > 1) {
				const t = _.groupBy(_.groupBy(ss, 'id')[m], 'id');
				Object.keys(t).forEach(e => {
					const freeSales = t[e].filter(f => f['totalPrice'] === 0);
					const notFreeSales = t[e].filter(f => f['totalPrice'] !== 0);
					
					const aon =notFreeSales.map(p => p['totalPrice']);
					const sum = _.reduce(aon, function(a, b) { return a + b; }, 0);

					const aonq = notFreeSales.map(p => p['quantity']);
					const sumq = _.reduce(aonq, function(a, b) { return a + b; }, 0);

					if(sumq > 0 ) {
						sales.push([t[e][0]['id'], t[e][0]['name'], '', sumq, sum / sumq , 0 ]);
					}
					const aonn =freeSales.map(p => p['totalPrice']);
					const sumn = _.reduce(aonn, function(a, b) { return a + b; }, 0);

					const aonqn = freeSales.map(p => p['quantity']);
					const sumqn = _.reduce(aonqn, function(a, b) { return a + b; }, 0);
					if(sumqn > 0 ) {
						// total quantities more than 0 to avoid having articles with 0 quantity
						sales.push([t[e][0]['id'], t[e][0]['name'], '', sumqn, sumn / sumqn , 0 ]);
					}
				})
			} else {
				const a = _.groupBy(ss, 'id')[m][0];
				sales.push([a['id'], a['name'], '', a['quantity'], a['totalPrice'] / a['quantity'], a['totalPrice']  ]);
			}
		});
		sales.forEach((sale: any) => {
			sale.unshift(
				this.salesman[this.customers[0]['salesman']]['Depot'], this.salesman[this.customers[0]['salesman']]['Marque'], this.salesman[this.customers[0]['salesman']]['vendeur'],
				this.salesman[this.customers[0]['salesman']]['codeClient'], this.salesman[this.customers[0]['salesman']]['client'],
				this.salesman[this.customers[0]['salesman']]['emplacement']
			);
		});

		sales.forEach((s:any) => { s[11] = s[9] * s[10] });

		sales.unshift([
			'Entrepot ', 'Marque ', 'Vendeur',
			'Code client', 'Client', 'Emplacement',
			'Code Article', 'Article', 'Quantité conditionnée ',
			'Quantité', 'Prix unitaire', 'Sous-total'
		]);

		// not optimal but why XD
		const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(<any>sales);

		/* generate workbook and add the worksheet */
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'GlobalSales');

		/* save to file */
		XLSX.writeFile(wb, `Vente Globale ${this.customers[0]['salesman']}.xlsx`);
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
