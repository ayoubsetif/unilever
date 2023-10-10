import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SalesComponent } from './sales/sales.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MainComponent } from './main/main.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SalesByCustomerComponent } from './sales-by-customer/sales-by-customer.component';
import { VerifyStockComponent } from './verify-stock/verify-stock.component';
import { MatTableModule } from '@angular/material/table';
import { AchatComponent } from './achat/achat.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmDownloadDialogComponent } from './confirm-download-dialog/confirm-download-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    SalesComponent,
    MainComponent,
    SalesByCustomerComponent,
    VerifyStockComponent,
    AchatComponent,
    ConfirmDownloadDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
