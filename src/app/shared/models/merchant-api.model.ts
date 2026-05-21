export interface MerchantApi {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  logoBase64: string;
  ownerId: string;
  isActive: boolean;
  createdAt: string;
  latitude: number;
  longitude: number;
}

export interface ProductApi {
  id: string;
  merchantId: string;
  name: string;
  category: string;
  imageBase64: string;
  price: number;
  unit: string;
  stockAmount: number;
  isAvailable: boolean;
  createdAt: string;
}

export interface OfferApi {
  id: string;
  productId: string;
  merchantId: string;
  discountPercent: number;
  offerPrice: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export interface CreateOfferDto {
  productId: string;
  discountPercent: number;
  startsAt: string;
  endsAt: string;
}
