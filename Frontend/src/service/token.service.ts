import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  next!: ActivatedRouteSnapshot;

  constructor(private router: Router) { }
  clear(): void {
    localStorage.clear();
  }
  isAuthenticated(): boolean {
    console.log('gettoken',localStorage.getItem('SetToken'))
    return localStorage.getItem('SetToken') != null;
  }
  isAuthorized(): boolean {
    return true;
  }

  getOrgInfo(){
    console.log('org',localStorage.getItem('org'))
    return localStorage.getItem('org') 
  }
  logout(): void {
    this.clear();
    this.router.navigate(['/login']);
    location.reload();
  }


  getTokenExpirationDate(token: string): any {
    const decoded: any = token;

    if (decoded.exp === undefined) { return null; }

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  }
}
