import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesComponent } from './sales/sales.component';
import { MainComponent } from './main/main.component';
import { SalesByCustomerComponent } from './sales-by-customer/sales-by-customer.component';
import { VerifyStockComponent } from './verify-stock/verify-stock.component';

const routes: Routes = [
	{ component: MainComponent, path : '' },
	{ component: SalesComponent, path : 'sales-salemsan' },
	{ component: SalesByCustomerComponent, path : 'sales-customer' },
	{ component: VerifyStockComponent, path : 'stock' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
