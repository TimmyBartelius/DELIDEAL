import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/environment';
import {
  CreateOfferDto,
  MerchantApi,
  OfferApi,
  ProductApi,
} from '../shared/models/merchant-api.model';

@Injectable({ providedIn: 'root' })
export class MerchantPortalService {
  private readonly base = `${environment.apis.default.url}/api/merchant`;

  constructor(private http: HttpClient) {}

  // ── Butik ────────────────────────────────────────────────────────
  getMyStore(): Observable<MerchantApi> {
    return this.http.get<MerchantApi>(`${this.base}/my-store`);
  }

  // Firestore field paths är PascalCase – skicka nycklar i PascalCase
  updateMyStore(fields: Record<string, unknown>): Observable<void> {
    return this.http.put<void>(`${this.base}/my-store`, fields);
  }

  // ── Produkter ────────────────────────────────────────────────────
  getProducts(merchantId: string): Observable<ProductApi[]> {
    return this.http.get<ProductApi[]>(`${this.base}/${merchantId}/products`);
  }

  createProduct(merchantId: string, product: Record<string, unknown>): Observable<ProductApi> {
    return this.http.post<ProductApi>(`${this.base}/${merchantId}/products`, product);
  }

  updateProduct(
    merchantId: string,
    productId: string,
    fields: Record<string, unknown>,
  ): Observable<void> {
    return this.http.put<void>(`${this.base}/${merchantId}/products/${productId}`, fields);
  }

  deleteProduct(merchantId: string, productId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${merchantId}/products/${productId}`);
  }

  // ── Erbjudanden ──────────────────────────────────────────────────
  getOffers(merchantId: string): Observable<OfferApi[]> {
    return this.http.get<OfferApi[]>(`${this.base}/${merchantId}/offers`);
  }

  createOffer(merchantId: string, dto: CreateOfferDto): Observable<OfferApi> {
    return this.http.post<OfferApi>(`${this.base}/${merchantId}/offers`, dto);
  }

  deleteOffer(merchantId: string, offerId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${merchantId}/offers/${offerId}`);
  }
}
