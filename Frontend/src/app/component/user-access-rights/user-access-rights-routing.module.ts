import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserAccessRightsComponent } from './user-access-rights.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild([
    {path:'',component:UserAccessRightsComponent}
  ])],
  exports: [RouterModule]
})
export class UserAccessRightsRoutingModule { }
