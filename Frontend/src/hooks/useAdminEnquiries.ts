import { useCallback, useEffect, useRef, useState } from 'react';
import { listEnquiries } from '../api/adminApi';
import {
  ADMIN_PAGE_SIZE,
  ALL_STATUSES_KEY,
  FIRST_PAGE,
  INITIAL_REFRESH_COUNT,
  NO_PAGE_LOADED,
  type EnquiryStatus,
} from '../constants/AppConstants';
import type { AdminEnquiry, StatusCounts } from '../types/AdminEnquiry';
import { isUnauthorizedError } from '../utils/isUnauthorizedError';
import { toError } from '../utils/toError';

type ListState = {
  key: string;
  items: AdminEnquiry[];
  lastLoadedPage: number;
  hasNextPage: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
};

// A new enquiry arriving between two page loads shifts rows onto the next page; skip ones already shown.
const appendUnique = (current: AdminEnquiry[], incoming: AdminEnquiry[]): AdminEnquiry[] => {
  const knownIds = new Set(current.map((item) => item.id));
  return [...current, ...incoming.filter((item) => !knownIds.has(item.id))];
};

const createInitialState = (key: string): ListState => ({
  key,
  items: [],
  lastLoadedPage: NO_PAGE_LOADED,
  hasNextPage: false,
  isLoading: true,
  isLoadingMore: false,
  error: null,
});

// A new key (another status filter, or Refresh) starts the list over from page 1.
const buildKey = (status: EnquiryStatus | undefined, refreshCount: number): string =>
  `${status ?? ALL_STATUSES_KEY}:${refreshCount}`;

// Paged loader for the admin list; mirrors useInfiniteProducts (abort and key reset), plus the status counts.
// A 401 means the token is no longer valid, so the caller is told to end the session.
export const useAdminEnquiries = (
  token: string,
  status: EnquiryStatus | undefined,
  onUnauthorized: () => void,
) => {
  const [refreshCount, setRefreshCount] = useState(INITIAL_REFRESH_COUNT);
  const key = buildKey(status, refreshCount);
  const [storedState, setState] = useState<ListState>(() => createInitialState(key));
  // Counts are kept across filter changes so the tabs do not blink while the new list loads.
  const [statusCounts, setStatusCounts] = useState<StatusCounts | null>(null);
  // Until the effect below resets the stored state for a new key, it still belongs to the old key.
  const state = storedState.key === key ? storedState : createInitialState(key);
  const controllerRef = useRef<AbortController | null>(null);
  const onUnauthorizedRef = useRef(onUnauthorized);

  useEffect(() => {
    onUnauthorizedRef.current = onUnauthorized;
  });

  const loadPage = useCallback(
    async (pageNumber: number) => {
      const controller = controllerRef.current;
      if (!controller) return;

      const isFirstPage = pageNumber === FIRST_PAGE;
      setState((previous) => ({ ...previous, error: null, isLoading: isFirstPage, isLoadingMore: !isFirstPage }));

      try {
        const result = await listEnquiries(token, { status, page: pageNumber, pageSize: ADMIN_PAGE_SIZE }, controller.signal);
        // The key changed while we waited: this answer belongs to an old view, drop it.
        if (controller.signal.aborted) return;
        setStatusCounts(result.statusCounts);
        setState((previous) => ({
          ...previous,
          items: appendUnique(previous.items, result.items),
          lastLoadedPage: pageNumber,
          hasNextPage: result.hasNextPage,
          isLoading: false,
          isLoadingMore: false,
        }));
      } catch (error) {
        if (controller.signal.aborted) return;
        if (isUnauthorizedError(error)) {
          onUnauthorizedRef.current();
          return;
        }
        setState((previous) => ({ ...previous, error: toError(error), isLoading: false, isLoadingMore: false }));
      }
    },
    [token, status],
  );

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    setState(createInitialState(key));
    void loadPage(FIRST_PAGE);

    return () => controller.abort();
  }, [key, loadPage]);

  const loadMore = useCallback(() => {
    if (!state.hasNextPage || state.isLoadingMore || state.error) return;
    void loadPage(state.lastLoadedPage + 1);
  }, [state.hasNextPage, state.isLoadingMore, state.error, state.lastLoadedPage, loadPage]);

  // Retrying asks for the page after the last one that worked, which also covers a failed first page.
  const retry = useCallback(() => {
    void loadPage(state.lastLoadedPage + 1);
  }, [state.lastLoadedPage, loadPage]);

  const refresh = useCallback(() => setRefreshCount((previous) => previous + 1), []);

  return {
    items: state.items,
    statusCounts,
    isLoading: state.isLoading,
    isLoadingMore: state.isLoadingMore,
    hasNextPage: state.hasNextPage,
    error: state.error,
    isFirstLoadFailed: state.error !== null && state.items.length === 0 && state.lastLoadedPage === NO_PAGE_LOADED,
    loadMore,
    retry,
    refresh,
  };
};
