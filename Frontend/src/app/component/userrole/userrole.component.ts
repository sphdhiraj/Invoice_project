import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Organization, UserRole } from 'src/service/Model/model';
import { UserroleService } from 'src/service/userrole.service';

@Component({
  selector: 'app-userrole',
  templateUrl: './userrole.component.html',
  styleUrls: ['./userrole.component.scss']
})
export class UserroleComponent implements OnInit {

  UserForm!:FormGroup;
  userRoles: UserRole[] = [];
  organizations: Organization[] = [];
  roleStatus= [
    { value: 'Active', name: 'Active' },
    { value: 'Inactive', name: 'Inactive' }
  ];
  constructor(private userroleService: UserroleService,private messageservice:MessageService) { }

  ngOnInit(): void {
    this.formsetup();
    this.org_Details();
  }

  formsetup() {
    const _builder = new FormBuilder();
    this.UserForm = _builder.group({
      OrgID: new FormControl('', [
        Validators.required
      ]),
      roleName: new FormControl('', [
        Validators.required,
        Validators.minLength(3)
      ]),
      
      roleStatus: new FormControl('', [
        Validators.required
      ]),
    });
  }

  org_Details(){
    // Fetch organizations from the service
    this.userroleService.getOrganizations().subscribe(data => {
      this.organizations = data;
    });
  
  }

  user_Form(){
    if (this.UserForm.invalid) {
      this.UserForm.markAllAsTouched(); // Highlight invalid fields
      return;
    }

    const formValues = this.UserForm.value;
    //console.log(formValues);
    this.userroleService.postUserRoleDetails(formValues)
      .subscribe((response:any) => {
        console.log('Success!', response);
        this.messageservice.add({severity:'success', summary: 'Success', detail:'Sign Up Succesfully'});
      }, (error:any) => {
        console.error('Error!', error);
        this.messageservice.add({severity:'error', summary: 'Error', detail:'username or password already exist'});
      });
  }

}

