import { act, renderHook, waitFor } from '@testing-library/react';
import { makePage } from '../test/fixtures';
import { useInfiniteProducts } from './useInfiniteProducts';

const PAGE_ONE = makePage([1, 2], true);
const PAGE_TWO = makePage([3], false);

type Deferred<T> = { promise: Promise<T>; resolve: (value: T) => void };

const createDeferred = <T,>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

describe('useInfiniteProducts', () => {
  it('loads the first page', async () => {
    const fetchPage = vi.fn().mockResolvedValue(PAGE_ONE);
    const { result } = renderHook(() => useInfiniteProducts(fetchPage, 'a'));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.items.map((item) => item.id)).toEqual([1, 2]);
    expect(result.current.hasNextPage).toBe(true);
    expect(fetchPage).toHaveBeenCalledWith(1, expect.any(AbortSignal));
  });

  it('appends the next page on loadMore and stops when there is no next page', async () => {
    const fetchPage = vi.fn().mockResolvedValueOnce(PAGE_ONE).mockResolvedValueOnce(PAGE_TWO);
    const { result } = renderHook(() => useInfiniteProducts(fetchPage, 'a'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.items).toHaveLength(3));
    expect(result.current.hasNextPage).toBe(false);

    act(() => result.current.loadMore());
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it('starts over when the key changes', async () => {
    const fetchPage = vi.fn().mockResolvedValueOnce(PAGE_ONE).mockResolvedValueOnce(makePage([9], false));
    const { result, rerender } = renderHook(({ key }) => useInfiniteProducts(fetchPage, key), {
      initialProps: { key: 'a' },
    });
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    rerender({ key: 'b' });
    await waitFor(() => expect(result.current.items.map((item) => item.id)).toEqual([9]));
  });

  it('reports an error and retries the failed page', async () => {
    const fetchPage = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(PAGE_ONE);
    const { result } = renderHook(() => useInfiniteProducts(fetchPage, 'a'));

    await waitFor(() => expect(result.current.error?.message).toBe('boom'));
    expect(result.current.isLoading).toBe(false);

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.items).toHaveLength(2));
    expect(result.current.error).toBeNull();
    expect(fetchPage).toHaveBeenLastCalledWith(1, expect.any(AbortSignal));
  });

  it('ignores a stale response that arrives after the key changed', async () => {
    const slowOldRequest = createDeferred<ReturnType<typeof makePage>>();
    const fetchPage = vi
      .fn()
      .mockReturnValueOnce(slowOldRequest.promise)
      .mockResolvedValueOnce(makePage([9], false));
    const { result, rerender } = renderHook(({ key }) => useInfiniteProducts(fetchPage, key), {
      initialProps: { key: 'old' },
    });

    rerender({ key: 'new' });
    await waitFor(() => expect(result.current.items.map((item) => item.id)).toEqual([9]));

    await act(async () => slowOldRequest.resolve(PAGE_ONE));
    expect(result.current.items.map((item) => item.id)).toEqual([9]);
  });

  it('never shows the old list under the new key, not even for one render', async () => {
    const fetchPage = vi.fn().mockResolvedValueOnce(PAGE_ONE).mockResolvedValueOnce(makePage([9], false));
    const renders: { key: string; ids: number[]; isLoading: boolean }[] = [];
    const { result, rerender } = renderHook(
      ({ key }) => {
        const value = useInfiniteProducts(fetchPage, key);
        renders.push({ key, ids: value.items.map((item) => item.id), isLoading: value.isLoading });
        return value;
      },
      { initialProps: { key: 'a' } },
    );
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    rerender({ key: 'b' });
    await waitFor(() => expect(result.current.items.map((item) => item.id)).toEqual([9]));

    const rendersForB = renders.filter((entry) => entry.key === 'b');
    expect(rendersForB[0]).toEqual({ key: 'b', ids: [], isLoading: true });
    expect(rendersForB.some((entry) => entry.ids.includes(1))).toBe(false);
  });

  it('does not fetch or load when disabled', () => {
    const fetchPage = vi.fn();
    const { result } = renderHook(() => useInfiniteProducts(fetchPage, 'a', false));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual([]);
    expect(fetchPage).not.toHaveBeenCalled();
  });

  it('retries only the failed second page', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(PAGE_ONE)
      .mockRejectedValueOnce(new Error('page 2 down'))
      .mockResolvedValueOnce(PAGE_TWO);
    const { result } = renderHook(() => useInfiniteProducts(fetchPage, 'a'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.error?.message).toBe('page 2 down'));
    expect(result.current.isFirstLoadFailed).toBe(false);
    expect(result.current.items).toHaveLength(2);

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.items).toHaveLength(3));

    const requestedPages = fetchPage.mock.calls.map((call) => call[0]);
    expect(requestedPages).toEqual([1, 2, 2]);
  });

  it('reports a failed first load', async () => {
    const fetchPage = vi.fn().mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useInfiniteProducts(fetchPage, 'a'));

    await waitFor(() => expect(result.current.isFirstLoadFailed).toBe(true));
  });

  it('does not fetch the same page twice on a double loadMore', async () => {
    const pageTwo = createDeferred<ReturnType<typeof makePage>>();
    const fetchPage = vi.fn().mockResolvedValueOnce(PAGE_ONE).mockReturnValueOnce(pageTwo.promise);
    const { result } = renderHook(() => useInfiniteProducts(fetchPage, 'a'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.loadMore();
      result.current.loadMore();
    });
    await act(async () => pageTwo.resolve(PAGE_TWO));

    expect(fetchPage).toHaveBeenCalledTimes(2);
    expect(result.current.items).toHaveLength(3);
  });
});
