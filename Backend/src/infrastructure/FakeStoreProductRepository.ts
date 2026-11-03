import { PRODUCT_CACHE_TTL_MS, UPSTREAM_TIMEOUT_MS, UpstreamPath } from '../config/constants.js';
import type { Category } from '../domain/Category.js';
import type { Product } from '../domain/Product.js';
import type { ProductRepository } from '../domain/ProductRepository.js';
import { UpstreamError } from '../domain/UpstreamError.js';
import { fakeStoreProductListSchema, type FakeStoreProduct } from './fakeStoreSchema.js';
import { TtlCache } from './TtlCache.js';

enum UpstreamMessage {
  REQUEST_FAILED = 'Could not reach the product data source',
  BAD_STATUS = 'Product data source returned an unexpected status',
  INVALID_BODY = 'Product data source returned invalid data',
}

type FetchFunction = typeof fetch;

const toDomainProduct = (raw: FakeStoreProduct): Product => ({
  id: raw.id,
  title: raw.title,
  price: raw.price,
  description: raw.description,
  category: raw.category,
  imageUrl: raw.image,
  rating: { rate: raw.rating.rate, count: raw.rating.count },
});

export class FakeStoreProductRepository implements ProductRepository {
  // The API is small, so we load the whole list once and serve everything from it.
  private readonly cache = new TtlCache<readonly Product[]>(PRODUCT_CACHE_TTL_MS);

  constructor(
    private readonly baseUrl: string,
    private readonly fetchFunction: FetchFunction = fetch,
  ) {}

  // Shared by concurrent callers on a cold cache, so they trigger only one upstream call.
  private inFlight: Promise<readonly Product[]> | undefined;

  async getAll(): Promise<readonly Product[]> {
    const cached = this.cache.get();
    if (cached) return cached;

    this.inFlight ??= this.loadProducts();
    return this.inFlight;
  }

  async getById(id: number): Promise<Product | undefined> {
    const products = await this.getAll();
    return products.find((product) => product.id === id);
  }

  async getCategories(): Promise<Category[]> {
    const products = await this.getAll();
    return [...new Set(products.map((product) => product.category))];
  }

  private async loadProducts(): Promise<readonly Product[]> {
    try {
      const products = await this.fetchProducts();
      this.cache.set(products);
      return products;
    } finally {
      // Cleared on success and failure, so a failed call is retried by the next request.
      this.inFlight = undefined;
    }
  }

  private async fetchProducts(): Promise<Product[]> {
    const response = await this.request();
    if (!response.ok) {
      throw new UpstreamError(`${UpstreamMessage.BAD_STATUS}: ${response.status}`);
    }

    const parsed = fakeStoreProductListSchema.safeParse(await this.readJson(response));
    if (!parsed.success) {
      throw new UpstreamError(UpstreamMessage.INVALID_BODY, { cause: parsed.error });
    }
    return parsed.data.map(toDomainProduct);
  }

  private async request(): Promise<Response> {
    try {
      return await this.fetchFunction(`${this.baseUrl}${UpstreamPath.PRODUCTS}`, {
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      });
    } catch (cause) {
      // Covers network errors and the timeout abort.
      throw new UpstreamError(UpstreamMessage.REQUEST_FAILED, { cause });
    }
  }

  private async readJson(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch (cause) {
      throw new UpstreamError(UpstreamMessage.INVALID_BODY, { cause });
    }
  }
}
