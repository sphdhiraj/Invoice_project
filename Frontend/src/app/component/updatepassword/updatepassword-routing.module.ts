import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UpdatepasswordComponent } from './updatepassword.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild([
    {path:'',component:UpdatepasswordComponent}
  ])],
  exports: [RouterModule]
})
export class UpdatepasswordRoutingModule { }
