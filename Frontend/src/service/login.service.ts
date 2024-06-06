import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountModel, LoginDetail } from './Model/model';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  menuRights: any;
  //private apiUrl = 'http://localhost:8585/api'; 
  private apiUrl = 'http://localhost:9090/organization-users'; 
  private apiUrls = 'http://localhost:9090/login'; 
  private url = 'http://localhost:8585/api'; 
  constructor(private http: HttpClient) { }


  postUserCredentials(formValues: any) {
    // const body = { username: username, password: password };
    // return this.http.post<any>(`${this.apiUrl}/signup`, body);
    return this.http.post(this.apiUrl, formValues);
  }
  loginUser(data:LoginDetail) {
    return this.http.post(this.apiUrls,data);
  }
  
  fetch_accountDetail(detail:AccountModel){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.url}/getCredential`, detail, { headers });
  }

  GetMenuRights(){
    this.menuRights = localStorage.getItem('MenuAccess');
    //  console.log('this.menuRights Role Right Service',this.menuRights);
    return this.menuRights;
    }
  
}
