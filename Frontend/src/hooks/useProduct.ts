import { getProductById } from '../api/catalogueApi';
import { useFetch } from './useFetch';

export const useProduct = (id: number) =>
  useFetch((signal) => getProductById(id, signal), String(id));
