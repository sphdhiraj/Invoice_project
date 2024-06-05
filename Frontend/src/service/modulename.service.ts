import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModulenameService {

  private apiUrl = 'http://localhost:9090/modules';

  constructor(private http: HttpClient) { }

  postModuleDetails(formValues: any) {
    return this.http.post(this.apiUrl, formValues);
  }
}
