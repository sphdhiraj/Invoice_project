import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  //private apiUrl = 'http://localhost:8585/api'; 
  private apiUrl = 'http://localhost:9090/organization-users'; 

  constructor(private http: HttpClient) { }

  login(username: string,password:string): Observable<any> {
    const body = { username: username,password:password };
    return this.http.post<any>(`${this.apiUrl}/login`, body);
  }

  postUserCredentials(formValues: any) {
    // const body = { username: username, password: password };
    // return this.http.post<any>(`${this.apiUrl}/signup`, body);
    return this.http.post(this.apiUrl, formValues);
  }

}
