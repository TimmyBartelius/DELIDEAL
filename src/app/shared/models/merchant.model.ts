import { Product } from './product.model';

export interface Merchant {
  id: number;
  name: string;
  city: string;
  address: string;

  latitude: number;
  longitude: number;

  products: Product[];
}
