import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Module } from 'src/service/Model/model';
import { ModulenameService } from 'src/service/modulename.service';

@Component({
  selector: 'app-module-name',
  templateUrl: './module-name.component.html',
  styleUrls: ['./module-name.component.scss']
})
export class ModuleNameComponent implements OnInit {

  ModuleForm!:FormGroup;
  modules: Module[] = [];
  constructor(private moduleService: ModulenameService,private messageservice:MessageService) { }

  ngOnInit(): void {
    this.formsetup();
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
