import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopbarComponent } from './topbar/topbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TopbarRoutingModule } from './topbar/topbar-routing.module';
import { SidebarRoutingModule } from './sidebar/sidebar-routing.module';
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
import { MailattachementComponent } from './component/mailattachement/mailattachement.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { DropdownModule } from 'primeng/dropdown';
import { FieldsetModule } from 'primeng/fieldset';
import { AccordionModule } from 'primeng/accordion';
import { LoginComponent } from './component/login/login.component';
import { ForgotpasswordComponent } from './component/forgotpassword/forgotpassword.component';
import { RegisterComponent } from './component/register/register.component';
import { LayoutComponent } from './component/layout/layout.component';
import { LayoutModule } from './component/layout/layout.module';
import { MessageService } from 'primeng/api';
import { UserroleComponent } from './component/userrole/userrole.component';
import { OrganizationComponent } from './component/organization/organization.component';
import { ModuleNameComponent } from './component/module-name/module-name.component';
import { OrgAccessRightsComponent } from './component/org-access-rights/org-access-rights.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { UserAccessRightsComponent } from './component/user-access-rights/user-access-rights.component';
//import { UserAccessRightsComponent } from './component/user-access-rights/user-access-rights.component';
//import { NgSelectModule } from '@ng-select/ng-select';



@NgModule({
  declarations: [
    AppComponent,
    // SidebarComponent,
    // TopbarComponent,
    // MailattachementComponent,
    LoginComponent,
    ForgotpasswordComponent,
    RegisterComponent,
    UserroleComponent,
    OrganizationComponent,
    ModuleNameComponent,
    OrgAccessRightsComponent,
    UserAccessRightsComponent,
    // LayoutComponent,
  
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
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
    AccordionModule,
    LayoutModule,
    MultiSelectModule,
  ],
  providers: [ MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
