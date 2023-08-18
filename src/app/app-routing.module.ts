import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesComponent } from './sales/sales.component';
import { MainComponent } from './main/main.component';

const routes: Routes = [
	{ component: MainComponent, path : '' },
	{ component: SalesComponent, path : 'sales' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
