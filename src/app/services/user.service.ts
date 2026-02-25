import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, map } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

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

    if (!token) {
      throw new Error('No access token found');
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  /** Hämtar användarprofil */
  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.ACCOUNT_URL}/my-profile`, {
      headers: this.getAuthHeaders(),
    });
  }

  /** Hämtar profilbild */
  getProfilePicture(): Observable<string> {
    return this.http
      .get(`${this.ACCOUNT_URL}/profile-picture`, {
        headers: this.getAuthHeaders(),
        responseType: 'blob',
      })
      .pipe(map((blob) => URL.createObjectURL(blob))); // returnerar URL-string direkt
  }

  /** Spara ny profilbild (Base64) */
  saveProfilePicture(base64: string): Observable<any> {
    return this.http.put(`${this.ACCOUNT_URL}/profile-picture`, JSON.stringify(base64), {
      headers: new HttpHeaders({
        ...this.getAuthHeaders()
          .keys()
          .reduce((acc: any, key) => {
            acc[key] = this.getAuthHeaders().get(key);
            return acc;
          }, {}),
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
