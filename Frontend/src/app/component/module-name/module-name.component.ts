import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Module } from 'src/service/Model/model';
import { LoginService } from 'src/service/login.service';
import { ModulenameService } from 'src/service/modulename.service';

@Component({
  selector: 'app-module-name',
  templateUrl: './module-name.component.html',
  styleUrls: ['./module-name.component.scss']
})
export class ModuleNameComponent implements OnInit {
  menuRights:any = [];
  menuRightsListfetched:any;
  ModuleForm!:FormGroup;
  modules: Module[] = [];
  userRights:any=[]
  constructor(private moduleService: ModulenameService,private messageservice:MessageService,
    private loginservice:LoginService 
  ) { }

  ngOnInit(): void {
    this.formsetup();
    this.menuRightsListfetched = this.loginservice.GetMenuRights();
    this.menuRights = JSON.parse(this.menuRightsListfetched);
    this.userRights = this.menuRights.filter((e:any)=>e.displayName == 'Module');
     console.log(this.userRights);
  }

  formsetup() {
    const _builder = new FormBuilder();
    this.ModuleForm = _builder.group({
      moduleName: new FormControl('', [
        Validators.required,
        Validators.minLength(3)
      ]),
      
      displayName: new FormControl('', [
        Validators.required
      ]),

      component: new FormControl('', [
        Validators.required
      ]),
    });
  }

  module_Form(){
    if (this.ModuleForm.invalid) {
      this.ModuleForm.markAllAsTouched(); // Highlight invalid fields
      return;
    }

    const formValues = this.ModuleForm.value;
    //console.log(formValues);
    this.moduleService.postModuleDetails(formValues)
      .subscribe((response:any) => {
        console.log('Success!', response);
        this.messageservice.add({severity:'success', summary: 'Success', detail:'Sign Up Succesfully'});
      }, (error:any) => {
        console.error('Error!', error);
        this.messageservice.add({severity:'error', summary: 'Error', detail:'username or password already exist'});
      });
  }

}
