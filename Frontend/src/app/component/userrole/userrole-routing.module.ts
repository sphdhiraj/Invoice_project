import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserroleComponent } from './userrole.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild([
    {path:'',component:UserroleComponent}
  ])],
  exports: [RouterModule]
})
export class UserroleRoutingModule { }
