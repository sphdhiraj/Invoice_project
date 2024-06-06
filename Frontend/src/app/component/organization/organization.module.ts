import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationRoutingModule } from './organization-routing.module';
import { OrganizationComponent } from './organization.component';
import { HttpClientModule } from '@angular/common/http';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TabViewModule } from 'primeng/tabview';
import { DialogModule } from 'primeng/dialog';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { FieldsetModule } from 'primeng/fieldset';
import { AccordionModule } from 'primeng/accordion';


@NgModule({
  declarations: [OrganizationComponent],
  imports: [
    CommonModule,
    OrganizationRoutingModule,
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
    AccordionModule,
    ReactiveFormsModule,
    CheckboxModule,
    InputTextModule,
    TableModule,
    TabViewModule,
    TableModule
  ]
})
export class OrganizationModule { }
