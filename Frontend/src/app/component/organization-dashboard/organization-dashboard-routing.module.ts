import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationDashboardComponent } from './organization-dashboard.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild([
    {path:'',component:OrganizationDashboardComponent}
  ])],
  exports: [RouterModule]
})
export class OrganizationDashboardRoutingModule { }
