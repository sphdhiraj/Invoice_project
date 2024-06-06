import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MailattachementComponent } from './component/mailattachement/mailattachement.component';
import { LoginComponent } from './component/login/login.component';
import { ForgotpasswordComponent } from './component/forgotpassword/forgotpassword.component';
import { RegisterComponent } from './component/register/register.component';
import { LayoutComponent } from './component/layout/layout.component';
import { AuthGuard } from 'src/service/auth.guard';


@NgModule({
imports: [
  RouterModule.forRoot([
      {
         
          path: '', canActivate: [AuthGuard], component: LayoutComponent,
          children: [
              { path: 'inbox', loadChildren: () => import('./component/mailattachement/mailattachement.module').then(m => m.MailattachementModule) },
              { path: 'organizations', loadChildren: () => import('./component/organization/organization.module').then(m => m.OrganizationModule) },
              { path: 'user-roles', loadChildren: () => import('./component/userrole/userrole.module').then(m => m.UserroleModule) },
              { path: 'modules', loadChildren: () => import('./component/module-name/module-name.module').then(m => m.ModuleNameModule) },
              { path: 'org-access-rights', loadChildren: () => import('./component/org-access-rights/org-access-rights.module').then(m => m.OrgAccessRightsModule) },
              { path: 'user-access-rights', loadChildren: () => import('./component/user-access-rights/user-access-rights.module').then(m => m.UserAccessRightsModule) },
              { path: 'register', loadChildren: () => import('./component/register/register.module').then(m => m.RegisterModule) },
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
