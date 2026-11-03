import { getCategoryProducts } from './catalogueApi';

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getCategoryProducts', () => {
  it('requests the encoded category path with paging params', async () => {
    await getCategoryProducts("men's clothing", { page: 2, pageSize: 10 });

    // encodeURIComponent encodes the space but leaves the apostrophe as is.
    expect(mockFetch.mock.calls[0]?.[0]).toMatch(/\/categories\/men's%20clothing\/products\?page=2&pageSize=10$/);
  });

  it('encodes characters that would break the path', async () => {
    await getCategoryProducts('a/b?c', { page: 1, pageSize: 10 });

    expect(mockFetch.mock.calls[0]?.[0]).toMatch(/\/categories\/a%2Fb%3Fc\/products\?/);
  });
});
