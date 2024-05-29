import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { ApiService } from 'src/service/api.service';
  interface toggle{
    menustatus:boolean
  }
@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit {
  @Output()sideNavToggled:EventEmitter<any> = new EventEmitter();
  constructor(private apiservice:ApiService) { 
    this.sideNavToggled =new EventEmitter()
  }

  ngOnInit(): void {
    this.getEmails()
  }
  sideNavToggle(e:Event){
    // this.menustatus =true
    this.sideNavToggled.emit(e.target);
  }

  emails :any;
  count!:number;
  getEmails(): void {
      this.apiservice.getEmails()
      .subscribe(response => {
        if(response){
          this.emails = response.emails;
          this.count = this.emails.length
          console.log('count', this.count)
        }
      });
  }
}
