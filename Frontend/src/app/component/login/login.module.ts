import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { ToastModule } from 'primeng/toast';
import { LoginComponent } from './login.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    LoginRoutingModule
  ]
})
export class LoginModule { }
