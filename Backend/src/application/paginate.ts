import { DEFAULT_PAGE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from '../config/constants.js';

export type Page<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
};

export const paginate = <T>(all: readonly T[], page: number, pageSize: number): Page<T> => {
  // Clamp so a bad value can never produce a negative slice or an oversized page.
  const safePage = Math.max(page, DEFAULT_PAGE);
  const safePageSize = Math.min(Math.max(pageSize, MIN_PAGE_SIZE), MAX_PAGE_SIZE);
  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize;

  return {
    items: all.slice(start, end),
    page: safePage,
    pageSize: safePageSize,
    total: all.length,
    hasNextPage: end < all.length,
  };
};
