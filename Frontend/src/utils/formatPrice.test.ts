import { formatPrice } from './formatPrice';

describe('formatPrice', () => {
  it('formats a number as USD with two decimals', () => {
    expect(formatPrice(109.95)).toBe('$109.95');
  });

  it('adds missing decimals and thousands separators', () => {
    expect(formatPrice(1200)).toBe('$1,200.00');
  });
});
