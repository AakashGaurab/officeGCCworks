import { ADMIN_TOKEN_STORAGE_KEY } from '../constants/AppConstants';

// sessionStorage is cleared when the tab closes. It can throw (blocked by the browser, private mode,
// quota), and the admin page must still work, so every access is guarded.
export const readStoredToken = (): string | null => {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const storeToken = (token: string): void => {
  try {
    sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
  } catch {
    // Not persisted: the token stays in memory for this page view only.
  }
};

export const clearStoredToken = (): void => {
  try {
    sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch {
    // Nothing stored that we could remove.
  }
};
