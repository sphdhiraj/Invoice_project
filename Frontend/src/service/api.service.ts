

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8585/api'; 
  constructor(private http: HttpClient) {}

  

  getEmails(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/emails`);
  }
 
  getFile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/folder`);
  }
  sendFile(text: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { raw_text: text };
    return this.http.post<any>(`${this.apiUrl}/filecontent`, body, { headers });
  }
  // removefile
  sendForRemoveFile(text: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { raw_text: text };
    return this.http.post<any>(`${this.apiUrl}/removefile`, body, { headers });
  }

  postJson(data:any){
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    // const body = { json: data };
    return this.http.post<any>(`${this.apiUrl}/uploadjson`, data, { headers });
  }
}
