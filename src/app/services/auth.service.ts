import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/identity'; // ABP Identity

  constructor(private http: HttpClient) { }

login(username: string, password: string): Observable<any> {
  const body = new URLSearchParams();
  body.set('grant_type', 'password');
  body.set('username', username);
  body.set('password', password);
  body.set('client_id', 'MyApp_App');
  body.set('scope', 'MyApp openid profile email');

  return this.http.post<any>('https://localhost:5001/connect/token', body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }).pipe(
    tap(res => localStorage.setItem('token', res.access_token))
  );
}


  logout() {
    localStorage.removeItem('token');
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  register(data:any): Observable<any> {
    return this.http.post(`http://localhost:5000/api/account/register`, {
      userName: data.userName,
      emailAddress: data.email,
      password: data.password,
      appName: "MyApp_App"
    })
  }
}
