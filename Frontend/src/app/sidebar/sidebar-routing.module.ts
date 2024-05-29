import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SidebarComponent } from './sidebar.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild([
    // {path:'',component:SidebarComponent}
  ])],
  exports: [RouterModule]
})
export class SidebarRoutingModule { }
