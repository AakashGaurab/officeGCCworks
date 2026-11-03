import { useCallback } from 'react';
import { getCategoryProducts } from '../api/catalogueApi';
import { PAGE_SIZE } from '../constants/AppConstants';
import { useInfiniteProducts } from './useInfiniteProducts';

export const useCategoryProducts = (category: string) => {
  const fetchPage = useCallback(
    (page: number, signal: AbortSignal) =>
      getCategoryProducts(category, { page, pageSize: PAGE_SIZE }, signal),
    [category],
  );
  return useInfiniteProducts(fetchPage, category);
};
