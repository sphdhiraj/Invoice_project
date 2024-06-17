import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserroleDashboardComponent } from './userrole-dashboard.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild([
    {path:'',component:UserroleDashboardComponent}
  ])],
  exports: [RouterModule]
})
export class UserroleDashboardRoutingModule { }
