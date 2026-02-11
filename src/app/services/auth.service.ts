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
    return this.http.post<any>(`${this.apiUrl}/token`, { username, password })
      .pipe(tap(res => localStorage.setItem('token', res.accessToken)));
  }

  logout() {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  register(data:any): Observable<any> {
    return this.http.post(`http://localhost:5000/api/account/register`, {
      UserName: data.userName,
      EmailAddress: data.email,
      Password: data.password
    })
  }
}
