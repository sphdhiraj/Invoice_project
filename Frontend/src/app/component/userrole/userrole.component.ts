import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Organization, UserRole } from 'src/service/Model/model';
import { LoginService } from 'src/service/login.service';
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
  menuRights:any = [];
  menuRightsListfetched:any;
  userRights: any;
  roleId: string | null = null;
  isEdit = false;

  constructor(private userroleService: UserroleService,private messageservice:MessageService,
    private loginservice: LoginService,private router: Router,private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.formsetup();
    this.getEditValues();
    this.org_Details();

    this.menuRightsListfetched = this.loginservice.GetMenuRights();
    this.menuRights = JSON.parse(this.menuRightsListfetched);
    this.userRights = this.menuRights.filter((e:any)=>e.displayName == 'Invoice');
     console.log(this.userRights);
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

  getEditValues(){
    this.activatedRoute.queryParams.subscribe(params => {
      this.roleId = params['roleId'];
      
      if (this.roleId) {
        this.isEdit = true;
        this.userroleService.getUserRoleById(this.roleId).subscribe(
          response => {
            const userrole = response.userRole; // Access the nested user object
            console.log('Received UserRole:', userrole);
            if (userrole) {
              this.UserForm.setValue({
                OrgID: userrole.orgId,
                roleName: userrole.roleName,
                roleStatus: userrole.roleStatus,
              });
            } else {
              console.error('UserRole data is null or undefined.');
            }
          },
          error => {
            console.error('Error fetching userrole details:', error);
          }
        );
      } else {
        console.error('userroleId is missing.');
      }
    });
  }

  user_Form(){
    if (this.UserForm.invalid) {
      this.UserForm.markAllAsTouched(); // Highlight invalid fields
      return;
    }

    const formValues = this.UserForm.value;
    //console.log(formValues);
    // this.userroleService.postUserRoleDetails(formValues)
    //   .subscribe((response:any) => {
    //     console.log('Success!', response);
    //     this.messageservice.add({severity:'success', summary: 'Success', detail:'Sign Up Succesfully'});
    //     this.router.navigate(['/user-roles']);
    //   }, (error:any) => {
    //     console.error('Error!', error);
    //     this.messageservice.add({severity:'error', summary: 'Error', detail:'username or password already exist'});
    //   });

    if (this.isEdit) {
      const userroleToUpdate = {
        ...formValues,
        roleId: this.roleId
      };
  
      this.userroleService.updateUserRole(userroleToUpdate).subscribe(
        response => {
          console.log('User-role updated successfully!', response);
          this.messageservice.add({severity:'success', summary: 'Success', detail:'User updated successfully'});
          this.router.navigate(['/user-roles']); // Redirect to user list or appropriate page
        },
        error => {
          console.error('Error updating user:', error);
          this.messageservice.add({severity:'error', summary: 'Error', detail:'Error updating user'});
        }
      );
    } else {
      this.userroleService.postUserRoleDetails(formValues).subscribe(
        response => {
          console.log('User created successfully!', response);
          this.messageservice.add({severity:'success', summary: 'Success', detail:'User created successfully'});
          this.router.navigate(['/user-roles']); // Redirect to user list or appropriate page
        },
        error => {
          console.error('Error creating user:', error);
          this.messageservice.add({severity:'error', summary: 'Error', detail:'Error creating user'});
        }
      );
    }
  }

}


