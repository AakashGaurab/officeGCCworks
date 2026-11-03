import {
  ABORT_ERROR_NAME,
  DEFAULT_API_BASE_URL,
  HttpMethod,
  JSON_CONTENT_TYPE,
  JSON_CONTENT_TYPE_HEADER,
  NETWORK_ERROR_STATUS,
  POST_TIMEOUT_MS,
  TIMEOUT_ERROR_STATUS,
} from '../constants/AppConstants';
import { ApiErrorText } from '../constants/Text';
import { ApiError } from './ApiError';

type QueryParams = Record<string, string | number | undefined>;

type GetOptions = {
  params?: QueryParams;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

type PostOptions = {
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

const request = async <T>(url: string, init: RequestInit): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    // Aborts are expected (navigation); let callers see them untouched so they can ignore them.
    if (isAbortError(error)) throw error;
    throw new ApiError(NETWORK_ERROR_STATUS, ApiErrorText.NETWORK_CODE, ApiErrorText.NETWORK);
  }
  if (!response.ok) throw await toApiError(response);
  return (await response.json()) as T;
};

export const apiGet = <T>(path: string, { params, headers, signal }: GetOptions = {}): Promise<T> =>
  request<T>(`${API_BASE_URL}${path}${buildQueryString(params)}`, { headers, signal });

// Cancels the request after POST_TIMEOUT_MS, or earlier when the caller's signal aborts.
// A timeout becomes a friendly ApiError; a caller abort stays an AbortError so callers can ignore it.
export const apiPost = async <T>(path: string, body: unknown, { signal }: PostOptions = {}): Promise<T> => {
  const controller = new AbortController();
  let isTimedOut = false;
  const timeoutId = setTimeout(() => {
    isTimedOut = true;
    controller.abort();
  }, POST_TIMEOUT_MS);
  const handleCallerAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', handleCallerAbort);

  try {
    return await request<T>(`${API_BASE_URL}${path}`, {
      method: HttpMethod.POST,
      headers: { [JSON_CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (isTimedOut) throw new ApiError(TIMEOUT_ERROR_STATUS, ApiErrorText.TIMEOUT_CODE, ApiErrorText.TIMEOUT);
    throw error;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', handleCallerAbort);
  }
};
