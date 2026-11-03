import { MAILTO_PREFIX } from '../constants/AppConstants';

// The email is customer input, so it is encoded: characters like "?" or "&" cannot add mailto fields.
export const buildMailtoHref = (email: string): string => `${MAILTO_PREFIX}${encodeURIComponent(email)}`;
