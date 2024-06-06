import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Module, Organization, UserRole } from './Model/model';

@Injectable({
  providedIn: 'root'
})
export class UserAccessRightsService {
  
  private apiUrl = 'http://localhost:9090/access-rights';
  private moduleApiUrl = 'http://localhost:9090/modules';
  private orgApiUrl = 'http://localhost:9090/organizations';
  private roleApiUrl = 'http://localhost:9090/user-roles';

  constructor(private http: HttpClient) { }

  postUserAccessRightsDetails(formValues: any) {
    return this.http.post(this.apiUrl, formValues);
  }

  getOrganizations(): Observable<Organization[]> {
    return this.http.get<{ message: Organization[] }>(this.orgApiUrl).pipe(
      map(response => response.message)
    );
  }

  getModules(): Observable<Module[]> {
    return this.http.get<{ message: Module[] }>(this.moduleApiUrl).pipe(
      map(response => response.message)
    );
  }

  getUserRoles(): Observable<UserRole[]> {
    return this.http.get<{ message: UserRole[] }>(this.roleApiUrl).pipe(
      map(response => response.message)
    );
  }

  getUserRolesByOrg(orgId: string): Observable<UserRole[]> {
    //return this.http.get<UserRole[]>(`/api/user-roles`, { params: { orgId: orgId } });
    // Provide orgId as a query parameter
    const params = new HttpParams().set('orgId', orgId);
    return this.http.get<UserRole[]>('/api/user-roles', { params });
  }
}
