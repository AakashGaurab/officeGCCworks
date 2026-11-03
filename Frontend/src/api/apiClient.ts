import { ABORT_ERROR_NAME, DEFAULT_API_BASE_URL, NETWORK_ERROR_STATUS } from '../constants/AppConstants';
import { ApiErrorText } from '../constants/Text';
import { ApiError } from './ApiError';

type QueryParams = Record<string, string | number | undefined>;

type GetOptions = {
  params?: QueryParams;
  signal?: AbortSignal;
};

type ErrorBody = { error?: { code?: string; message?: string } };

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

const buildQueryString = (params: QueryParams = {}): string => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value));
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

const toApiError = async (response: Response): Promise<ApiError> => {
  const body: ErrorBody | null = await response.json().catch(() => null);
  return new ApiError(
    response.status,
    body?.error?.code ?? ApiErrorText.UNKNOWN_CODE,
    body?.error?.message ?? ApiErrorText.UNKNOWN,
  );
};

const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === ABORT_ERROR_NAME;

export const apiGet = async <T>(path: string, { params, signal }: GetOptions = {}): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}${buildQueryString(params)}`, { signal });
  } catch (error) {
    // Aborts are expected (navigation); let callers see them untouched so they can ignore them.
    if (isAbortError(error)) throw error;
    throw new ApiError(NETWORK_ERROR_STATUS, ApiErrorText.NETWORK_CODE, ApiErrorText.NETWORK);
  }
  if (!response.ok) throw await toApiError(response);
  return (await response.json()) as T;
};
