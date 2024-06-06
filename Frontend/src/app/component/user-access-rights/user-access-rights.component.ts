import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TableCheckbox } from 'primeng/table';
import { AccessRight, Module, Organization, UserRole } from 'src/service/Model/model';
import { UserAccessRightsService } from 'src/service/user-access-rights.service';


@Component({
  selector: 'app-user-access-rights',
  templateUrl: './user-access-rights.component.html',
  styleUrls: ['./user-access-rights.component.scss']
})


export class UserAccessRightsComponent implements OnInit {

@ViewChild('checkbox') checkbox!: TableCheckbox;
  selectedDetails: any[] = [];
  listFiltered: any[] = [];
  roleTypeId: number = 0;
  objTblUserRights!: AccessRight;
  userAccessForm!: FormGroup;
  organizations: Organization[] = [];
  userRoles: UserRole[] = [];
  selectedOrgId: string = '';
  selectedRoleId: string = '';
  filteredUserRoles: UserRole[] = [];
  modules: Module[] = [];
  // objTblUserRights!: MenuMasterUserRoleRightDto
  userID: any;
  // objTblUserRoleRightsArr: MenuMasterUserRoleRightDto[] = [];
  selectedProducts1: any;
  objTblUserRoleRightsArr: AccessRight[] = [];
  isRowSelectable: any;
  rights: any;
  parsedArray: any;
  userRights: any;
  constructor(
    private userAcessRightService: UserAccessRightsService,
    private messageService: MessageService,private fb: FormBuilder,
    private cdr: ChangeDetectorRef) {
    this.isRowSelectable = this.isRowSelectable?.bind(this);
   
  }
 
  ngOnInit(): void {
  
    this.org_Details();
    this.userRole_Details();
    this.module_Details();
    this.formsetup();
     this.cdr.markForCheck();

     this.userAccessForm = this.fb.group({
            selectedOrgId: [''],
            selectedRoleId: ['']
          });
 
  }
  formsetup() {
    this.userAccessForm = this.fb.group({
      selectedRoleId: new FormControl('', Validators.required),
      selectedOrgId: new FormControl('', Validators.required), 
    });
  }

  SelectedDetails(event: any, checked: boolean) {
    this.selectAllChecked =checked;
    console.log('event row is 123', checked);
    console.log('Details', this.selectedDetails);
    event.data.addAccess = checked;
    event.data.viewAccess = checked;
    event.data.deleteAccess = checked;
    event.data.editAccess = checked;
    event.data.printAccess = checked;
    event.data.cancelAccess = checked;
    // console.log('this.listFiltered', this.listFiltered);
    this.selectAll();
  }
 
 
  UnSelectedDetails(event: any, unchecked: boolean) {
    console.log('event', unchecked);
    this.selectAllChecked =unchecked;
    event.data.addAccess = unchecked;
    event.data.viewAccess = unchecked;
    event.data.deleteAccess = unchecked;
    event.data.editAccess = unchecked;
    event.data.printAccess = unchecked;
    event.data.cancelAccess = unchecked;
    this.selectAll();
   
 
  }

  onOrganizationChange(event: any) {
        this.selectedOrgId = event.value.orgId; // Update the selected organization ID
        console.log('Selected Org ID:', this.selectedOrgId);
      //this.org_Details();
        console.log('User Roles:', this.userRoles);

        this.userAcessRightService.getUserRoles().subscribe(data => {
          console.log(data);
          //this.userRoles = data;
          this.filteredUserRoles = data.filter((role: UserRole) => role.orgId === this.selectedOrgId);
            
          });
    
        console.log('User Roles:', this.filteredUserRoles);

        this.userAccessForm.get('selectedRoleId')?.setValue('');
      }
    
    onRoleChange(event: any): void {
      this.selectedRoleId = event.value;
    }

 
  searchAccessRights() {
        if (this.userAccessForm.invalid) {
          this.userAccessForm.markAllAsTouched(); // Highlight invalid fields
          return;
        }
    
        

  const selectedOrgId = this.userAccessForm.get('selectedOrgId')?.value.orgId;
  console.log(selectedOrgId);
  const selectedRoleId = this.userAccessForm.get('selectedRoleId')?.value.roleId;
  console.log(selectedRoleId);


  if (selectedOrgId && selectedRoleId) {
    this.userAcessRightService.getAccessRightsByOrgIdAndRoleId(selectedOrgId, selectedRoleId)
      .subscribe((data:any) => {
        console.log(data);
        this.listFiltered = data['accessRights']; // Assuming the response is an array of AccessRight
        console.log(this.listFiltered);
        this.listFiltered.forEach((e: AccessRight) => {
          if (e.addAccess && e.viewAccess && e.editAccess && e.deleteAccess && e.cancelAccess && e.printAccess) {
            this.selectedDetails.push(e);
          }
        });

        // Initialize permissions form with the fetched access rights
        //this.initializePermissionsForm();
      }, (error) => {
        console.error('Error fetching access rights:', error);
      });
  }
        
      }

  org_Details() {
            // Fetch organizations from the service
            this.userAcessRightService.getOrganizations().subscribe(data => {
              this.organizations = data;
            });
          }

