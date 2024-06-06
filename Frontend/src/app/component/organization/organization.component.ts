import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from 'src/service/login.service';
import { MessageService } from 'primeng/api';
import { Organization } from 'src/service/Model/model';
import { Router } from '@angular/router';
import { OrganizationsService } from 'src/service/organizations.service';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit {

  OrgForm!:FormGroup;
  //organizationDetails = new Organization();
  organizationDetails: Organization[] = [];
  org_Status= [
    { value: 'Active', name: 'Active' },
    { value: 'Inactive', name: 'Inactive' }
  ];

  constructor(private loginservice:LoginService,private messageservice:MessageService,private organizationService :OrganizationsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.formsetup();
  }

  formsetup() {
    const _builder = new FormBuilder();
    this.OrgForm = _builder.group({
      orgName: new FormControl('', [
        Validators.required
      ]),
      orgCode: new FormControl(''),
      // org_email: new FormControl('', [
      //   Validators.required,
      //   Validators.email
      // ]),
      contactPerson: new FormControl('', [
        Validators.required
      ]),
      contactPersonEmail: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      contactPersonPhone: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]{7,15}$') 
      ]),
      orgStatus: ['', Validators.required],

      invoiceEmail: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
  
      SMTPusername: new FormControl('', [
        Validators.required
      ]),
  
      SMTPpassword: new FormControl('', [
        Validators.required, 
      ]),
  
      SMTPurl: new FormControl('', [
        Validators.required
      ]),
  
      SMTPport: new FormControl('', [
        Validators.required
      ]),
    });
  }
  

  // org_Form() {
    
  //   this.organizationDetails.org_name = this.OrgForm.get('org_name')?.value;
  //   this.organizationDetails.org_code = this.OrgForm.get('org_code')?.value;
  //   this.organizationDetails.org_email = this.OrgForm.get('org_email')?.value;
  //   this.organizationDetails.contact_person = this.OrgForm.get('contact_person')?.value;
  //   this.organizationDetails.contact_person_email = this.OrgForm.get('contact_person_email')?.value;
  //   this.organizationDetails.contact_person_phone = this.OrgForm.get('contact_person_phone')?.value;
  //   this.organizationDetails.status = this.OrgForm.get('status')?.value;

  //   this.apiservice.getOrgDetails(this.organizationDetails).subscribe((response:any) => {
  //         console.log('Success!', response);
  //         this.messageservice.add({severity:'success', summary: 'Success', detail:'Added Successfully'});
  //       }, (error:any) => {
  //         console.error('Error!', error);
  //         this.messageservice.add({severity:'error', summary: 'Error', detail:'organization already exist'});
  //       });
  // }

  org_Form() {
    if (this.OrgForm.invalid) {
      this.OrgForm.markAllAsTouched(); // Highlight invalid fields
      return;
    }

    const formValues = this.OrgForm.value;
    console.log(formValues)
    this.organizationService.getOrgDetails(formValues).subscribe(
      (response: any) => {
        console.log('Success!', response);
        console.log(formValues)
        this.messageservice.add({ severity: 'success', summary: 'Success', detail: 'Added Successfully' });
        //this.router.navigate(['/register']); // Redirect to user registration page
      },
      (error: any) => {
        console.error('Error!', error);
        this.messageservice.add({ severity: 'error', summary: 'Error', detail: 'Organization already exists' });
      }
    );
  }
}
