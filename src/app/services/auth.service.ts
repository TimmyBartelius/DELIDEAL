import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../enviroments/enviroment';

export interface AuthResponse {
  token: string;
  userId: string;
  userName: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_BASE = `${environment.apis.default.url}/api`;
  private readonly ACCOUNT_URL = `${this.API_BASE}/account`;
  private readonly TOKEN_KEY = 'access_token';

  constructor(private http: HttpClient) {}

  // --- LOGIN ---
  login(email: string, password: string): Observable<any> {
    return this.http.post<AuthResponse>(`${this.API_BASE}/auth/login`, { email, password }).pipe(
      tap((res) => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
      }),
    );
  }

  // --- LOGOUT ---
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // --- REGISTER ---
  register(data: { userName: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_BASE}/auth/register`, data).pipe(
      tap((res) => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
      }),
    );
  }

  // --- PROFILE ---
  getMyProfile() {
    return this.http.get(`${this.API_BASE}/account/my-profile`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.getAccessToken()}`,
      }),
    });
  }

  getProfilePicture() {
    return this.http
      .get(`${this.API_BASE}/account/profile-picture`, {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
        },
        responseType: 'blob',
      })
      .pipe(map((blob) => URL.createObjectURL(blob)));
  }

  saveProfilePicture(base64: string): Observable<any> {
    return this.http.put(`${this.ACCOUNT_URL}/profile-picture`, JSON.stringify(base64), {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.getAccessToken()}`,
        'Content-Type': 'application/json',
      }),
    });
  }
}
