import { ApiPath } from '../constants/Routes';
import type { CategoryListing, PageParams, Paginated, SearchParams } from '../types/Paginated';
import type { Category, Product } from '../types/Product';
import { apiGet } from './apiClient';

// Hooks import these functions; tests replace this module with mocks.
export const getFeaturedProducts = (signal?: AbortSignal): Promise<Product[]> =>
  apiGet<Product[]>(ApiPath.FEATURED_PRODUCTS, { signal });

export const getCategories = (signal?: AbortSignal): Promise<Category[]> =>
  apiGet<Category[]>(ApiPath.CATEGORIES, { signal });

export const getProducts = (
  { search, page, pageSize }: SearchParams,
  signal?: AbortSignal,
): Promise<Paginated<Product>> =>
  apiGet<Paginated<Product>>(ApiPath.PRODUCTS, { params: { search, page, pageSize }, signal });

export const getCategoryProducts = (
  category: string,
  { page, pageSize }: PageParams,
  signal?: AbortSignal,
): Promise<CategoryListing> =>
  apiGet<CategoryListing>(`${ApiPath.CATEGORIES}/${encodeURIComponent(category)}/products`, {
    params: { page, pageSize },
    signal,
  });

export const getProductById = (id: number, signal?: AbortSignal): Promise<Product> =>
  apiGet<Product>(`${ApiPath.PRODUCTS}/${id}`, { signal });
