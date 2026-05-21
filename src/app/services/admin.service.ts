import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/environment';
import { MerchantApi } from '../shared/models/merchant-api.model';

export interface UserProfileModel {
  id: string;
  userName: string;
  email: string;
  role: string;
  allowMarketing: boolean;
}

export interface CreateMerchantAccountDto {
  userName: string;
  email: string;
  password: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeCity: string;
  storeLatitude: number;
  storeLongitude: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly base = `${environment.apis.default.url}/api/admin`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserProfileModel[]> {
    return this.http.get<UserProfileModel[]>(`${this.base}/all-users`);
  }

  getCustomers(): Observable<UserProfileModel[]> {
    return this.http.get<UserProfileModel[]>(`${this.base}/customers`);
  }

  getMerchantUsers(): Observable<UserProfileModel[]> {
    return this.http.get<UserProfileModel[]>(`${this.base}/merchants-users`);
  }

  getMerchants(): Observable<MerchantApi[]> {
    return this.http.get<MerchantApi[]>(`${this.base}/merchants`);
  }

  createMerchantAccount(
    dto: CreateMerchantAccountDto,
  ): Observable<{ user: UserProfileModel; merchant: MerchantApi }> {
    return this.http.post<{ user: UserProfileModel; merchant: MerchantApi }>(
      `${this.base}/create-merchant-account`,
      dto,
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/users/${id}`);
  }

  updateUser(
    id: string,
    fields: { UserName?: string; Email?: string; Role?: string },
  ): Observable<void> {
    return this.http.put<void>(`${this.base}/users/${id}`, fields);
  }

  deleteMerchant(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/merchants/${id}`);
  }
}
