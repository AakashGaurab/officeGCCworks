import { ApiError } from './ApiError';
import { apiGet, apiPost } from './apiClient';

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

  it('sends the given request headers', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    await apiGet('/x', { headers: { Authorization: 'Bearer abc' } });

    expect(mockFetch.mock.calls[0]?.[1]).toMatchObject({ headers: { Authorization: 'Bearer abc' } });
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

describe('apiPost', () => {
  it('sends the body as JSON', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: '1' }) });

    await expect(apiPost('/x', { a: 1 })).resolves.toEqual({ id: '1' });
    expect(mockFetch.mock.calls[0]?.[1]).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"a":1}',
    });
  });

  it('throws an ApiError with the status on failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: { code: 'RATE_LIMITED', message: 'slow down' } }),
    });

    await expect(apiPost('/x', {})).rejects.toMatchObject({ status: 429, code: 'RATE_LIMITED' });
  });

  describe('timeout', () => {
    const POST_TIMEOUT = 15000;

    // A fetch that never answers and rejects like the browser when its signal aborts.
    const mockHangingFetch = () =>
      mockFetch.mockImplementation(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
          }),
      );

    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('turns a request that takes too long into a friendly timeout ApiError', async () => {
      mockHangingFetch();
      const result = apiPost('/x', {});
      const assertion = expect(result).rejects.toMatchObject({ status: 408, code: 'TIMEOUT_ERROR' });

      await vi.advanceTimersByTimeAsync(POST_TIMEOUT);
      await assertion;
    });

    it('keeps a caller abort as an AbortError, not a timeout', async () => {
      mockHangingFetch();
      const controller = new AbortController();
      const result = apiPost('/x', {}, { signal: controller.signal });
      const assertion = expect(result).rejects.toMatchObject({ name: 'AbortError' });

      controller.abort();
      await assertion;
    });

    it('does not time out a request that answers in time', async () => {
      mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: '1' }) });

      await expect(apiPost('/x', {})).resolves.toEqual({ id: '1' });
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
