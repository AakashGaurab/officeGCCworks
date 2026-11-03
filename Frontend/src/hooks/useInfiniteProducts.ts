import { useCallback, useEffect, useRef, useState } from 'react';
import { FIRST_PAGE, NO_PAGE_LOADED } from '../constants/AppConstants';
import type { Paginated } from '../types/Paginated';
import type { Product } from '../types/Product';
import { toError } from '../utils/toError';

export type FetchPage<TPage> = (page: number, signal: AbortSignal) => Promise<TPage>;

type InfiniteState<TPage> = {
  key: string;
  items: Product[];
  lastLoadedPage: number;
  firstPage: TPage | null;
  hasNextPage: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
};

const createInitialState = (key: string, isEnabled: boolean): InfiniteState<never> => ({
  key,
  items: [],
  lastLoadedPage: NO_PAGE_LOADED,
  firstPage: null,
  hasNextPage: false,
  isLoading: isEnabled,
  isLoadingMore: false,
  error: null,
});

// Generic paged loader: the caller supplies how to fetch a page, `key` says when to start over.
// `firstPage` exposes the whole first response (e.g. the category's topRated list).
// With `isEnabled` false nothing is fetched and nothing is loading (e.g. a search without a term).
export const useInfiniteProducts = <TPage extends Paginated<Product>>(
  fetchPage: FetchPage<TPage>,
  key: string,
  isEnabled = true,
) => {
  const [storedState, setState] = useState<InfiniteState<TPage>>(() => createInitialState(key, isEnabled));
  // Until the effect below resets the stored state for a new key, it still belongs to the old key.
  // Showing a fresh state meanwhile prevents one frame of the old list under the new key.
  const state = storedState.key === key ? storedState : createInitialState(key, isEnabled);
  const fetchPageRef = useRef(fetchPage);
  const controllerRef = useRef<AbortController | null>(null);
  // A ref (not state) so two quick sentinel triggers cannot start the same page twice.
  const isFetchingRef = useRef(false);

  useEffect(() => {
    fetchPageRef.current = fetchPage;
  });

  const loadPage = useCallback(async (pageNumber: number) => {
    const controller = controllerRef.current;
    if (!controller || isFetchingRef.current) return;

    const isFirstPage = pageNumber === FIRST_PAGE;
    isFetchingRef.current = true;
    setState((previous) => ({
      ...previous,
      error: null,
      isLoading: isFirstPage,
      isLoadingMore: !isFirstPage,
    }));

    try {
      const result = await fetchPageRef.current(pageNumber, controller.signal);
      // The key changed while we waited: this answer belongs to an old view, drop it.
      if (controller.signal.aborted) return;
      isFetchingRef.current = false;
      setState((previous) => ({
        ...previous,
        items: [...previous.items, ...result.items],
        lastLoadedPage: pageNumber,
        firstPage: isFirstPage ? result : previous.firstPage,
        hasNextPage: result.hasNextPage,
        isLoading: false,
        isLoadingMore: false,
      }));
    } catch (error) {
      if (controller.signal.aborted) return;
      isFetchingRef.current = false;
      setState((previous) => ({
        ...previous,
        error: toError(error),
        isLoading: false,
        isLoadingMore: false,
      }));
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    isFetchingRef.current = false;
    setState(createInitialState(key, isEnabled));
    if (isEnabled) void loadPage(FIRST_PAGE);

    return () => controller.abort();
  }, [key, isEnabled, loadPage]);

  // Retrying simply asks for the page after the last one that succeeded, which also covers a failed first page.
  const loadMore = useCallback(() => {
    if (!state.hasNextPage || state.error) return;
    void loadPage(state.lastLoadedPage + 1);
  }, [state.hasNextPage, state.error, state.lastLoadedPage, loadPage]);

  const retry = useCallback(() => {
    void loadPage(state.lastLoadedPage + 1);
  }, [state.lastLoadedPage, loadPage]);

  return {
    isFirstLoadFailed: state.error !== null && state.firstPage === null,
    items: state.items,
    firstPage: state.firstPage,
    isLoading: state.isLoading,
    isLoadingMore: state.isLoadingMore,
    error: state.error,
    hasNextPage: state.hasNextPage,
    loadMore,
    retry,
  };
};
