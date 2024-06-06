import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationComponent } from './organization.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild([
    {path:'',component:OrganizationComponent}
  ])],
  exports: [RouterModule]
})
export class OrganizationRoutingModule { }
