import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/environment';

export interface StoreProduct {
  id: string;
  name: string;
  category: string;
  imageBase64: string;
  price: number;
  unit: string;
  stockAmount: number;
  specialOffer: boolean;
  offerPrice?: number;
}

export interface StoreDto {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  logoBase64: string;
  latitude: number;
  longitude: number;
  products: StoreProduct[];
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly base = `${environment.apis.default.url}/api/products`;

  constructor(private http: HttpClient) {}

  getAllStores(): Observable<StoreDto[]> {
    return this.http.get<StoreDto[]>(`${this.base}/stores`);
  }
}
