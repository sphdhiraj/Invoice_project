import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { LoginService } from 'src/service/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!:FormGroup;
  constructor(private loginservice:LoginService, private router: Router,private messageService: MessageService) { }

  ngOnInit(): void {
    this.formsetup()
  }

  formsetup(){
    const _builder = new FormBuilder();
    this.loginForm = _builder.group({
      username: new FormControl(''),
      password: new FormControl('',),
     
    });
  }

loginform(){
    const user = this.loginForm.get('username')?.value;
    const password = this.loginForm.get('password')?.value;
    this.loginservice.login(user, password)
      .subscribe((response:any) => {
        console.log(response)
        if (response?.success =='login succesfully' ) {
          console.log('logged in successfully');
          this.messageService.add({severity:'success', summary: 'Success', detail:'Login Succesfully'});
          localStorage.setItem('SetToken',JSON.stringify(response?.access_token));
        }
      }, (error:any) => {
        this.messageService.add({severity:'error', summary: 'Error', detail:'Incorrect username or password'});
      }, () => {
        this.router.navigate(['/inbox']);
      });
  }
}
