import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserprofileComponent } from './userprofile.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild([
    {path:'',component:UserprofileComponent}
  ])],
  exports: [RouterModule]
})
export class UserprofileRoutingModule { }
