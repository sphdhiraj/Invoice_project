import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { LoginService } from 'src/service/login.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  SignForm!:FormGroup;
  constructor(private loginservice:LoginService,private messageservice:MessageService) { }

  ngOnInit(): void {
    this.formsetup()
  }

  formsetup(){
    const _builder = new FormBuilder();
    this.SignForm = _builder.group({
      username: new FormControl(''),
      password: new FormControl('',),
     
    });
  }

  signupForm() {
    const user = this.SignForm.get('username')?.value;
    const password = this.SignForm.get('password')?.value;
    this.loginservice.postUserCredentials(user, password)
      .subscribe((response:any) => {
        console.log('Success!', response);
        this.messageservice.add({severity:'success', summary: 'Success', detail:'Sign Up Succesfully'});
      }, (error:any) => {
        console.error('Error!', error);
        this.messageservice.add({severity:'error', summary: 'Error', detail:'username or password already exist'});
      });
  }

}
