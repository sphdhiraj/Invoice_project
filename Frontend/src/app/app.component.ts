import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
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
