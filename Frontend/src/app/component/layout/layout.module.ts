import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutRoutingModule } from './layout-routing.module';
import { SidebarComponent } from 'src/app/sidebar/sidebar.component';
import { TopbarComponent } from 'src/app/topbar/topbar.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableCheckbox, TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
// import { BsModalService } from 'ngx-bootstrap/modal';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { DropdownModule } from 'primeng/dropdown';
import { FieldsetModule } from 'primeng/fieldset';
import { AccordionModule } from 'primeng/accordion';
import { LayoutComponent } from './layout.component';
import { MenuitemComponent } from '../menuitem/menuitem.component';
import { MenuComponent } from '../menu/menu.component';

@NgModule({
  declarations: [
    SidebarComponent,
    TopbarComponent,
    LayoutComponent,
    MenuitemComponent,
    MenuComponent
  ],
  imports: [
    CommonModule,
    LayoutRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    CheckboxModule,
    InputTextModule,
    TabViewModule,
    TooltipModule,
    DialogModule,
    StyleClassModule,
    ButtonModule,
    NgxDocViewerModule,
    ToastModule ,
    DropdownModule,
    FieldsetModule,
    AccordionModule
   
  ],
   exports: [LayoutComponent]
})
export class LayoutModule { }
