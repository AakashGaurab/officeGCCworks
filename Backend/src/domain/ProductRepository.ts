import type { Category } from './Category.js';
import type { Product } from './Product.js';

// Port: the application only knows this interface, so the data source can be swapped
// (Fake Store API today, a database tomorrow) without touching business logic.
export interface ProductRepository {
  getAll(): Promise<readonly Product[]>;
  getById(id: number): Promise<Product | undefined>;
  getCategories(): Promise<Category[]>;
}
