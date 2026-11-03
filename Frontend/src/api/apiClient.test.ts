import { ApiError } from './ApiError';
import { apiGet } from './apiClient';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiGet', () => {
  it('returns parsed JSON and skips undefined query params', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ a: 1 }) });

    await expect(apiGet('/x', { params: { page: 2, search: undefined } })).resolves.toEqual({ a: 1 });
    expect(mockFetch.mock.calls[0]?.[0]).toMatch(/\/x\?page=2$/);
  });

  it('throws an ApiError with the backend code and message', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: { code: 'NOT_FOUND', message: 'Product not found' } }),
    });

    await expect(apiGet('/x')).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND', message: 'Product not found' });
  });

  it('wraps network failures in an ApiError', async () => {
    mockFetch.mockRejectedValue(new TypeError('failed'));

    await expect(apiGet('/x')).rejects.toBeInstanceOf(ApiError);
  });
});
