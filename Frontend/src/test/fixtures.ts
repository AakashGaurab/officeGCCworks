import type { CategoryListing, Paginated } from '../types/Paginated';
import type { Product } from '../types/Product';

export const makeProduct = (id: number, overrides: Partial<Product> = {}): Product => ({
  id,
  title: `Product ${id}`,
  price: 10 + id,
  description: `Description ${id}`,
  category: "men's clothing",
  imageUrl: `https://example.com/${id}.png`,
  rating: { rate: 4.5, count: 100 },
  ...overrides,
});

export const makeProducts = (ids: number[]): Product[] => ids.map((id) => makeProduct(id));

export const makePage = (ids: number[], hasNextPage: boolean, total = ids.length): Paginated<Product> => ({
  items: makeProducts(ids),
  page: 1,
  pageSize: 10,
  total,
  hasNextPage,
});

export const makeCategoryListing = (
  topRatedIds: number[],
  ids: number[],
  hasNextPage: boolean,
): CategoryListing => ({ ...makePage(ids, hasNextPage), topRated: makeProducts(topRatedIds) });
