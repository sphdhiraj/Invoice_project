import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Module, Organization, UserRole } from './Model/model';

@Injectable({
  providedIn: 'root'
})
export class OrgAccessRightsService {

  private apiUrl = 'http://localhost:9090/org-access-rights';
  //private moduleApiUrl = 'http://localhost:9090/modules';
  private moduleApiUrl = 'http://localhost:9090/modules-access-rights';
  private orgApiUrl = 'http://localhost:9090/organizations';
  //private userroleUrl = 'http://localhost:9090/user-roles';


  constructor(private http: HttpClient) { }

  postOrgAccessRightsDetails(formValues: any) {
    return this.http.post(this.apiUrl, formValues);
  }

  getOrganizations(): Observable<Organization[]> {
    return this.http.get<{ message: Organization[] }>(this.orgApiUrl).pipe(
      map(response => response.message)
    );
  }

  getOrganizationModules(orgId: string): Observable<Module[]> {
    const url = `${this.moduleApiUrl}/${orgId}`;
    return this.http.get<Module[]>(url);
  }

}
