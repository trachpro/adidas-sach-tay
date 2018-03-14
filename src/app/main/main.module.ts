import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { 
  MatDialogModule, 
  MatButtonModule, 
  MatCheckboxModule,
  MatMenuModule,
  MatToolbarModule,
  MatIconModule,
  MatCardModule,
  MatSidenavModule,
  MatFormFieldModule,
  MatInputModule,
  MatTooltipModule, 
  MatRadioModule,
  MatAutocompleteModule,
  MatDatepickerModule, 
  MatNativeDateModule
} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';

import { MainRoutes } from './main.routers';
import { ListUserComponent } from './list-user/list-user.component';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';

import { UserPipe } from '../pipe/user.pipe';
import { TimePipe } from '../pipe/time.pipe';
import { OrdersComponent } from './orders/orders.component';
import { BillsComponent } from './bills/bills.component';
import { BillComponent } from './bills/bill/bill.component';
import { ListProductComponent } from './list-product/list-product.component';
import { ProductComponent } from './list-product/product/product.component';
import { AssignOrderComponent } from './assign-order/assign-order.component';
import { SelectProductComponent } from './assign-order/select-product/select-product.component';
import { HistoryComponent } from './history/history.component';
import { TestComponent } from './test/test.component';


import { ProductTableComponent } from './product-table/product-table.component';
import { ReceiverComponent } from './receiver/receiver.component';



@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(MainRoutes),
    MatDialogModule,
    MatButtonModule, 
    MatCheckboxModule,
    FormsModule,
    MatSelectModule,
    MultiselectDropdownModule,
    MatFormFieldModule, 
    MatInputModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatSidenavModule,
    MatTooltipModule,
    MatRadioModule,
    MatAutocompleteModule,
    MatDatepickerModule, 
    MatNativeDateModule
  ],
  declarations: [
    MainComponent, 
    ListUserComponent, 
    UserPipe,
    TimePipe,
    OrdersComponent,
    BillsComponent,
    BillComponent,
    ListProductComponent,
    ProductComponent,
    AssignOrderComponent,
    SelectProductComponent,
    HistoryComponent,
    TestComponent,
    ProductTableComponent,
    ReceiverComponent,
  ],
  entryComponents: [
    SelectProductComponent,
    BillComponent,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
})
export class MainModule { }
