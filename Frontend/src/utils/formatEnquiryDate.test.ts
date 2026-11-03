import { formatEnquiryDate } from './formatEnquiryDate';

describe('formatEnquiryDate', () => {
  it('formats a valid timestamp with date and time', () => {
    const formatted = formatEnquiryDate('2026-03-01T10:30:00.000Z');

    expect(formatted).toContain('2026');
    expect(formatted).toMatch(/\d{1,2}:\d{2}/);
  });

  it('returns an unreadable value unchanged', () => {
    expect(formatEnquiryDate('not a date')).toBe('not a date');
  });
});
