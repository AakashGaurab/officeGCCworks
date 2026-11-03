import { ApiError } from '../api/ApiError';
import { EnquiryErrorText } from '../constants/Text';
import { toSubmitErrorMessage } from './toSubmitErrorMessage';

describe('toSubmitErrorMessage', () => {
  it.each([
    [0, EnquiryErrorText.SUBMIT_NETWORK],
    [408, EnquiryErrorText.SUBMIT_TIMEOUT],
    [429, EnquiryErrorText.SUBMIT_RATE_LIMITED],
    [400, EnquiryErrorText.SUBMIT_INVALID],
    [500, EnquiryErrorText.SUBMIT_FAILED],
  ])('maps status %i to a friendly message', (status, expected) => {
    expect(toSubmitErrorMessage(new ApiError(status, 'CODE', 'raw'))).toBe(expected);
  });

  it('uses the generic message for unknown errors', () => {
    expect(toSubmitErrorMessage(new Error('boom'))).toBe(EnquiryErrorText.SUBMIT_FAILED);
  });
});
