import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrgAccessRightsComponent } from './org-access-rights.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild([
    {path:'',component:OrgAccessRightsComponent}
  ])],
  exports: [RouterModule]
})
export class OrgAccessRightsRoutingModule { }
