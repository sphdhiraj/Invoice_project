import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Organization } from './Model/model';

@Injectable({
  providedIn: 'root'
})
export class OrganizationsService {

  private apiUrl = 'http://localhost:9090/organizations';
  private updateUrl = 'http://localhost:9090/organizationbyid' 
  constructor(private http: HttpClient) {}

  getOrgDetails(organizationDetails: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, organizationDetails);
  }

  getOrganizations(): Observable<any[]> {
    return this.http.get<{ message: any[] }>(this.apiUrl).pipe(
      map(response => response.message)
    );
  }

  addOrganization(org: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, org);
  }

  updateOrganization(org: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}`, org);
  }

  deleteOrganization(orgId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${orgId}`);
  }

  // getOrganizationById(orgId: string):Observable<Organization[]>{
  //   const url = `${this.updateUrl}/${orgId}`;
  //   return this.http.get<{ message: Organization[] }>(url).pipe(
  //     map(response => response.message)
  //   );
  // }

  getOrganizationById(id: string): Observable<any> {
    return this.http.get(`${this.updateUrl}/${id}`);
  }
}
