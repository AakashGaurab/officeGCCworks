import { describe, expect, it, vi } from 'vitest';
import { UpstreamError } from '../src/domain/UpstreamError.js';
import { FakeStoreProductRepository } from '../src/infrastructure/FakeStoreProductRepository.js';

const BASE_URL = 'https://fake-store.test';

const rawProduct = {
  id: 1,
  title: 'Backpack',
  price: 109.95,
  description: 'Fits 15 inch laptops',
  category: 'bags',
  image: 'https://img.test/1.png',
  rating: { rate: 3.9, count: 120 },
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const buildRepository = (fetchMock: ReturnType<typeof vi.fn>) =>
  new FakeStoreProductRepository(BASE_URL, fetchMock as unknown as typeof fetch);

describe('FakeStoreProductRepository', () => {
  it('maps the upstream payload to domain products', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([rawProduct]));
    const products = await buildRepository(fetchMock).getAll();

    expect(products).toEqual([
      {
        id: 1,
        title: 'Backpack',
        price: 109.95,
        description: 'Fits 15 inch laptops',
        category: 'bags',
        imageUrl: 'https://img.test/1.png',
        rating: { rate: 3.9, count: 120 },
      },
    ]);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${BASE_URL}/products`);
  });

  it('derives unique categories and finds products by id', async () => {
    const second = { ...rawProduct, id: 2, category: 'bags' };
    const third = { ...rawProduct, id: 3, category: 'hats' };
    const repository = buildRepository(
      vi.fn().mockResolvedValue(jsonResponse([rawProduct, second, third])),
    );

    expect(await repository.getCategories()).toEqual(['bags', 'hats']);
    expect((await repository.getById(3))?.category).toBe('hats');
    expect(await repository.getById(99)).toBeUndefined();
  });

  it('caches the list between calls', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => jsonResponse([rawProduct]));
    const repository = buildRepository(fetchMock);

    await repository.getAll();
    await repository.getAll();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('shares one upstream call between concurrent cold-cache requests', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => jsonResponse([rawProduct]));
    const repository = buildRepository(fetchMock);

    await Promise.all(Array.from({ length: 10 }, () => repository.getAll()));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not cache a failure, so the next request retries', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockImplementation(async () => jsonResponse([rawProduct]));
    const repository = buildRepository(fetchMock);

    await expect(repository.getAll()).rejects.toBeInstanceOf(UpstreamError);
    expect(await repository.getAll()).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('rejects a malformed payload', async () => {
    const malformed = [{ ...rawProduct, rating: undefined }];
    const repository = buildRepository(vi.fn().mockResolvedValue(jsonResponse(malformed)));
    await expect(repository.getAll()).rejects.toBeInstanceOf(UpstreamError);
  });

  it('rejects a body that is not JSON', async () => {
    const repository = buildRepository(vi.fn().mockResolvedValue(new Response('<html>')));
    await expect(repository.getAll()).rejects.toBeInstanceOf(UpstreamError);
  });

  it('maps a non-200 status to UpstreamError', async () => {
    const repository = buildRepository(vi.fn().mockResolvedValue(jsonResponse({}, 500)));
    await expect(repository.getAll()).rejects.toBeInstanceOf(UpstreamError);
  });

  it('maps a timeout to UpstreamError', async () => {
    const timeout = new DOMException('The operation timed out', 'TimeoutError');
    const repository = buildRepository(vi.fn().mockRejectedValue(timeout));
    await expect(repository.getAll()).rejects.toBeInstanceOf(UpstreamError);
  });

  it('maps a network failure to UpstreamError', async () => {
    const repository = buildRepository(vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    await expect(repository.getAll()).rejects.toBeInstanceOf(UpstreamError);
  });
});
