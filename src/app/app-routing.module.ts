import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesComponent } from './sales/sales.component';
import { MainComponent } from './main/main.component';
import { SalesByCustomerComponent } from './sales-by-customer/sales-by-customer.component';
import { VerifyStockComponent } from './verify-stock/verify-stock.component';
import { AchatComponent } from './achat/achat.component';
import { ChargingComponent } from './charging/charging.component';


const routes: Routes = [
	{ component: MainComponent, path : '' },
	{ component: SalesComponent, path : 'sales-salemsan' },
	{ component: SalesByCustomerComponent, path : 'sales-customer' },
	{ component: VerifyStockComponent, path : 'stock' },
	{ component: AchatComponent, path : 'achat-erp' },
	{ component: ChargingComponent, path : 'charging' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
