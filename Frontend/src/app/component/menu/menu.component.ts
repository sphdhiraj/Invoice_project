import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { LoginService } from 'src/service/login.service';

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
  constructor(private loginservice:LoginService) { }

  ngOnInit(): void {
    this.menuRightsListfetched = this.loginservice.GetMenuRights();
    this.menuRights = JSON.parse(this.menuRightsListfetched);
    console.log(this.menuRights)
    this.menuArray();

  }

  naviagte(item: any, index: number) {
    if (item.items.lenght > 0) {
      item.item.
        console.log(item)
    } else {
    }
  }
  menuArray() {
    this.model = [
      {
        items: [
          {
            label: 'Admin', showmenu: true, icon: 'fa-solid fa-user-tie', routerLink: [""],
            items: [
              {
                label: 'Module', icon: '',  visible:true, routerLink: ["/modules"]
              },
              {
                label: 'Org Access', icon: '',  visible:true, routerLink: ["/org-access-rights"]
              },
              {
                label: 'Organization', icon: '',  visible:true, routerLink: ["/organizations"]
              },
              {
                label: 'User Role ', icon: '',  visible:true, routerLink: ["/user-roles"]
              },
              {
                label: 'User Access ', icon: '',  visible:true, routerLink: ["/user-access-rights"]
              },

            ]
          },
          {
            label: 'Organization', showmenu:true, icon: 'fa-solid fa-building-columns', routerLink: [""],
            items: [
              {
                label: 'Invoice', icon: '',  visible:true, routerLink: ["/inbox"]
              },
            ]
          },
          
          {
            label: 'User', showmenu: true, icon: 'fa-solid fa-users', routerLink: [""],
            items: [
              {
                label: 'User Profile', icon: '',  visible:true, routerLink: ["/user"]
              },
             
              {
                label: 'Update Password', icon: '',  visible:true, routerLink: ["/updatepassword"]
              },

              {
                label: 'Logout', icon: '',  visible:true, routerLink: ["/logout"]
              },
            ]
          },

        
        ]
      },
    ];
  }


  ValidateParentModule(moduleName:string){
    const isParentmenuPresent = this.menuRights?.some((e:any) => e.ParentMenuName === moduleName);
    return isParentmenuPresent;
}

ValidateSubModule(submoduleName:string,moduleName:string){
    const isSubmenuPresent = this.menuRights?.some((e:any) => e.ParentMenuName === moduleName && e.MenuName === submoduleName);
    return isSubmenuPresent;
}


}