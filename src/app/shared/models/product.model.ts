import { ProductCategory } from '../../../enums/product-category.enum';

export interface Product {
  id?: string;
  name: string;
  category: ProductCategory;
  image: string;
  price: number;
  stockLevel: 'Lite kvar' | 'Mellan kvar' | 'Mycket kvar';
  specialOffer: boolean;
}
