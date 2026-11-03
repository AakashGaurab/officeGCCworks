import type { Product } from '../domain/Product.js';
import { sortByRating } from './sortByRating.js';

export const getTopRated = (products: readonly Product[], count: number): Product[] =>
  sortByRating(products).slice(0, count);
