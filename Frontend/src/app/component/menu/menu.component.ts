import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AccountModel } from 'src/service/Model/model';
import { LoginService } from 'src/service/login.service';
import { TokenService } from 'src/service/token.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  menuRights:any = [];
  model: any[] = [];
  menuRightsListfetched:any;
  @Input() opened: boolean = true;
  @ViewChild('submenu') submenu: ElementRef | undefined;
  @ViewChild('menu') menu: ElementRef | undefined;
  @Input() menuModel: any[] = [];
  constructor(private loginservice:LoginService,private tokenservice:TokenService) { }

  ngOnInit(): void {
    this.menuRightsListfetched = this.loginservice.GetMenuRights();
    this.menuRights = JSON.parse(this.menuRightsListfetched);
    console.log(this.menuRights)
    const data = this.tokenservice.getOrgInfo()
    console.log(data)
    this.fetch_credential(data)
    this.menuArray();

  }

  naviagte(item: any, index: number) {
    if (item.items.lenght > 0) {
      item.item.
        console.log(item)
    } else {
    }
  }
  // menuArray() {
  //   this.model = [
  //     {
  //       items: [
  //         {
  //           label: 'Admin', showmenu: true, icon: 'fa-solid fa-user-tie', routerLink: [""],
  //           items: [
  //             {
  //               label: 'Module', icon: '',  visible:true, routerLink: ["/modules"]
  //             },
  //             {
  //               label: 'Org Access', icon: '',  visible:true, routerLink: ["/org-access-rights"]
  //             },
  //             {
  //               label: 'Organization', icon: '',  visible:true, routerLink: ["/organizations"]
  //             },
  //             {
  //               label: 'User Role ', icon: '',  visible:true, routerLink: ["/user-roles"]
  //             },
  //             {
  //               label: 'User Access ', icon: '',  visible:true, routerLink: ["/user-access-rights"]
  //             },
  //             {
  //               label: 'User Creation ', icon: '',  visible:true, routerLink: ["/register"]
  //             },

  //           ]
  //         },
  //         {
  //           label: 'Organization', showmenu:this.ValidateParentModule('Organization'), icon: 'fa-solid fa-building-columns', routerLink: [""],
  //           items: [
  //             {
  //               label: 'Invoice', icon: '',  visible:this.ValidateSubModule('Invoice','Organization'), routerLink: ["/inbox"]
  //             },
  //           ]
  //         },
          
  //         {
  //           label: 'User', showmenu: true, icon: 'fa-solid fa-users', routerLink: [""],
  //           items: [
  //             {
  //               label: 'User Profile', icon: '',  visible:true, routerLink: ["/user"]
  //             },
             
  //             {
  //               label: 'Update Password', icon: '',  visible:true, routerLink: ["/updatepassword"]
  //             },

  //             {
  //               label: 'Logout', icon: '',  visible:true, routerLink: ["/logout"]
  //             },
  //           ]
  //         },

        
  //       ]
  //     },
  //   ];
  // }

  menuArray() {
    this.model = [
      {
        items: [
          {
            label: 'Admin', showmenu: true, icon: 'fa-solid fa-user-tie', routerLink: [""],
            items: [
              {
                label: 'Module', icon: '', visible: this.hasViewAccess('Module', 'Admin Menu'), routerLink: ["/modules"]
              },
              {
                label: 'Org Access', icon: '', visible: this.hasViewAccess('Org Access', 'Admin Menu'), routerLink: ["/org-access-rights"]
              },
              {
                label: 'Organization', icon: '', visible: this.hasViewAccess('Organization', 'Admin Menu'), routerLink: ["/organizations"]
              },
              {
                label: 'User Role', icon: '', visible: this.hasViewAccess('User Role', 'Admin Menu'), routerLink: ["/user-roles"]
              },
              {
                label: 'User Access', icon: '', visible: this.hasViewAccess('User Access', 'Admin Menu'), routerLink: ["/user-access-rights"]
              },
              {
                label: 'Users', icon: '', visible: this.hasViewAccess('Organization Users', 'Admin Menu'), routerLink: ["/users"]
              }
            ]
          },
          {
            label: 'Organization', showmenu: true, icon: 'fa-solid fa-building-columns', routerLink: [""],
            items: [
              {
                label: 'Invoice', icon: '', visible: this.hasViewAccess('Invoice', 'Organization'), routerLink: ["/inbox"]
              }
            ]
          },
          {
            label: 'User', showmenu: true, icon: 'fa-solid fa-users', routerLink: [""],
            items: [
              {
                label: 'User Profile', icon: '', visible: this.hasViewAccess('User Profile', 'User'), routerLink: ["/user-profile"]
              },
              {
                label: 'Update Password', icon: '', visible: this.hasViewAccess('Update Password', 'User'), routerLink: ["/updatepassword"]
              },
              {
                label: 'Logout', icon: '', visible: true, routerLink: ["/logout"]
              }
            ]
          }
        ]
      }
    ];
  }


  ValidateParentModule(moduleName:string){
    const isParentmenuPresent = this.menuRights?.some((e:any) => e.moduleName === moduleName);
    console.log(isParentmenuPresent);
    return isParentmenuPresent;
}

ValidateSubModule(submoduleName:string,moduleName:string){
    const isSubmenuPresent = this.menuRights?.some((e:any) => e.moduleName === moduleName && e.displayName === submoduleName);
    console.log(isSubmenuPresent);
    
    return isSubmenuPresent;
}

fetch_credential(Detail:any){
  this.loginservice.fetch_accountDetail(Detail).subscribe((res:any)=>{
    // console.log(res)
  })
}

hasViewAccess(displayName: string, moduleName: string) {
  const accessRight = this.menuRights.find((e: any) => e.displayName === displayName && e.moduleName === moduleName);
  return accessRight ? accessRight.viewAccess : false;
}

}
