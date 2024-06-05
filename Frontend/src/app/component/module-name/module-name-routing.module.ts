import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModuleNameComponent } from './module-name.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild([
    {path:'',component:ModuleNameComponent}
  ])],
  exports: [RouterModule]
})
export class ModuleNameRoutingModule { }
