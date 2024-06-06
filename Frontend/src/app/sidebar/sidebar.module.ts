import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SidebarRoutingModule } from './sidebar-routing.module';
import { SidebarComponent } from './sidebar.component';
import { MenuModule } from '../component/menu/menu.module';
import { MenuitemComponent } from '../component/menuitem/menuitem.component';
import { MenuComponent } from '../component/menu/menu.component';


@NgModule({
  declarations: [
  
  ],
  imports: [
    CommonModule,
    SidebarRoutingModule,
  ]
})
export class SidebarModule { }
