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
}
