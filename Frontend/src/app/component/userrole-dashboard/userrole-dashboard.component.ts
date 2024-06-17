import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Organization, UserRole } from 'src/service/Model/model';
import { LoginService } from 'src/service/login.service';
import { UserroleService } from 'src/service/userrole.service';

@Component({
  selector: 'app-userrole-dashboard',
  templateUrl: './userrole-dashboard.component.html',
  styleUrls: ['./userrole-dashboard.component.scss']
})
export class UserroleDashboardComponent implements OnInit {

  organizations: Organization[] = [];
  userRoles: UserRole[] = [];
  selectedOrgId: string | null = null;
  isEdit = false;
  menuRights:any = [];
    menuRightsListfetched:any;
    userRights: any;

  constructor(private userroleservice: UserroleService,private router:Router,private loginservice: LoginService) { }

  ngOnInit(): void {
    this.org_Details();

    this.menuRightsListfetched = this.loginservice.GetMenuRights();
        this.menuRights = JSON.parse(this.menuRightsListfetched);
        this.userRights = this.menuRights.filter((e:any)=>e.displayName == 'Invoice');
        console.log(this.userRights);
  }

  org_Details() {
    this.userroleservice.getOrganizations().subscribe(data => {
      this.organizations = data;
    });
  }

  loadUserRolesForOrganization(orgId: string): void {
    this.userroleservice.getUserRoleByOrganization(orgId).subscribe(response => {
      this.userRoles = response.userRoles;
    });
  }

  searchUserRoles(orgId: string) {
    if (orgId) {
      this.selectedOrgId = orgId;
      this.loadUserRolesForOrganization(this.selectedOrgId);
    }
  }

  addUserRole() {
    this.router.navigate(['/add-user-roles']);
    this.isEdit = false;
  }

  editUserRole(roleId: string): void {
    this.isEdit = true;
    this.router.navigate(['/add-user-roles'], { queryParams: { roleId: roleId, Edit: 'Edit' } });
  }

  deleteUserRole(roleId: string): void {
    if (!roleId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error("Invalid ObjectID format");
      return;
    }
  
    if (confirm('Are you sure you want to delete this User Role?')) {
      this.userroleservice.deleteUserRole(roleId).subscribe(() => {
        if (this.selectedOrgId) {
          this.loadUserRolesForOrganization(this.selectedOrgId);
        }
      });
    }
  }
}
