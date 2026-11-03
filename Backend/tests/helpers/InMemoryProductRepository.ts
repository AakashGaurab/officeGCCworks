import type { Category } from '../../src/domain/Category.js';
import type { Product } from '../../src/domain/Product.js';
import type { ProductRepository } from '../../src/domain/ProductRepository.js';

// A second ProductRepository implementation: proves the data source is swappable.
export class InMemoryProductRepository implements ProductRepository {
  constructor(private readonly products: Product[]) {}

  async getAll(): Promise<Product[]> {
    return this.products;
  }

  async getById(id: number): Promise<Product | undefined> {
    return this.products.find((product) => product.id === id);
  }

  async getCategories(): Promise<Category[]> {
    return [...new Set(this.products.map((product) => product.category))];
  }
}
