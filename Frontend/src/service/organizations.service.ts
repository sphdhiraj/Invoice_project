import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrganizationsService {

  private apiUrl = 'http://localhost:9090/organizations'; 
  constructor(private http: HttpClient) {}

  getOrgDetails(organizationDetails: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, organizationDetails);
  }
}
