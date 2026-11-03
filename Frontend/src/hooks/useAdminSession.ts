import { useCallback, useState } from 'react';
import { listEnquiries } from '../api/adminApi';
import { ADMIN_VERIFY_PAGE_SIZE, FIRST_PAGE } from '../constants/AppConstants';
import { AdminLoginErrorText } from '../constants/Text';
import { clearStoredToken, readStoredToken, storeToken } from '../utils/adminTokenStorage';
import { toAdminLoginError } from '../utils/toAdminLoginError';
import { toError } from '../utils/toError';

// Holds the admin token in memory and in sessionStorage (so a reload keeps the session until the tab closes).
// Signing in asks the API for one enquiry: only a token the server accepts is kept.
export const useAdminSession = () => {
  const [token, setToken] = useState<string | null>(readStoredToken);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const signIn = useCallback(async (candidate: string) => {
    const trimmedToken = candidate.trim();
    setNotice(null);
    if (!trimmedToken) {
      setLoginError(AdminLoginErrorText.TOKEN_REQUIRED);
      return;
    }
    setLoginError(null);
    setIsSigningIn(true);
    try {
      await listEnquiries(trimmedToken, { page: FIRST_PAGE, pageSize: ADMIN_VERIFY_PAGE_SIZE });
      storeToken(trimmedToken);
      setToken(trimmedToken);
    } catch (error) {
      setLoginError(toAdminLoginError(toError(error)));
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const endSession = useCallback((sessionNotice: string | null) => {
    clearStoredToken();
    setToken(null);
    setLoginError(null);
    setNotice(sessionNotice);
  }, []);

  const signOut = useCallback(() => endSession(null), [endSession]);

  // Called when the API rejects the token during a session (it was changed on the server).
  const expireSession = useCallback(() => endSession(AdminLoginErrorText.SESSION_EXPIRED), [endSession]);

  return { token, loginError, notice, isSigningIn, signIn, signOut, expireSession };
};
