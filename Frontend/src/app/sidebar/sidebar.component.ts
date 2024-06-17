import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from 'src/service/token.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit  {
  @Input()opened:boolean=true;
  data!:any
  @ViewChild('submenu') submenu: ElementRef | undefined;
  @ViewChild('menu') menu: ElementRef | undefined;
constructor(private renderer: Renderer2,private tokenser:TokenService,private router :Router) {}
  
  ngOnInit(): void {
    console.log(this.opened)
  }
  

  toggleSubmenu(submenu: any) {
    if (this.submenu) {
   let dta=this.submenu.nativeElement.classList.toggle('show');

   console.log(dta)
    }
  }
  togglemenu(menu:any){
    if (this.menu) {
      let dta=this.menu.nativeElement.classList.toggle('show');
  }
}

logout(){
  //localStorage.clear();
  this.router.navigate(['/login']);
}
}