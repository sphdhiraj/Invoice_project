import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserroleService {

  private apiUrl = 'http://localhost:9090/user-roles';

  private orgApiUrl = 'http://localhost:9090/organizations';

  private roleByOrgUrl = 'http://localhost:9090/user-roles-by-org';

  constructor(private http: HttpClient) { }

  postUserRoleDetails(formValues: any) {
    return this.http.post(this.apiUrl, formValues);
  }

  getOrganizations(): Observable<any[]> {
    return this.http.get<any>(this.orgApiUrl).pipe(
      map(response => response.message)
    );
  }

  getUserRoleById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getUserRoleByOrganization(orgId:string): Observable<any> {
    return this.http.get(`${this.roleByOrgUrl}/${orgId}`);
  }

  updateUserRole(userRole: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}`, userRole);
  }

  deleteUserRole(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
