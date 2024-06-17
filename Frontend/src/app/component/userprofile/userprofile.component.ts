import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { LoginService } from 'src/service/login.service';
import { RegisterService } from 'src/service/register.service';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.scss']
})
export class UserprofileComponent implements OnInit {

  profileForm!:FormGroup;
  //organizations: Organization[] = [];
  //userRoles: UserRole[] = [];
  menuRights:any = [];
  menuRightsListfetched:any;
  userRights: any;
  isEdit = true;
  userDetails: any;
  username: any;
  phone: any;
  address: any;
  userId: any;

  // userStatus= [
  //   { value: 'Active', name: 'Active' },
  //   { value: 'Inactive', name: 'Inactive' }
  // ];

  constructor(private registerservice:RegisterService,private messageservice:MessageService,
    private loginservice: LoginService,private activatedRoute: ActivatedRoute,private router: Router
  ) { }

  ngOnInit(): void {
    this.formsetup();
    
    const user = this.loginservice.loginDetails();
    console.log(user);
    this.userDetails = JSON.parse(user);
    console.log(this.userDetails);
    this.userId = this.userDetails["userId"];
    console.log(this.userId);
    this.username = this.userDetails["name"];
    console.log(this.username);
    this.phone = this.userDetails["userPhone"];
    console.log(this.phone);
    this.address = this.userDetails["userAddress"];
    console.log(this.address);

    this.getEditValues();

    this.menuRightsListfetched = this.loginservice.GetMenuRights();
    this.menuRights = JSON.parse(this.menuRightsListfetched);
    this.userRights = this.menuRights.filter((e:any)=>e.displayName == 'User Profile');
     console.log(this.userRights);
  }

  formsetup() {
    const _builder = new FormBuilder();
    this.profileForm = _builder.group({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3)
      ]),
      userPhone: new FormControl('', [
        Validators.required, 
      ]),
      userAddress: new FormControl('', [
        Validators.required,
        Validators.minLength(3)
      ]),
    });

  }

  getEditValues(){
    this.profileForm.setValue({
      name : this.username,
      userPhone : this.phone,
      userAddress : this.address
    })
  }

  updateProfile() {
    
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched(); // Highlight invalid fields
      return;
    }

    const formValues = this.profileForm.value;
    //console.log(formValues)
    if (this.isEdit) {
      const userToUpdate = {
        ...formValues,
        userId: this.userId,
        // password: this.userDetails["password"],
        // roleName : this.userDetails["roleName"],
        // userEmail: this.userDetails["userEmail"],
        // userRoleId: this.userDetails["userRoleId"],
        // userStatus: this.userDetails["userStatus"],
      };
  
      this.registerservice.updateUserProfile(userToUpdate).subscribe(
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
    }
  }
}
