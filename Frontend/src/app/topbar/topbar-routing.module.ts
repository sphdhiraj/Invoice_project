import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TopbarComponent } from './topbar.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild([
    // {path:'',component:TopbarComponent}
  ])],
  exports: [RouterModule]
})
export class TopbarRoutingModule { }
