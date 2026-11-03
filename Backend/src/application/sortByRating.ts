import type { Product } from '../domain/Product.js';

// Best rated first. Ties: more reviews first, then lowest id so the order is always stable.
const compareByRating = (a: Product, b: Product): number =>
  b.rating.rate - a.rating.rate || b.rating.count - a.rating.count || a.id - b.id;

// Returns a new array; the input is never mutated.
export const sortByRating = (products: readonly Product[]): Product[] =>
  [...products].sort(compareByRating);
