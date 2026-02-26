import { Pipe, PipeTransform } from '@angular/core';
import { Product } from './models/product.model';

@Pipe({
  name: 'filterByName',
  standalone: true,
})
export class FilterByNamePipe implements PipeTransform {
  transform(products: Product[], searchTerm: string): Product[] {
    if (!products) return [];
    return products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }
}
