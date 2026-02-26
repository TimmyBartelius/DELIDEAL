import { Pipe, PipeTransform } from '@angular/core';
import { ProductCategory } from '../../enums/product-category.enum';

@Pipe({
  name: 'filterByName',
  standalone: true,
})
export class FilterByNamePipe implements PipeTransform {
  transform(
    products: { name: string; category: ProductCategory }[],
    searchTerm: string,
  ): { name: string; category: ProductCategory }[] {
    if (!searchTerm) return products;
    return products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }
}
