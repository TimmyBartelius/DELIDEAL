import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/environment';

export interface PriceAlertDto {
  id: string;
  productId: string;
  merchantId: string;
  productName: string;
  merchantName: string;
  targetPrice: number;
  isTriggered: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class PriceAlertService {
  private readonly BASE = `${environment.apis.default.url}/api/customer/price-alerts`;

  constructor(private http: HttpClient) {}

  getAlerts(): Observable<PriceAlertDto[]> {
    return this.http.get<PriceAlertDto[]>(this.BASE);
  }

  createAlert(
    productId: string,
    merchantId: string,
    productName: string,
    merchantName: string,
    targetPrice: number,
  ): Observable<PriceAlertDto> {
    return this.http.post<PriceAlertDto>(this.BASE, {
      productId,
      merchantId,
      productName,
      merchantName,
      targetPrice,
    });
  }

  deleteAlert(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }
}
