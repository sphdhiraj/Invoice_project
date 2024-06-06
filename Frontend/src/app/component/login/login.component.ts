import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AccountModel, LoginDetail } from 'src/service/Model/model';
import { LoginService } from 'src/service/login.service';
import { TokenService } from 'src/service/token.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!:FormGroup;
  constructor(private loginservice:LoginService, private router: Router,private messageService: MessageService,
    private tokenservice:TokenService
  ) { }

  ngOnInit(): void {
    this.formsetup()
    
    const data = this.tokenservice.getOrgInfo()
    console.log(data)
  }

  formsetup(){
    const _builder = new FormBuilder();
    this.loginForm = _builder.group({
      username: new FormControl(''),
      password: new FormControl('',),
     
    });
  }

  loginDetail:any
  loginform(){
      this.loginDetail= new LoginDetail()
      this.loginDetail.UserEmail = this.loginForm.get('username')?.value;
      this.loginDetail.password = this.loginForm.get('password')?.value;
      this.loginservice.loginUser(this.loginDetail)
        .subscribe((response:any) => {
          console.log(response)
          if (response) {
            console.log(response.token)
            this.messageService.add({severity:'success', summary: 'Success', detail:'Login Succesfully'});
            localStorage.setItem('SetToken',JSON.stringify(response.token));
            const organizations = response?.Organizations
            console.log('organizations',organizations)
            localStorage.setItem('org',JSON.stringify(organizations));
            this.fetch_credential(organizations)
            localStorage.setItem('MenuAccess',JSON.stringify(response.AccessRights))
            localStorage.setItem('User',JSON.stringify(response.user))
          }
        }, (error:any) => {
          this.messageService.add({severity:'error', summary: 'Error', detail:'Incorrect username or password'});
        }, () => {
          this.router.navigate(['/inbox']);
        });
    }
    fetch_credential(Detail:AccountModel){
      this.loginservice.fetch_accountDetail(Detail).subscribe((res:any)=>{
        console.log(res)
      })
    }
}
