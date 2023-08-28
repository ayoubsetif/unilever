import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesComponent } from './sales/sales.component';
import { MainComponent } from './main/main.component';
import { SalesByCustomerComponent } from './sales-by-customer/sales-by-customer.component';

const routes: Routes = [
	{ component: MainComponent, path : '' },
	{ component: SalesComponent, path : 'sales-salemsan' },
	{ component: SalesByCustomerComponent, path : 'sales-customer' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
