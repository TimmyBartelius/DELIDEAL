import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // HTTPS-adress till backend
  private readonly API_BASE = `${environment.apis.default.url}/api`;
  private readonly ACCOUNT_URL = `${this.API_BASE}/account`;
  private readonly TOKEN_KEY = 'access_token';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('username', username);
    body.set('password', password);
    body.set('client_id', environment.oAuthConfig.clientId);
    body.set('scope', environment.oAuthConfig.scope);

    return this.http
      .post<any>(`${environment.oAuthConfig.issuer}/connect/token`, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .pipe(tap((res) => localStorage.setItem(this.TOKEN_KEY, res.access_token)));
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.ACCOUNT_URL}/register`, {
      userName: data.userName,
      emailAddress: data.emailAddress,
      password: data.password,
      appName: environment.application.name,
    });
  }

  getMyProfile(): Observable<any> {
    const token = this.getAccessToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get(`${this.ACCOUNT_URL}/my-profile`, { headers });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    const token = this.getAccessToken();
    return this.http.post(
      `${this.ACCOUNT_URL}/my-profile/change-password`,
      {
        currentPassword,
        newPassword,
      },
      {
        headers: token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined,
      },
    );
  }
}
