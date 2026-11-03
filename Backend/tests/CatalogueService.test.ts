import { describe, expect, it } from 'vitest';
import { CatalogueService } from '../src/application/CatalogueService.js';
import { NotFoundError } from '../src/domain/NotFoundError.js';
import { buildProduct } from './helpers/buildProduct.js';
import { InMemoryProductRepository } from './helpers/InMemoryProductRepository.js';

const buildCategoryProducts = (category: string, count: number, firstId: number) =>
  Array.from({ length: count }, (_, index) =>
    buildProduct({
      id: firstId + index,
      category,
      title: `${category} item ${index}`,
      // Higher index means higher rating, so the best product is the last one.
      rating: { rate: 1 + index * 0.1, count: 5 },
    }),
  );

const shoes = buildCategoryProducts('shoes', 8, 1);
const hats = buildCategoryProducts('hats', 3, 100);
const buildService = () => new CatalogueService(new InMemoryProductRepository([...shoes, ...hats]));

describe('CatalogueService', () => {
  it('returns the 5 best rated products as featured', async () => {
    const featured = await buildService().getFeaturedProducts();
    expect(featured).toHaveLength(5);
    expect(featured[0]?.rating.rate).toBeGreaterThanOrEqual(featured[4]?.rating.rate ?? 0);
  });

  it('lists categories', async () => {
    expect(await buildService().getCategories()).toEqual(['shoes', 'hats']);
  });

  it('filters by category and title search', async () => {
    const result = await buildService().listProducts({
      category: 'shoes',
      search: 'ITEM 3',
      page: 1,
      pageSize: 10,
    });
    expect(result.items.map((product) => product.title)).toEqual(['shoes item 3']);
    expect(result.total).toBe(1);
  });

  it('paginates all products sorted by rating', async () => {
    const result = await buildService().listProducts({ page: 2, pageSize: 5 });
    expect(result).toMatchObject({ page: 2, total: 11, hasNextPage: true });
    expect(result.items).toHaveLength(5);
  });

  it('gets a product by id and throws NotFoundError when missing', async () => {
    const service = buildService();
    expect((await service.getProduct(1)).id).toBe(1);
    await expect(service.getProduct(999)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('returns top 4 plus the remaining category products paginated', async () => {
    const listing = await buildService().getCategoryListing('shoes', 1, 3);
    expect(listing.topRated.map((product) => product.id)).toEqual([8, 7, 6, 5]);
    expect(listing.items.map((product) => product.id)).toEqual([4, 3, 2]);
    expect(listing).toMatchObject({ total: 4, hasNextPage: true });
  });

  it('returns no remaining items for a category with 4 or fewer products', async () => {
    const listing = await buildService().getCategoryListing('hats', 1, 10);
    expect(listing.topRated).toHaveLength(3);
    expect(listing).toMatchObject({ items: [], total: 0, hasNextPage: false });
  });

  it('throws NotFoundError for an unknown category', async () => {
    await expect(buildService().getCategoryListing('nope', 1, 10)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
