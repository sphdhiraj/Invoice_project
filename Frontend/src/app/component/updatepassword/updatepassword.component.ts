import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { LoginService } from 'src/service/login.service';
import * as bcrypt from 'bcryptjs';
import { RegisterService } from 'src/service/register.service';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-updatepassword',
  templateUrl: './updatepassword.component.html',
  styleUrls: ['./updatepassword.component.scss']
})
export class UpdatepasswordComponent implements OnInit {

  updatePasswordForm!: FormGroup;
  userDetails: any;
  password: any;
  decryptedData: string = '';
  menuRights:any = [];
  menuRightsListfetched:any;
  userRights: any;

  // The salt used by the backend to hash the password
  salt: string = '$2a$10$Mqimcv7tuyO7B4t1Vg4Fg.';

  constructor(private fb: FormBuilder, private loginservice:LoginService,
    private registerservice: RegisterService, private messageservice: MessageService,
  ) {
  
  }

  ngOnInit(): void {
    this.formsetup();
    const user = this.loginservice.loginDetails();
    console.log(user);
    this.userDetails = JSON.parse(user);
    console.log(this.userDetails);
    this.password = this.userDetails["password"];
    console.log(this.password);
    // const bytes = CryptoJS.AES.decrypt(this.password, 'invoice-project');
    // this.decryptedData = bytes.toString(CryptoJS.enc.Utf8);

    this.menuRightsListfetched = this.loginservice.GetMenuRights();
    this.menuRights = JSON.parse(this.menuRightsListfetched);
    this.userRights = this.menuRights.filter((e:any)=>e.displayName == 'Update Password');
     console.log(this.userRights);
  }

  formsetup() {
    const _builder = new FormBuilder();
    this.updatePasswordForm = _builder.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
     });
  }

  passwordsMatch(newPassword: string, confirmPassword: string): boolean {
    return newPassword === confirmPassword;
  }

  async onSubmit() {
    if (this.updatePasswordForm.invalid) {
      this.messageservice.add({severity: 'error', summary: 'Error', detail: 'Form is invalid'});
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.updatePasswordForm.value;
    //const formValues = this.updatePasswordForm.value;

    // Check if new passwords match
    if (!this.passwordsMatch(newPassword, confirmPassword)) {
      this.messageservice.add({severity: 'error', summary: 'Error', detail: 'New password and confirm password do not match'});
      return;
    }
    
    const payload = {
      userId: this.userDetails.userId, 
      currentPassword: currentPassword,
      newPassword: newPassword
      
    };
    
    this.registerservice.updatePassword(payload).subscribe(
      response => {
        console.log('Password updated successfully!', response);
        this.messageservice.add({severity:'success', summary: 'Success', detail:'Password updated successfully!'});
        //this.router.navigate(['/users']); // Redirect to user list or appropriate page
        this.updatePasswordForm.reset();
      },
      error => {
        console.error('Error posting password:', error);
        if(error == 500){
          this.messageservice.add({severity:'error', summary: 'Error', detail:'Current Password does not match!'});
        }
      });
  }
}
