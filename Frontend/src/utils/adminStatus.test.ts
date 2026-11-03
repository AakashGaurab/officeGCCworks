import { EnquiryStatus } from '../constants/AppConstants';
import { buildTabLabel, getTabCount } from './adminStatus';

const COUNTS = { pending: 1, sent: 5, failed: 2 };

describe('getTabCount', () => {
  it('returns the count of one status', () => {
    expect(getTabCount(COUNTS, EnquiryStatus.SENT)).toBe(5);
  });

  it('sums all statuses for the All tab', () => {
    expect(getTabCount(COUNTS, undefined)).toBe(8);
  });

  it('returns null while the counts are not loaded', () => {
    expect(getTabCount(null, undefined)).toBeNull();
  });
});

describe('buildTabLabel', () => {
  it('appends the count when known', () => {
    expect(buildTabLabel('Sent', 3)).toBe('Sent (3)');
    expect(buildTabLabel('Sent', 0)).toBe('Sent (0)');
    expect(buildTabLabel('Sent', null)).toBe('Sent');
  });
});
