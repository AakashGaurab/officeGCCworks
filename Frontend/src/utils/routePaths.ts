import { RouteParam, RoutePath, SearchQueryKey } from '../constants/Routes';

// Category names contain spaces and apostrophes ("men's clothing"), so they must be encoded in the URL.
// React Router decodes route params for us, so no decode helper is needed.
const CATEGORY_TOKEN = `:${RouteParam.CATEGORY}`;
const PRODUCT_ID_TOKEN = `:${RouteParam.PRODUCT_ID}`;

export const buildCategoryPath = (category: string): string =>
  RoutePath.CATEGORY.replace(CATEGORY_TOKEN, encodeURIComponent(category));

export const buildProductPath = (id: number): string => RoutePath.PRODUCT.replace(PRODUCT_ID_TOKEN, String(id));

export const buildSearchPath = (term: string): string =>
  `${RoutePath.SEARCH}?${SearchQueryKey.TERM}=${encodeURIComponent(term)}`;
