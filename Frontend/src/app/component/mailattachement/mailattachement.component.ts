import { Component, OnInit, SecurityContext } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { Product, SelectedProduct } from 'src/service/Model/model';
// import { AlertifyService } from 'src/service/alertify.service';
import { ApiService } from 'src/service/api.service';
import { LoginService } from 'src/service/login.service';

@Component({
  selector: 'app-mailattachement',
  templateUrl: './mailattachement.component.html',
  providers: [MessageService],
  styles: [`
  :host ::ng-deep .p-cell-editing {
      padding-top: 0 !important;
      padding-bottom: 0 !important;
  }
`]
})
export class MailattachementComponent implements OnInit {
  id:any
  urls='http://localhost:8585'
  formData!:FormGroup;
  userRights: any;
  constructor(private apiservice :ApiService, private sanitizer: DomSanitizer,
     private messageService: MessageService, private loginservice:LoginService
  ) {
   
   }
  selectedOption: any;
  jsonData: any[]=[]; // Your JSON data
  selectedRows: any[] = []; 

  emailsfile: string[] = [];
  safeUrls: SafeResourceUrl[] = [];
  displayUrls: string[] = [];
  userData:any;

  menuRights:any = [];
  menuRightsListfetched:any;

  // Output the constructed URL
  ngOnInit(): void {
    this.formsetup()
    this.userData = localStorage.getItem('org')
    let data = JSON.parse(this.userData);
    let orgId = data.orgId;
    this.getEmails(orgId);
    console.log(orgId)
    this.id = orgId

    this.menuRightsListfetched = this.loginservice.GetMenuRights();
    this.menuRights = JSON.parse(this.menuRightsListfetched);
     this.userRights = this.menuRights.filter((e:any)=>e.displayName == 'Invoice');
     console.log(this.userRights);
  }
 
  formsetup(){
    const _builder = new FormBuilder();
    this.formData = _builder.group({
      optionselected:new FormControl(''),
    })
  }

result:any
imageurls:any
submit(){
  if (this.formData.get('optionselected')?.value) {
    this.apiservice.sendFile(this.formData.get('optionselected')?.value, this.id).subscribe(
  (response:any) => {
    this.jsonData = response[0];
    console.log('json',response)
    const dataWithoutId = this.jsonData.map((ele: any) => {
      const { id, ...rest } = ele;
      return rest; 
    });
    this.postData(dataWithoutId)
    this.imageurls = this.sanitizer.bypassSecurityTrustResourceUrl(this.urls + response[1][0]);
    console.log(this.imageurls);

    this.messageService.add({severity:'success', summary: 'Success', detail:'Submitted Succesfully'});
  },
  (error:any) => {
    console.error(error);
  }
);
}
}

  downloadJson() {
    const jsonDataWithoutId = JSON.parse(JSON.stringify(this.jsonData));

    // Remove id field from each object
    jsonDataWithoutId.forEach((obj:any) => delete obj.id)
    const jsonData = JSON.stringify(jsonDataWithoutId, null, 2);
   
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }


  postData(jsondata:any) {
    this.apiservice.postJson(jsondata).subscribe((response:any) => {
      console.log('Response from server:', response);
    }, (error:any) => {
      console.error('Error while posting data:', error);
    });
  }
  emails :any;
  getEmails(id:any): void {
      this.apiservice.getEmails(id)
      .subscribe(response => {
        this.emails = response.emails;
        console.log('this.emails',response.emails)
      });
  }

// Function to handle row deselection
clonedProducts:any = [];
productData:any=[]
onRowEditInit(product: any) {
  this.clonedProducts[product.id] = {...product};
}

onRowEditSave(product: any) {
  console.log(product)
  if (product) {
      this.clonedProducts[product.id];
     
      this.productData.push(product)
      console.log(this.productData)
      this.messageService.add({severity:'success', summary: 'Success', detail:'Row is Updated'});
  }
  else {
      this.messageService.add({severity:'error', summary: 'Error', detail:'Invalid Price'});
  }
}

onRowEditCancel(product: any, index: number) {
  this.clonedProducts[product.id] = this.clonedProducts[product.id];
  delete this.clonedProducts[product.id];
  this.messageService.add({severity:'error', summary: 'Error', detail:'Row Not Updated'});
}


convertArrayOfObjectsToCSV(array:any) {
  let result = '';
  const headers = ['type', 'text', 'Source'];
  result += headers.join(',') + '\n';

  array.forEach((item:any) => {
      const { type, text, Source} = item;
      result += `${type},${text},${Source}"\n`;
  });

  return result;
}

downloadCSV(data:any) {
  const csv = this.convertArrayOfObjectsToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (this.formData.get('optionselected')?.value).replace(/\.(pdf|jpg|jpeg|tiff|png)$/i, '');
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}


downlodcsv(){
 if(this.selectedAll.length > 0 || this.productData.length > 0){
  console.log(this.selectedValue)
  if(this.selectedValue == true  ){
    this.downloadCSV(this.selectedAll);
  }else{
    this.downloadCSV(this.productData);
    
  }
 
  if (this.formData.get('optionselected')?.value) {
    console.log(this.formData.get('optionselected')?.value)
    this.apiservice.sendForRemoveFile(this.formData.get('optionselected')?.value,this.id).subscribe(
  (response:any) => {
    window.location.reload()
  },
  (error:any) => {
    console.error(error);
  }
);
}
 }else{
  this.messageService.add({severity:'error', summary: 'Error', detail:'Select the value checkbox or select row '});
 }
}

// Base URL of your server where documents are served

selectedProducts: any = [];
selectAll: boolean = false;
selectedAll:any= []
selectedValue:boolean=false;
  OnSelectedChildren(): void {
    console.log('this.selectedProducts', this.selectedProducts);
    this.selectedValue =true
   if(this.selectedProducts.length > 0){
    this.selectedProducts.forEach((ele:any)=>{
      this.selectedAll=[]
       ele.forEach((item:any)=>{
        let obj={
          type:item.type,
          text:item.text,
          Source:item.Source
        }
        this.selectedAll.push(obj)
       })
    })
   }else{
    this.selectedAll=[]
   }
    console.log(this.selectedAll)
}

}
