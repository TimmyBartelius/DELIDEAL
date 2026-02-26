import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/environment';

export interface UserProfile {
  id: string;
  userName: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly API_BASE = `${environment.apis.default.url}/api`;
  private readonly ACCOUNT_URL = `${this.API_BASE}/account`;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getAccessToken();
    if (!token) throw new Error('No access token found');

    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.ACCOUNT_URL}/my-profile`, {
      headers: this.getAuthHeaders(),
    });
  }

  getProfilePicture() {
    return this.http.get<{ base64: string }>(`${this.ACCOUNT_URL}/profile-picture`, {
      headers: this.getAuthHeaders(),
    });
  }

  /** Skicka ren Base64-sträng */
  saveProfilePicture(base64: string): Observable<any> {
    const payload = { base64 };
    return this.http.put(`${this.ACCOUNT_URL}/profile-picture`, payload, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.auth.getAccessToken()}`,
        'Content-Type': 'application/json',
      }),
    });
  }

  register(data: { userName: string; email: string; password: string }): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${this.ACCOUNT_URL}/register`, {
      userName: data.userName,
      emailAddress: data.email,
      password: data.password,
      appName: environment.application.name,
    });
  }
}
