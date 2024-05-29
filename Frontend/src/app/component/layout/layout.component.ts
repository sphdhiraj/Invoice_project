import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  title = 'Project';
  sidenavstatus:boolean=true;
  constructor() { }

  ngOnInit() {
    
  }
  handleSideNavToggle() {
   this.sidenavstatus = !this.sidenavstatus;
   console.log(this.sidenavstatus)
  }

}
