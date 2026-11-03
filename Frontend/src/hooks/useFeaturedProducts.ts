import { getFeaturedProducts } from '../api/catalogueApi';
import { QueryKey } from '../constants/AppConstants';
import { useFetch } from './useFetch';

export const useFeaturedProducts = () => useFetch(getFeaturedProducts, QueryKey.FEATURED);
