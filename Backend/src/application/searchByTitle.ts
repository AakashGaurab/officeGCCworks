import type { Product } from '../domain/Product.js';

// Case-insensitive substring match on the title. Empty or whitespace-only means "no filter".
export const searchByTitle = (
  products: readonly Product[],
  search: string | undefined,
): readonly Product[] => {
  const term = search?.trim().toLowerCase();
  if (!term) return products;
  return products.filter((product) => product.title.toLowerCase().includes(term));
};
