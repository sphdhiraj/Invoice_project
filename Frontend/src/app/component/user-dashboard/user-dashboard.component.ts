import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/service/login.service';
import { RegisterService } from 'src/service/register.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {

  organizations: any[] = [];
    users: any[] = [];
    selectedOrgId: string | null = null; 
    isEdit = false;
    menuRights:any = [];
    menuRightsListfetched:any;
    userRights: any;
    userRoles: any[] = [];

    constructor(private userService: RegisterService,private loginservice:LoginService,private router: Router) { }

    ngOnInit(): void {
        // Fetch organizations for the dropdown
        this.userService.getOrganizations().subscribe(organizations => {
            this.organizations = organizations;
        });

        this.menuRightsListfetched = this.loginservice.GetMenuRights();
        this.menuRights = JSON.parse(this.menuRightsListfetched);
        this.userRights = this.menuRights.filter((e:any)=>e.displayName == 'Invoice');
        console.log(this.userRights);

        // Fetch user roles for mapping userRoleId to userRoleName
      this.userService.getUserRoles().subscribe(userRoles => {
      this.userRoles = userRoles;
      });
    }

  //   onOrganizationChange(event: Event): void {
  //     // this.selectedOrgId = orgId;
  //     // this.loadUsersForOrganization(orgId);
  //     const target = event.target as HTMLSelectElement;
  //     const orgId = target.value;
  //     this.selectedOrgId = orgId;
  //     this.loadUsersForOrganization(orgId);
  // }

  loadUsersForOrganization(orgId: string): void {
      this.userService.getUsersByOrganization(orgId).subscribe(users => {
          this.users = users;
      });
  }

  searchUsers(orgId: string): void {
    // if (selectedOrgId) {
    //   this.selectedOrgId = selectedOrgId;
    //   this.loadUsersForOrganization(this.selectedOrgId);
    // }
    if (orgId) {
      this.selectedOrgId = orgId;
      this.loadUsersForOrganization(this.selectedOrgId);
    }
  }

  getUserRoleName(userRoleId: string): string {
    const role = this.userRoles.find(role => role.roleId === userRoleId);
    return role ? role.roleName : 'Unknown Role';
  }

    addUser() {
      this.router.navigate(['/register-user']);
      this.isEdit = false;
    }

    editUser(userId: string): void {
      this.isEdit = true;
      this.router.navigate(['/register-user'], { queryParams: { userId: userId, Edit: 'Edit' } });
    }

    deleteUser(userId: string): void {
      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        console.error("Invalid ObjectID format");
        return;
      }
    
      if (confirm('Are you sure you want to delete this organization?')) {
        this.userService.deleteUser(userId).subscribe(() => {
          if (this.selectedOrgId) {
            this.loadUsersForOrganization(this.selectedOrgId);
          }
        });
      }
    }

}
