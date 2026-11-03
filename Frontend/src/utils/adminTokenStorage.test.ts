import { clearStoredToken, readStoredToken, storeToken } from './adminTokenStorage';

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
});

describe('adminTokenStorage', () => {
  it('stores, reads and clears the token', () => {
    storeToken('abc');
    expect(readStoredToken()).toBe('abc');

    clearStoredToken();
    expect(readStoredToken()).toBeNull();
  });

  it('does not throw when sessionStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(readStoredToken()).toBeNull();
    expect(() => storeToken('abc')).not.toThrow();
    expect(() => clearStoredToken()).not.toThrow();
  });
});
