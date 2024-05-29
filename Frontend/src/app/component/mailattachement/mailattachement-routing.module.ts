import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MailattachementComponent } from './mailattachement.component';

// const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild([
    {path:'',component:MailattachementComponent}
  ])],
  exports: [RouterModule]
})
export class MailattachementRoutingModule { }
