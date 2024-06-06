import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Module, Organization, UserRole } from 'src/service/Model/model';
import { UserAccessRightsService } from 'src/service/user-access-rights.service';

@Component({
  selector: 'app-user-access-rights',
  templateUrl: './user-access-rights.component.html',
  styleUrls: ['./user-access-rights.component.scss']
})
export class UserAccessRightsComponent implements OnInit {

  userAccessForm!: FormGroup;
  permissionsForm!: FormGroup;
  organizations: Organization[] = [];
  modules: Module[] = [];
  userRoles: UserRole[] = [];
  filteredUserRoles: UserRole[] = [];
  selectedOrgId: string = ''; // Variable to hold the selected organization ID
  showTable = false;

  constructor(
    private userAcessRightService: UserAccessRightsService,
    private messageService: MessageService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.formsetup();
    this.org_Details();
    this.module_Details();
    this.userRole_Details();
  }

  formsetup() {
    this.userAccessForm = this.fb.group({
      selectedRoleId: new FormControl('', Validators.required),
      selectedOrgId: new FormControl('', Validators.required), // Remove this line
    });

    this.permissionsForm = this.fb.group({});
  }

  org_Details() {
    // Fetch organizations from the service
    this.userAcessRightService.getOrganizations().subscribe(data => {
      this.organizations = data;
    });
  }

  module_Details() {
    // Fetch modules from the service
    this.userAcessRightService.getModules().subscribe(data => {
      this.modules = data;
      this.setupPermissionsForm();
    });
  }

  userRole_Details() {
    // Fetch user roles from the service
    this.userAcessRightService.getUserRoles().subscribe(data => {
      this.userRoles = data;
    });
  }

  setupPermissionsForm() {
    this.modules.forEach(module => {
      this.permissionsForm.addControl('viewAccess_' + module.moduleId, new FormControl(false));
      this.permissionsForm.addControl('addAccess_' + module.moduleId, new FormControl(false));
      this.permissionsForm.addControl('editAccess_' + module.moduleId, new FormControl(false));
      this.permissionsForm.addControl('deleteAccess_' + module.moduleId, new FormControl(false));
      this.permissionsForm.addControl('printAccess_' + module.moduleId, new FormControl(false));
      this.permissionsForm.addControl('approveAccess_' + module.moduleId, new FormControl(false));
      this.permissionsForm.addControl('cancelAccess_' + module.moduleId, new FormControl(false));
    });
  }

  onOrganizationChange(event: any) {
    this.selectedOrgId = event.value; // Update the selected organization ID
    this.filteredUserRoles = this.userRoles.filter(role => role.OrgID === this.selectedOrgId);
    this.userAccessForm.get('selectedRoleId')?.setValue('');
  }

  searchAccessRights() {
    if (this.userAccessForm.invalid) {
      this.userAccessForm.markAllAsTouched(); // Highlight invalid fields
      return;
    }

    // Trigger table display
    this.showTable = true;
  }

  toggleAllAccess(moduleId: string, event: any) {
    const value = event.target.checked; // Extract the checked value from the event
    this.permissionsForm.get('viewAccess_' + moduleId)?.setValue(value);
    this.permissionsForm.get('addAccess_' + moduleId)?.setValue(value);
    this.permissionsForm.get('editAccess_' + moduleId)?.setValue(value);
    this.permissionsForm.get('deleteAccess_' + moduleId)?.setValue(value);
    this.permissionsForm.get('printAccess_' + moduleId)?.setValue(value);
    this.permissionsForm.get('approveAccess_' + moduleId)?.setValue(value);
    this.permissionsForm.get('cancelAccess_' + moduleId)?.setValue(value);
  }

  submitPermissions() {
    const selectedRoleId = this.userAccessForm.get('selectedRoleId')?.value;

    const permissions = this.modules.map(module => ({
      roleId: selectedRoleId,
      orgId: this.selectedOrgId, // Use the selected organization ID
      moduleId: module.moduleId,
      viewAccess: this.permissionsForm.get('viewAccess_' + module.moduleId)?.value,
      addAccess: this.permissionsForm.get('addAccess_' + module.moduleId)?.value,
      editAccess: this.permissionsForm.get('editAccess_' + module.moduleId)?.value,
      deleteAccess: this.permissionsForm.get('deleteAccess_' + module.moduleId)?.value,
      printAccess: this.permissionsForm.get('printAccess_' + module.moduleId)?.value,
      approveAccess: this.permissionsForm.get('approveAccess_' + module.moduleId)?.value,
      cancelAccess: this.permissionsForm.get('cancelAccess_' + module.moduleId)?.value
    }));

    this.userAcessRightService.postUserAccessRightsDetails(permissions)
      .subscribe((response: any) => {
        console.log('Success!', response);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Permissions updated successfully' });
      }, (error: any) => {
        console.error('Error!', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update permissions' });
      });
  }
}
