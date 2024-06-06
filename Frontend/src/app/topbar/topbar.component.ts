import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { ApiService } from 'src/service/api.service';
import { LoginService } from 'src/service/login.service';
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
  constructor(private apiservice:ApiService,
    private loginservice:LoginService
  ) { 
    this.sideNavToggled =new EventEmitter()
  }

  ngOnInit(): void {
    const data:any = localStorage.getItem('org')
    this.loginservice.fetch_accountDetail(data).subscribe((res:any)=>{
      console.log(res)
    })
    let user_data = JSON.parse(data);
    let orgId = user_data.orgId;
    this.getEmails(orgId);
  }
  sideNavToggle(e:Event){
    // this.menustatus =true
    this.sideNavToggled.emit(e.target);
  }

  emails :any;
  count!:number;
  getEmails(id:any): void {
    this.apiservice.getEmails(id)
    .subscribe(response => {
      this.emails = response.emails;
      console.log('this.emails',response.emails)
      this.count = this.emails.length
    });
  }
refresh(){
  const data:any = localStorage.getItem('org')
  this.loginservice.fetch_accountDetail(data).subscribe((res:any)=>{
    console.log(res)
  })
}
}
