import { CATEGORY_TOP_RATED_COUNT, FEATURED_PRODUCTS_COUNT } from '../config/constants.js';
import type { Category } from '../domain/Category.js';
import { NotFoundError } from '../domain/NotFoundError.js';
import type { Product } from '../domain/Product.js';
import type { ProductRepository } from '../domain/ProductRepository.js';
import { getTopRated } from './getTopRated.js';
import { paginate, type Page } from './paginate.js';
import { searchByTitle } from './searchByTitle.js';
import { sortByRating } from './sortByRating.js';

export type ListProductsQuery = {
  category?: string;
  search?: string;
  page: number;
  pageSize: number;
};

// topRated is always returned for simplicity, but it is only meaningful on page 1.
export type CategoryListing = Page<Product> & { topRated: Product[] };

export enum CatalogueErrorMessage {
  PRODUCT_NOT_FOUND = 'Product not found',
  CATEGORY_NOT_FOUND = 'Category not found',
}

export class CatalogueService {
  // Depends on the interface only, so any ProductRepository can be injected.
  constructor(private readonly repository: ProductRepository) {}

  async getFeaturedProducts(): Promise<Product[]> {
    return getTopRated(await this.repository.getAll(), FEATURED_PRODUCTS_COUNT);
  }

  getCategories(): Promise<Category[]> {
    return this.repository.getCategories();
  }

  async listProducts(query: ListProductsQuery): Promise<Page<Product>> {
    const products = await this.repository.getAll();
    const inCategory = query.category
      ? products.filter((product) => product.category === query.category)
      : products;
    const matching = searchByTitle(inCategory, query.search);
    return paginate(sortByRating(matching), query.page, query.pageSize);
  }

  async getProduct(id: number): Promise<Product> {
    const product = await this.repository.getById(id);
    if (!product) throw new NotFoundError(CatalogueErrorMessage.PRODUCT_NOT_FOUND);
    return product;
  }

  async getCategoryListing(
    category: string,
    page: number,
    pageSize: number,
  ): Promise<CategoryListing> {
    const categories = await this.repository.getCategories();
    if (!categories.includes(category)) {
      throw new NotFoundError(CatalogueErrorMessage.CATEGORY_NOT_FOUND);
    }

    const products = await this.repository.getAll();
    const sorted = sortByRating(products.filter((product) => product.category === category));
    const topRated = sorted.slice(0, CATEGORY_TOP_RATED_COUNT);
    const remaining = sorted.slice(CATEGORY_TOP_RATED_COUNT);

    return { ...paginate(remaining, page, pageSize), topRated };
  }
}
