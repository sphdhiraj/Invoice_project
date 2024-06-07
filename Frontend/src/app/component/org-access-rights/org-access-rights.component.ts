import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Module, Organization } from 'src/service/Model/model';
import { LoginService } from 'src/service/login.service';
import { OrgAccessRightsService } from 'src/service/org-access-rights.service';

@Component({
  selector: 'app-org-access-rights',
  templateUrl: './org-access-rights.component.html',
  styleUrls: ['./org-access-rights.component.scss']
})
export class OrgAccessRightsComponent implements OnInit {

orgAccessForm!: FormGroup;
  permissionsForm!: FormGroup;
  organizations: Organization[] = [];
  modules: Module[] = [];
  showTable = false;
  menuRights:any = [];
  menuRightsListfetched:any;
  userRights: any;

  constructor(private orgAccessRightService: OrgAccessRightsService, private messageService: MessageService, private fb: FormBuilder,
    private loginservice:LoginService
  ) {
    this.orgAccessForm = this.fb.group({
      selectedOrgId: new FormControl('', Validators.required),
    });

    // Initialize permissionsForm as empty FormGroup initially
    this.permissionsForm = this.fb.group({});

  
  }

  ngOnInit(): void {
    this.org_Details();

    this.menuRightsListfetched = this.loginservice.GetMenuRights();
    this.menuRights = JSON.parse(this.menuRightsListfetched);
    this.userRights = this.menuRights.filter((e:any)=>e.displayName == 'Invoice');
     console.log(this.userRights);
  }

  org_Details() {
    this.orgAccessRightService.getOrganizations().subscribe(data => {
      this.organizations = data;
      console.log(this.organizations);
    });
  }

  module_Details(orgId: string) {
    this.orgAccessRightService.getOrganizationModules(orgId).subscribe((data: any) => {
      console.log(data);
      this.modules = data.data;
      console.log(this.modules);
      
      this.setupPermissionsForm();

      // Fetch existing access rights for the organization
      this.orgAccessRightService.getOrganizationModules(orgId).subscribe((accessRightsData: any) => {
        const accessRights = accessRightsData.data;

        // Associate accessRightsId with the corresponding module
        this.modules.forEach(module => {
          const accessRight = accessRights.find((ar: any) => ar.moduleId === module.moduleId);
          if (accessRight) {
            module.accessRightsId = accessRight.accessRightsId; // Include accessRightsId
            this.permissionsForm.get('permission_' + module.moduleId)?.setValue(accessRight.permission); // Set existing permission
          } else {
            module.accessRightsId = null;
          }
        });
      });
    });
  }

  setupPermissionsForm() {
    this.permissionsForm = this.fb.group({});
    if(this.modules.length>0){
      this.modules.forEach(module => {
        this.permissionsForm.addControl('permission_' + module.moduleId, new FormControl(false));
      });
    }
    else{
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Data doesnot exist' });
    }
  }

  searchModules() {
    if (this.orgAccessForm.invalid) {
      this.orgAccessForm.markAllAsTouched();
      return;
    }

    const selectedOrgId = this.orgAccessForm.get('selectedOrgId')?.value.orgId;
    this.module_Details(selectedOrgId);
    this.showTable = true;
  }

  submitPermissions() {
    const selectedOrgId = this.orgAccessForm.get('selectedOrgId')?.value.orgId;
    const permissionsArray = this.modules.map(module => ({
      accessRightsId: module.accessRightsId, // Include accessRightsId if needed
      moduleId: module.moduleId,
      moduleName: module.moduleName,
      submoduleName: module.displayName,
      orgId: selectedOrgId,
      permission: this.permissionsForm.get('permission_' + module.moduleId)?.value
    }));

    console.log(permissionsArray);
    this.orgAccessRightService.postOrgAccessRightsDetails(permissionsArray).subscribe(
      response => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Permissions updated successfully' });
      },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update permissions' });
      }
    );
  }
}


