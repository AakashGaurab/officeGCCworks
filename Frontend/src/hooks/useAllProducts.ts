import { useCallback } from 'react';
import { getProducts } from '../api/catalogueApi';
import { PAGE_SIZE } from '../constants/AppConstants';
import { useInfiniteProducts } from './useInfiniteProducts';

// Every product in the catalogue, loaded one page at a time (no search term, no category).
const ALL_PRODUCTS_KEY = 'all-products';

export const useAllProducts = () => {
  const fetchPage = useCallback(
    (page: number, signal: AbortSignal) => getProducts({ page, pageSize: PAGE_SIZE }, signal),
    [],
  );
  return useInfiniteProducts(fetchPage, ALL_PRODUCTS_KEY);
};
