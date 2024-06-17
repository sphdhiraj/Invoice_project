import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { UserRole } from './Model/model';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private apiUrl = 'http://localhost:9090/organization-users';

  private orgApiUrl = 'http://localhost:9090/organizations';

  private roleApiUrl = 'http://localhost:9090/user-roles';

  private userOrgUrl = 'http://localhost:9090/Getuser-byOrganizationid';

  private deleteUserUrl = 'http://localhost:9090/organization-users';

  private updateUrl = 'http://localhost:9090/users';

  private  updatePassUrl = 'http://localhost:9090/update-password';
  
  private updateProfileUrl = 'http://localhost:9090/update-userprofile';

  constructor(private http: HttpClient) { }

  postUserDetails(formValues: any) {
    return this.http.post(this.apiUrl, formValues);
  }

  getOrganizations(): Observable<any[]> {
    return this.http.get<any>(this.orgApiUrl).pipe(
      map(response => response.message)
    );
  }

  getUserRoles(): Observable<UserRole[]> {
    return this.http.get<{ message: UserRole[] }>(this.roleApiUrl).pipe(
      map(response => response.message)
    );
  }

  getUsersByOrganization(orgId:string): Observable<any> {
    return this.http.get(`${this.userOrgUrl}/${orgId}`);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.deleteUserUrl}/${id}`);
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.updateUrl}/${id}`);
  }

  updateUser(user: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}`, user);
  }

  updatePassword(formValues: any) {
    return this.http.post(this.updatePassUrl, formValues);
  }

  updateUserProfile(user: any): Observable<any> {
    return this.http.put<any>(`${this.updateProfileUrl}`, user);
  }
}
