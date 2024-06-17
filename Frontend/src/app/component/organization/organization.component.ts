import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from 'src/service/login.service';
import { MessageService } from 'primeng/api';
import { Organization } from 'src/service/Model/model';
import { ActivatedRoute, Router } from '@angular/router';
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
  menuRights:any = [];
  menuRightsListfetched:any;
  userRights: any;
  isEdit = false;
  orgId: string | null = null;

  constructor(private loginservice:LoginService,private messageservice:MessageService,private organizationService :OrganizationsService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getEditValues();
    this.formsetup();

    this.menuRightsListfetched = this.loginservice.GetMenuRights();
    this.menuRights = JSON.parse(this.menuRightsListfetched);
    this.userRights = this.menuRights.filter((e:any)=>e.displayName == 'Invoice');
     console.log(this.userRights);

     
  }

  formsetup() {
    const _builder = new FormBuilder();
    this.OrgForm = _builder.group({
      orgName: new FormControl('', [
        Validators.required
      ]),
      orgCode: new FormControl('', [
        Validators.required
      ]),
      contactPerson: new FormControl('', [
        Validators.required
      ]),
      contactPersonEmail: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      contactPersonPhone: new FormControl('', [
        Validators.required, 
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
  
  getEditValues(){
      // this.activatedRoute.queryParams.subscribe(params => {
      //   console.log('Query Params:', params);
      //   this.orgId = params['OrgID'];
      //   if (this.orgId) {
      //     this.isEdit = true;
      //     console.log('Fetching organization details for ID:', this.orgId);
      //     this.organizationService.getOrganizationById(this.orgId).subscribe(org => {
      //       console.log('Fetched organization details:', org); 
      //       this.OrgForm.patchValue(org);
      //     });
      //   }
      // });

      this.activatedRoute.queryParams.subscribe(params => {
        this.orgId = params['OrgID'];
        
        if (this.orgId) {
          this.isEdit = true;
          this.organizationService.getOrganizationById(this.orgId).subscribe(
            response => {
              const org = response.organization; // Access the nested organization object
              console.log('Received Organization:', org);
              if (org) {
                this.OrgForm.setValue({
                  orgCode: org.orgCode,
                  orgName: org.orgName,
                  contactPerson: org.contactPerson,
                  contactPersonEmail: org.contactPersonEmail,
                  contactPersonPhone: org.contactPersonPhone,
                  orgStatus: org.orgStatus,
                  invoiceEmail: org.invoiceEmail,
                  SMTPusername: org.smtpUsername,
                  SMTPpassword: org.smtpPassword,
                  SMTPurl: org.smtpURL,
                  SMTPport: org.smtpPort
                });
              } else {
                console.error('Organization data is null or undefined.');
              }
            },
            error => {
              console.error('Error fetching organization details:', error);
            }
          );
        } else {
          console.error('OrgID is missing.');
        }
      });
    }
  
 

  org_Form() {
    if (this.OrgForm.invalid) {
      this.OrgForm.markAllAsTouched(); // Highlight invalid fields
      return;
    }

    const formValues = this.OrgForm.value;
    console.log(formValues)

    // this.organizationService.getOrgDetails(formValues).subscribe(
    //   (response: any) => {
    //     console.log('Success!', response);
    //     console.log(formValues)
    //     this.messageservice.add({ severity: 'success', summary: 'Success', detail: 'Added Successfully' });
    //     //this.router.navigate(['/register']); // Redirect to user registration page
    //     this.router.navigate(['/organizations']); //Redirect to dashboard
    //   },
    //   (error: any) => {
    //     console.error('Error!', error);
    //     this.messageservice.add({ severity: 'error', summary: 'Error', detail: 'Organization already exists' });
    //   }
    // );

    if (this.isEdit) {
      const orgToUpdate = {
        ...formValues,
        orgId: this.orgId
      };
  
      this.organizationService.updateOrganization(orgToUpdate).subscribe(
        response => {
          console.log('Organization updated successfully!', response);
          this.messageservice.add({severity:'success', summary: 'Success', detail:'organization updated successfully'});
          this.router.navigate(['/organizations']); // Redirect to user list or appropriate page
        },
        error => {
          console.error('Error updating organization:', error);
          this.messageservice.add({severity:'error', summary: 'Error', detail:'Error updating organization'});
        }
      );
    } else {
      this.organizationService.addOrganization(formValues).subscribe(
        response => {
          console.log('organization created successfully!', response);
          this.messageservice.add({severity:'success', summary: 'Success', detail:'organization created successfully'});
          this.router.navigate(['/organizations']); // Redirect to user list or appropriate page
        },
        error => {
          console.error('Error creating user:', error);
          this.messageservice.add({severity:'error', summary: 'Error', detail:'Error creating organization'});
        }
      );
    }
  }
}
