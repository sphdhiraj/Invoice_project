import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Organization, UserRole } from 'src/service/Model/model';
import { LoginService } from 'src/service/login.service';
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
  menuRights:any = [];
  menuRightsListfetched:any;
  userRights: any;
  userId: string | null = null;
  isEdit = false;

  userStatus= [
    { value: 'Active', name: 'Active' },
    { value: 'Inactive', name: 'Inactive' }
  ];

  constructor(private registerservice:RegisterService,private messageservice:MessageService,
    private loginservice: LoginService,private activatedRoute: ActivatedRoute,private router: Router
  ) { }

  ngOnInit(): void {
    this.formsetup();
    this.org_Details();
    this.role_Details();
    this.getEditValues();

    this.menuRightsListfetched = this.loginservice.GetMenuRights();
    this.menuRights = JSON.parse(this.menuRightsListfetched);
    this.userRights = this.menuRights.filter((e:any)=>e.displayName == 'Invoice');
     console.log(this.userRights);
  }

  formsetup() {
    const _builder = new FormBuilder();
    this.SignForm = _builder.group({
      // name: new FormControl('', [
      //   Validators.required,
      // ]),
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3)
      ]),
      password: new FormControl('', [
        Validators.required,
        //Validators.minLength(8),
        //Validators.pattern('^(?=.*[0-9]).*$') 
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
        //Validators.pattern('^[0-9]{10}$') 
      ]),
      userAddress: new FormControl('', [
        Validators.required,
        Validators.minLength(3)
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

  getEditValues(){
    this.activatedRoute.queryParams.subscribe(params => {
      this.userId = params['userId'];
      
      if (this.userId) {
        this.isEdit = true;
        this.registerservice.getUserById(this.userId).subscribe(
          response => {
            const user = response.user; // Access the nested user object
            console.log('Received User:', user);
            if (user) {
              this.SignForm.setValue({
                organizationID: user.organizationId,
                //name: user.name,
                name: user.name,
                password: user.password,
                userEmail: user.userEmail,
                userPhone: user.userPhone,
                userAddress: user.userAddress,
                userStatus: user.userStatus,
                userRoleId: user.userRoleId,
              });
            } else {
              console.error('User data is null or undefined.');
            }
          },
          error => {
            console.error('Error fetching user details:', error);
          }
        );
      } else {
        console.error('userId is missing.');
      }
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
    //console.log(formValues)
    if (this.isEdit) {
      const userToUpdate = {
        ...formValues,
        userId: this.userId
      };
  
      this.registerservice.updateUser(userToUpdate).subscribe(
        response => {
          console.log('User updated successfully!', response);
          this.messageservice.add({severity:'success', summary: 'Success', detail:'User updated successfully'});
          this.router.navigate(['/users']); // Redirect to user list or appropriate page
        },
        error => {
          console.error('Error updating user:', error);
          this.messageservice.add({severity:'error', summary: 'Error', detail:'Error updating user'});
        }
      );
    } else {
      this.registerservice.postUserDetails(formValues).subscribe(
        response => {
          console.log('User created successfully!', response);
          this.messageservice.add({severity:'success', summary: 'Success', detail:'User created successfully'});
          this.router.navigate(['/users']); // Redirect to user list or appropriate page
        },
        error => {
          console.error('Error creating user:', error);
          this.messageservice.add({severity:'error', summary: 'Error', detail:'Error creating user'});
        }
      );
    }
  }
}
