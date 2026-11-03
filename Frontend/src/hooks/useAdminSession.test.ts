import { act, renderHook } from '@testing-library/react';
import { listEnquiries } from '../api/adminApi';
import { ApiError } from '../api/ApiError';
import { ADMIN_TOKEN_STORAGE_KEY } from '../constants/AppConstants';
import { makeAdminPage } from '../test/fixtures';
import { useAdminSession } from './useAdminSession';

vi.mock('../api/adminApi');

afterEach(() => sessionStorage.clear());

describe('useAdminSession', () => {
  it('keeps and stores the token after the API accepts it', async () => {
    vi.mocked(listEnquiries).mockResolvedValue(makeAdminPage([], false));
    const { result } = renderHook(() => useAdminSession());

    await act(() => result.current.signIn('  good-token  '));

    expect(result.current.token).toBe('good-token');
    expect(sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)).toBe('good-token');
    expect(listEnquiries).toHaveBeenCalledWith('good-token', expect.objectContaining({ pageSize: 1 }));
  });

  it('starts signed in when a token is already stored', () => {
    sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, 'stored');
    const { result } = renderHook(() => useAdminSession());

    expect(result.current.token).toBe('stored');
  });

  it.each([
    [401, 'That token is not correct.'],
    [429, 'Too many attempts. Try again in a minute.'],
    [404, 'Admin access is not enabled on this server.'],
  ])('shows the message for a %i and stays signed out', async (status, message) => {
    vi.mocked(listEnquiries).mockRejectedValue(new ApiError(status, 'CODE', 'text'));
    const { result } = renderHook(() => useAdminSession());

    await act(() => result.current.signIn('some-token'));

    expect(result.current.loginError).toBe(message);
    expect(result.current.token).toBeNull();
    expect(sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('asks for a token without calling the API when the input is blank', async () => {
    const { result } = renderHook(() => useAdminSession());

    await act(() => result.current.signIn('   '));

    expect(result.current.loginError).toBe('Enter the admin token.');
    expect(listEnquiries).not.toHaveBeenCalled();
  });

  it('signOut clears state and storage', async () => {
    vi.mocked(listEnquiries).mockResolvedValue(makeAdminPage([], false));
    const { result } = renderHook(() => useAdminSession());
    await act(() => result.current.signIn('good-token'));

    act(() => result.current.signOut());

    expect(result.current.token).toBeNull();
    expect(sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)).toBeNull();
    expect(result.current.notice).toBeNull();
  });

  it('expireSession signs out with a notice', async () => {
    sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, 'stored');
    const { result } = renderHook(() => useAdminSession());

    act(() => result.current.expireSession());

    expect(result.current.token).toBeNull();
    expect(result.current.notice).toContain('signed out');
    expect(sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('still works when storage throws', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.mocked(listEnquiries).mockResolvedValue(makeAdminPage([], false));
    const { result } = renderHook(() => useAdminSession());

    await act(() => result.current.signIn('good-token'));

    expect(result.current.token).toBe('good-token');
    vi.restoreAllMocks();
  });
});
