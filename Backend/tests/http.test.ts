import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import type { ProductRepository } from '../src/domain/ProductRepository.js';
import { UpstreamError } from '../src/domain/UpstreamError.js';
import { buildTestApp, TEST_CORS_ORIGIN } from './helpers/buildTestApp.js';
import { buildProduct } from './helpers/buildProduct.js';
import { InMemoryProductRepository } from './helpers/InMemoryProductRepository.js';

const CORS_ORIGIN = TEST_CORS_ORIGIN;

const products = Array.from({ length: 12 }, (_, index) =>
  buildProduct({
    id: index + 1,
    category: index < 6 ? 'shoes' : 'hats',
    title: `Item ${index + 1}`,
    rating: { rate: 1 + index * 0.1, count: 5 },
  }),
);

class FailingProductRepository implements ProductRepository {
  getAll(): Promise<never> {
    return Promise.reject(new UpstreamError('boom with secret details'));
  }
  getById(): Promise<never> {
    return this.getAll();
  }
  getCategories(): Promise<never> {
    return this.getAll();
  }
}

let app: FastifyInstance;

const startApp = async (repository: ProductRepository = new InMemoryProductRepository(products)) => {
  app = await buildTestApp({ productRepository: repository });
  return app;
};

afterEach(() => app.close());

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const response = await (await startApp()).inject({ method: 'GET', url: '/api/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('sets security and CORS headers', async () => {
    const response = await (await startApp()).inject({
      method: 'GET',
      url: '/api/health',
      headers: { origin: CORS_ORIGIN },
    });
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['access-control-allow-origin']).toBe(CORS_ORIGIN);
  });
});

describe('GET /api/products/featured', () => {
  it('returns the 5 best rated products', async () => {
    const response = await (await startApp()).inject({ url: '/api/products/featured' });
    expect(response.statusCode).toBe(200);
    expect(response.json().map((product: { id: number }) => product.id)).toEqual([12, 11, 10, 9, 8]);
  });

  it('returns 502 when the repository fails', async () => {
    const response = await (await startApp(new FailingProductRepository())).inject({
      url: '/api/products/featured',
    });
    expect(response.statusCode).toBe(502);
  });
});

describe('GET /api/categories', () => {
  it('returns category names', async () => {
    const response = await (await startApp()).inject({ url: '/api/categories' });
    expect(response.json()).toEqual(['shoes', 'hats']);
  });

  it('returns 502 when the repository fails', async () => {
    const response = await (await startApp(new FailingProductRepository())).inject({
      url: '/api/categories',
    });
    expect(response.statusCode).toBe(502);
  });
});

describe('GET /api/products', () => {
  it('returns a paginated list with defaults', async () => {
    const response = await (await startApp()).inject({ url: '/api/products' });
    const body = response.json();
    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({ page: 1, pageSize: 10, total: 12, hasNextPage: true });
    expect(body.items).toHaveLength(10);
  });

  it('applies category, search and pagination', async () => {
    const response = await (await startApp()).inject({
      url: '/api/products?category=shoes&search=%20item%201%20&page=1&pageSize=5',
    });
    expect(response.json()).toMatchObject({ total: 1, hasNextPage: false });
  });

  it('clamps a too large pageSize', async () => {
    const response = await (await startApp()).inject({ url: '/api/products?pageSize=500' });
    expect(response.json().pageSize).toBe(50);
  });

  it.each(['page=0', 'page=abc', 'pageSize=-1', 'page=1.5'])('returns 400 for %s', async (query) => {
    const response = await (await startApp()).inject({ url: `/api/products?${query}` });
    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 502 with a safe JSON error when the repository fails', async () => {
    const response = await (await startApp(new FailingProductRepository())).inject({
      url: '/api/products',
    });
    expect(response.statusCode).toBe(502);
    expect(response.json().error.code).toBe('UPSTREAM_ERROR');
    expect(response.body).not.toContain('secret');
    expect(response.body).not.toContain('stack');
  });
});

describe('GET /api/categories/:category/products', () => {
  it('returns top rated and remaining products', async () => {
    const response = await (await startApp()).inject({ url: '/api/categories/shoes/products' });
    const body = response.json();
    expect(response.statusCode).toBe(200);
    expect(body.topRated).toHaveLength(4);
    expect(body).toMatchObject({ page: 1, pageSize: 10, total: 2, hasNextPage: false });
    expect(body.items).toHaveLength(2);
  });

  it('handles a category with spaces and an apostrophe', async () => {
    const category = "men's clothing";
    const repository = new InMemoryProductRepository([buildProduct({ id: 1, category })]);
    const response = await (await startApp(repository)).inject({
      url: '/api/categories/men%27s%20clothing/products',
    });
    expect(response.statusCode).toBe(200);
  });

  it('returns 404 for an unknown category', async () => {
    const response = await (await startApp()).inject({ url: '/api/categories/nope/products' });
    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('NOT_FOUND');
  });

  it('returns 400 for an invalid page', async () => {
    const response = await (await startApp()).inject({
      url: '/api/categories/shoes/products?page=0',
    });
    expect(response.statusCode).toBe(400);
  });

  it('returns 502 when the repository fails', async () => {
    const response = await (await startApp(new FailingProductRepository())).inject({
      url: '/api/categories/shoes/products',
    });
    expect(response.statusCode).toBe(502);
  });
});

describe('GET /api/products/:id', () => {
  it('returns the product', async () => {
    const response = await (await startApp()).inject({ url: '/api/products/3' });
    expect(response.statusCode).toBe(200);
    expect(response.json().id).toBe(3);
  });

  it('returns 404 when missing', async () => {
    const response = await (await startApp()).inject({ url: '/api/products/999' });
    expect(response.statusCode).toBe(404);
  });

  it.each(['abc', '0', '-2', '1.5'])('returns 400 for invalid id %s', async (id) => {
    const response = await (await startApp()).inject({ url: `/api/products/${id}` });
    expect(response.statusCode).toBe(400);
  });

  it('returns 502 when the repository fails', async () => {
    const response = await (await startApp(new FailingProductRepository())).inject({
      url: '/api/products/1',
    });
    expect(response.statusCode).toBe(502);
  });
});

describe('unknown routes', () => {
  it('return a JSON 404', async () => {
    const response = await (await startApp()).inject({ url: '/api/nothing' });
    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('NOT_FOUND');
  });
});
