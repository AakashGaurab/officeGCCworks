import { getCategories } from '../api/catalogueApi';
import { QueryKey } from '../constants/AppConstants';
import { useFetch } from './useFetch';

export const useCategories = () => useFetch(getCategories, QueryKey.CATEGORIES);
