import { Product } from './product.model';

export interface Merchant {
  id: number | string;
  name: string;
  city: string;
  address: string;
  image: string;

  latitude: number;
  longitude: number;

  products: Product[];

  productsFiltered?: Product[];
}
