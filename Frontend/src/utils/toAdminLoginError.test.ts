import { ApiError } from '../api/ApiError';
import { toAdminLoginError } from './toAdminLoginError';

describe('toAdminLoginError', () => {
  it.each([
    [401, 'That token is not correct.'],
    [429, 'Too many attempts. Try again in a minute.'],
    [404, 'Admin access is not enabled on this server.'],
    [500, 'We could not sign you in. Check your connection and try again.'],
    [0, 'We could not sign you in. Check your connection and try again.'],
  ])('maps status %i to a message', (status, message) => {
    expect(toAdminLoginError(new ApiError(status, 'CODE', 'text'))).toBe(message);
  });

  it('uses the general message for other errors', () => {
    expect(toAdminLoginError(new Error('boom'))).toContain('could not sign you in');
  });
});
