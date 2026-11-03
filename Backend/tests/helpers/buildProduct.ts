import type { Product } from '../../src/domain/Product.js';

export const buildProduct = (overrides: Partial<Product> & { id: number }): Product => ({
  title: `Product ${overrides.id}`,
  price: 10,
  description: 'A product',
  category: 'general',
  imageUrl: 'https://example.com/image.png',
  rating: { rate: 4, count: 10 },
  ...overrides,
});
