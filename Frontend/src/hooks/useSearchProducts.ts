import { useCallback } from 'react';
import { getProducts } from '../api/catalogueApi';
import { PAGE_SIZE } from '../constants/AppConstants';
import { useInfiniteProducts } from './useInfiniteProducts';

export const useSearchProducts = (term: string, isEnabled = true) => {
  const fetchPage = useCallback(
    (page: number, signal: AbortSignal) => getProducts({ search: term, page, pageSize: PAGE_SIZE }, signal),
    [term],
  );
  return useInfiniteProducts(fetchPage, term, isEnabled);
};
