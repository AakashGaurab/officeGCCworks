import { LINE_BREAK_PATTERN_GLOBAL } from '../config/constants.js';

// Header injection defence: a CR/LF inside a header value would let an attacker start new headers
// (for example a hidden Bcc). Line breaks become single spaces.
export const sanitizeHeaderValue = (value: string): string =>
  value.replace(LINE_BREAK_PATTERN_GLOBAL, ' ').trim();
