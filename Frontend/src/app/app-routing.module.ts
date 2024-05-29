import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MailattachementComponent } from './component/mailattachement/mailattachement.component';
import { LoginComponent } from './component/login/login.component';
import { ForgotpasswordComponent } from './component/forgotpassword/forgotpassword.component';
import { RegisterComponent } from './component/register/register.component';
import { LayoutComponent } from './component/layout/layout.component';
import { AuthGuard } from 'src/service/auth.guard';


// const routes: Routes = [
//   // { path: '', redirectTo: 'dashboard', pathMatch: 'full' },    
//   { path: 'inbox',component:MailattachementComponent},    
//   { path: 'login',component:LoginComponent}, 
//   { path: 'register',component:RegisterComponent}, 
//   { path: 'forgot',component:ForgotpasswordComponent}, 
//   // { path: '**', redirectTo: 'login' },   
 
// ];

// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   exports: [RouterModule]
// })
@NgModule({
imports: [
  RouterModule.forRoot([
      {
         
          path: '', canActivate: [AuthGuard], component: LayoutComponent,
          children: [
              { path: 'inbox', loadChildren: () => import('./component/mailattachement/mailattachement.module').then(m => m.MailattachementModule) },
          ]
      },
      { path: 'login',component:LoginComponent}, 
      { path: 'register',component:RegisterComponent}, 
      { path: 'forgot',component:ForgotpasswordComponent}, 
      { path: '**', redirectTo: 'login' }, 
      ])
    ], exports: [RouterModule]
  })
export class AppRoutingModule { }
