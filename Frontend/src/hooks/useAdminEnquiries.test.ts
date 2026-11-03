import { act, renderHook, waitFor } from '@testing-library/react';
import { listEnquiries } from '../api/adminApi';
import { ApiError } from '../api/ApiError';
import { EnquiryStatus } from '../constants/AppConstants';
import { makeAdminPage } from '../test/fixtures';
import { useAdminEnquiries } from './useAdminEnquiries';

vi.mock('../api/adminApi');

const PAGE_ONE = makeAdminPage([1, 2], true);
const PAGE_TWO = makeAdminPage([3], false);

const renderList = (status?: EnquiryStatus, onUnauthorized = vi.fn()) =>
  renderHook(({ filter }) => useAdminEnquiries('token', filter, onUnauthorized), {
    initialProps: { filter: status },
  });

describe('useAdminEnquiries', () => {
  it('loads the first page with the token and exposes the counts', async () => {
    vi.mocked(listEnquiries).mockResolvedValue(PAGE_ONE);
    const { result } = renderList();

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.items).toHaveLength(2);
    expect(result.current.statusCounts).toEqual({ pending: 1, sent: 2, failed: 1 });
    expect(listEnquiries).toHaveBeenCalledWith(
      'token',
      { status: undefined, page: 1, pageSize: 20 },
      expect.any(AbortSignal),
    );
  });

  it('appends the next page on loadMore', async () => {
    vi.mocked(listEnquiries).mockResolvedValueOnce(PAGE_ONE).mockResolvedValueOnce(PAGE_TWO);
    const { result } = renderList();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.items).toHaveLength(3));

    expect(result.current.hasNextPage).toBe(false);
    expect(vi.mocked(listEnquiries).mock.calls[1]?.[1]).toMatchObject({ page: 2 });
  });

  it('does not show a row twice when a new enquiry shifts it onto the next page', async () => {
    vi.mocked(listEnquiries).mockResolvedValueOnce(PAGE_ONE).mockResolvedValueOnce(makeAdminPage([2, 3], false));
    const { result } = renderList();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.items).toHaveLength(3));

    expect(result.current.items.map((item) => item.id)).toEqual(['enquiry-1', 'enquiry-2', 'enquiry-3']);
  });

  it('starts over with the new status when the filter changes', async () => {
    vi.mocked(listEnquiries).mockResolvedValueOnce(PAGE_ONE).mockResolvedValueOnce(makeAdminPage([9], false));
    const { result, rerender } = renderList();
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    rerender({ filter: EnquiryStatus.FAILED });
    expect(result.current.items).toEqual([]);
    await waitFor(() => expect(result.current.items.map((item) => item.id)).toEqual(['enquiry-9']));

    expect(vi.mocked(listEnquiries).mock.calls[1]?.[1]).toMatchObject({ status: 'failed', page: 1 });
  });

  it('reloads from page 1 on refresh', async () => {
    vi.mocked(listEnquiries).mockResolvedValueOnce(PAGE_ONE).mockResolvedValueOnce(makeAdminPage([7], false));
    const { result } = renderList();
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    act(() => result.current.refresh());
    await waitFor(() => expect(result.current.items.map((item) => item.id)).toEqual(['enquiry-7']));
  });

  it('reports a failed first load and retries it', async () => {
    vi.mocked(listEnquiries).mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(PAGE_ONE);
    const { result } = renderList();
    await waitFor(() => expect(result.current.isFirstLoadFailed).toBe(true));

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    expect(result.current.error).toBeNull();
  });

  it('keeps the loaded rows when a later page fails and retries only that page', async () => {
    vi.mocked(listEnquiries)
      .mockResolvedValueOnce(PAGE_ONE)
      .mockRejectedValueOnce(new Error('page 2 down'))
      .mockResolvedValueOnce(PAGE_TWO);
    const { result } = renderList();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.error?.message).toBe('page 2 down'));
    expect(result.current.isFirstLoadFailed).toBe(false);
    expect(result.current.items).toHaveLength(2);

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.items).toHaveLength(3));
    expect(vi.mocked(listEnquiries).mock.calls.map((call) => call[1].page)).toEqual([1, 2, 2]);
  });

  it('ignores a stale response that arrives after the filter changed', async () => {
    let resolveOld!: (page: typeof PAGE_ONE) => void;
    const oldRequest = new Promise<typeof PAGE_ONE>((resolve) => {
      resolveOld = resolve;
    });
    vi.mocked(listEnquiries).mockReturnValueOnce(oldRequest).mockResolvedValueOnce(makeAdminPage([9], false));
    const { result, rerender } = renderList();

    rerender({ filter: EnquiryStatus.SENT });
    await waitFor(() => expect(result.current.items.map((item) => item.id)).toEqual(['enquiry-9']));

    await act(async () => resolveOld(PAGE_ONE));
    expect(result.current.items.map((item) => item.id)).toEqual(['enquiry-9']);
  });

  it('calls onUnauthorized for a 401 instead of showing an error', async () => {
    vi.mocked(listEnquiries).mockRejectedValue(new ApiError(401, 'UNAUTHORIZED', 'no'));
    const onUnauthorized = vi.fn();
    const { result } = renderList(undefined, onUnauthorized);

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalledTimes(1));
    expect(result.current.error).toBeNull();
  });
});