  userRole_Details() {
        // Fetch user roles from the service
      this.userAcessRightService.getUserRoles().subscribe(data => {
      console.log(data);
      console.log(this.selectedOrgId);
      //this.userRoles = data;
        this.userRoles = data.filter((role: UserRole) => role.orgId === this.selectedOrgId);
      });
      console.log(this.userRoles);
            
  }

  module_Details() {
    //     // Fetch modules from the service
        this.userAcessRightService.getModules().subscribe(data => {
          this.modules = data;
      
          //this.setupPermissionsForm();
        });
        
      }
  

  getModuleName(moduleId: string): string {
    const module = this.modules.find(mod => mod.moduleId === moduleId);
    if (!module) {
      console.error(`Module not found for moduleId: ${moduleId}`);
      return '';
    }
    return module.moduleName;
  }
   
 
  selectAll(){
    console.log('this.listFiltered',this.listFiltered)
    const allCheckboxesChecked = this.listFiltered.every(item =>
      item.addAccess===true && item.viewAccess===true && item.deleteAccess===true && item.editAccess===true && item.printAccess===true && item.cancelAccess===true
    )
 
    // console.log(allCheckboxesChecked);
 
    this.selectAllChecked = allCheckboxesChecked;
  }
  selectAllChecked: boolean = false;
  selectAllRows(event: any,checked:boolean) {
 
    if (event.target.checked) {
      this.selectedDetails = [...this.listFiltered];
      this.selectedDetails.forEach(item => {
        item.addAccess = checked;
        item.viewAccess = checked;
        item.deleteAccess = checked;
        item.editAccess = checked;
        item.printAccess = checked;
        item.cancelAccess = checked;
        console.log('item.selected', item);
        console.log('this.listFiltered', this.listFiltered);
      });
    } else {
      this.selectedDetails.forEach(item => {
        item.addAccess = false;
        item.viewAccess = false;
        item.deleteAccess = false;
        item.editAccess = false;
        item.printAccess = false;
        item.cancelAccess = false;
      });
      this.selectedDetails = [];
    }
  
  this.selectAll();
 
  }
 
  getValue() {
    const value = this.checkbox.value; 
    console.log('Checkbox value:', value);
  }
   OnSelect(event: any) {
    console.log('eventtrigger',event);
  }
  // save right
  SaveRights() {
    console.log('this.listfileterd', this.listFiltered);
    
    this.listFiltered.forEach((element: any) => {

      
      this.objTblUserRights = new AccessRight();
 
      this.objTblUserRights.accessRightsId = element.accessRightId ;
      this.objTblUserRights.addAccess = element.addAccess;
      this.objTblUserRights.editAccess = element.editAccess;
      this.objTblUserRights.deleteAccess = element.deleteAccess;
      this.objTblUserRights.cancelAccess = element.cancelAccess;
      this.objTblUserRights.printAccess = element.printAccess;
      this.objTblUserRights.DisplayName =element.DisplayName
      this.objTblUserRights.viewAccess = element.viewAccess;
      this.objTblUserRights.orgId = element.orgId;
      this.objTblUserRights.moduleId = element.moduleId;
      this.objTblUserRights.roleId = element.roleId;

  
      // if (this.objTblUserRights.addAccess == true || this.objTblUserRights.editAccess == true || this.objTblUserRights.deleteAccess == true || this.objTblUserRights.cancelAccess == true || this.objTblUserRights.printAccess == true || this.objTblUserRights.viewAccess == true || this.objTblUserRights.approveAccess == true)
      //     this.objTblUserRoleRightsArr.push(this.objTblUserRights);
      this.objTblUserRoleRightsArr.push(this.objTblUserRights);
    })
    console.log(this.objTblUserRoleRightsArr);
    
    // return
    this.userAcessRightService.postUserAccessRightsDetails(this.objTblUserRoleRightsArr).subscribe((result: any) => {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Permissions updated successfully' });
      this.objTblUserRoleRightsArr = [];
    }
      , error => {
        console.log('error', error);
        if (error.status === 400) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update permissions' });
        }
      })
  }
 
  isCheckboxSelected:boolean=false;

  OnRemoveFromArray(rowdata: any, evt: any, index: number) {
    console.log('evt', evt, rowdata);
    
    if (evt == true) {
      
      if (rowdata.addAccess == true && rowdata.editAccess == true && rowdata.cancelAccess == true && rowdata.deleteAccess == true && rowdata.viewAccess == true) {
        this.selectedDetails.push(rowdata);
        
        this.isCheckboxSelected = true;
 
      }else{
        this.isCheckboxSelected = false;
      }
 
    }
    else {
      console.log('this.selectedDetails', this.selectedDetails);
      this.selectedDetails = this.selectedDetails.filter(e => (e.AddAccess == true && e.EditAccess == true && e.CancelAccess == true && e.PrintAccess == true && e.ApproveAccess == true && e.DeleteAccess == true && e.ViewAccess == true))
      
      this.selectAll();
 
 
    }
 
    return this.selectedDetails;
  }
 
 
 
}
