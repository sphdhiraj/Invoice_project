// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-organization-dashboard',
//   templateUrl: './organization-dashboard.component.html',
//   styleUrls: ['./organization-dashboard.component.scss']
// })
// export class OrganizationDashboardComponent implements OnInit {

//   constructor() { }

//   ngOnInit(): void {
//   }

// }

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OrganizationsService } from 'src/service/organizations.service';
import { Router } from '@angular/router';
import { ViewChild, ElementRef } from '@angular/core';
import { LoginService } from 'src/service/login.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-organization-dashboard',
  templateUrl: './organization-dashboard.component.html',
  styleUrls: ['./organization-dashboard.component.scss']
})
export class OrganizationDashboardComponent implements OnInit {
  @ViewChild('dropdownButton') dropdownButton!: ElementRef;
  @ViewChild('popoverContent') popoverContent!: ElementRef;

  organizations: any[] = [];
  organizationForm: FormGroup;
  showModal = false;
  isEdit = false;
  currentOrgId: string | null = null;
  menuRights:any = [];
  menuRightsListfetched:any;
  userRights: any;
  orgId: string | null = null;

  constructor(private fb: FormBuilder, private organizationService: OrganizationsService, private router: Router,
    private loginservice:LoginService,private messageservice:MessageService,
  ) {
    this.organizationForm = this.fb.group({
      orgCode: [''],
      orgName: [''],
      contactPerson: [''],
      contactPersonEmail: [''],
      contactPersonPhone: [''],
      orgStatus: [''],
      invoiceEmail: [''],
      smtpUsername: [''],
      smtpURL: [''],
      smtpPort: [''],
      // Add additional form controls as necessary
    });
  }

  ngOnInit() {
    this.loadOrganizations();

    this.menuRightsListfetched = this.loginservice.GetMenuRights();
    this.menuRights = JSON.parse(this.menuRightsListfetched);
    this.userRights = this.menuRights.filter((e:any)=>e.displayName == 'Invoice');
     console.log(this.userRights);
  }

  loadOrganizations() {
    // this.organizationService.getOrganizations().subscribe((data: any[]) => {
    //   this.organizations = data;
    // });
    
    this.organizationService.getOrganizations().subscribe(
      (data: any[]) => {
        this.organizations = data;
        console.log(this.organizations);
      },
      error => {
        console.error('Error fetching organizations:', error);
        this.organizations = [];
      }
    );
  }

  addOrganization() {
    this.router.navigate(['/add-organization']);
    this.isEdit = false;
    this.organizationForm.reset();
    this.showModal = true;
  }

  editOrganization(orgId: string) {
    this.isEdit = true;
    console.log('Navigating to edit with OrgID:', orgId);
    this.router.navigate(['/add-organization'], { queryParams: { OrgID: orgId, Edit: 'Edit' } });
    // this.currentOrgId = org._id;
    // this.organizationForm.patchValue(org);
    // this.showModal = true;
  }

  deleteOrganization(orgId: string) {
    if (!orgId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error("Invalid ObjectID format");
      return;
    }
  
    if (confirm('Are you sure you want to delete this organization?')) {
      this.organizationService.deleteOrganization(orgId).subscribe(() => {
        this.loadOrganizations();
      });
    }
  }

  closeModal() {
    this.showModal = false;
  }

  // onSubmit() {
  //   // if (this.isEdit && this.currentOrgId) {
  //   //   this.organizationService.updateOrganization(this.currentOrgId, this.organizationForm.value).subscribe(() => {
  //   //     this.loadOrganizations();
  //   //     this.showModal = false;
  //   //   });
  //   // } else {
  //   //   this.organizationService.addOrganization(this.organizationForm.value).subscribe(() => {
  //   //     this.loadOrganizations();
  //   //     this.showModal = false;
  //   //   });
  //   // }

  //   const formValues = this.organizationForm.value;
  //   //console.log(formValues)
  //   if (this.isEdit) {
  //     const orgToUpdate = {
  //       ...formValues,
  //       orgId: this.orgId
  //     };
  
  //     this.organizationService.updateOrganization(orgToUpdate).subscribe(
  //       response => {
  //         console.log('Organization updated successfully!', response);
  //         this.messageservice.add({severity:'success', summary: 'Success', detail:'organization updated successfully'});
  //         this.router.navigate(['/users']); // Redirect to user list or appropriate page
  //       },
  //       error => {
  //         console.error('Error updating organization:', error);
  //         this.messageservice.add({severity:'error', summary: 'Error', detail:'Error updating organization'});
  //       }
  //     );
  //   } else {
  //     this.organizationService.addOrganization(formValues).subscribe(
  //       response => {
  //         console.log('organization created successfully!', response);
  //         this.messageservice.add({severity:'success', summary: 'Success', detail:'organization created successfully'});
  //         this.router.navigate(['/users']); // Redirect to user list or appropriate page
  //       },
  //       error => {
  //         console.error('Error creating user:', error);
  //         this.messageservice.add({severity:'error', summary: 'Error', detail:'Error creating organization'});
  //       }
  //     );
  //   }
  // }
}
