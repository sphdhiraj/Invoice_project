import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Organization, UserRole } from 'src/service/Model/model';
import { RegisterService } from 'src/service/register.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  SignForm!:FormGroup;
  organizations: Organization[] = [];
  userRoles: UserRole[] = [];

  userStatus= [
    { value: 'Active', name: 'Active' },
    { value: 'Inactive', name: 'Inactive' }
  ];

  constructor(private registerservice:RegisterService,private messageservice:MessageService) { }

  ngOnInit(): void {
    this.formsetup();
    this.org_Details();
    this.role_Details();
  }

  formsetup() {
    const _builder = new FormBuilder();
    this.SignForm = _builder.group({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3)
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[0-9]).*$') 
      ]),
      organizationID: new FormControl('', [
        Validators.required
      ]),
      
      userEmail: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      userPhone: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$') 
      ]),
      
      userStatus: ['', Validators.required],
      userRoleId: new FormControl('', [
        Validators.required
      ]),
    });

  }

  org_Details(){
    // Fetch organizations from the service
    this.registerservice.getOrganizations().subscribe(data => {
      this.organizations = data;
    });
  
  }

  role_Details(){
    // Fetch user roles from the service
    this.registerservice.getUserRoles().subscribe(data => {
      this.userRoles = data;
    });
  }

  signupForm() {
    // const user = this.SignForm.get('username')?.value;
    // const password = this.SignForm.get('password')?.value;
    //console.log(this.SignForm.value);

    if (this.SignForm.invalid) {
      this.SignForm.markAllAsTouched(); // Highlight invalid fields
      return;
    }

    const formValues = this.SignForm.value;
    //console.log(formValues);
    this.registerservice.postUserDetails(formValues)
      .subscribe((response:any) => {
        console.log('Success!', response);
        this.messageservice.add({severity:'success', summary: 'Success', detail:'Sign Up Succesfully'});
      }, (error:any) => {
        console.error('Error!', error);
        this.messageservice.add({severity:'error', summary: 'Error', detail:'username or password already exist'});
      });
  }
}
