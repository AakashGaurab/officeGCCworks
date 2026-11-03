import type { Product } from './Product';

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
};

// topRated is only meaningful on page 1.
export type CategoryListing = Paginated<Product> & { topRated: Product[] };

export type PageParams = {
  page: number;
  pageSize: number;
};

// search is optional: leaving it out lists every product (used by the home page).
export type SearchParams = PageParams & { search?: string };
