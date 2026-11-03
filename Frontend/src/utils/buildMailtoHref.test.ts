import { buildMailtoHref } from './buildMailtoHref';

describe('buildMailtoHref', () => {
  it('encodes the address', () => {
    expect(buildMailtoHref('ada@example.com')).toBe('mailto:ada%40example.com');
  });

  it('cannot add extra mailto fields', () => {
    expect(buildMailtoHref('a@b.com?bcc=spy@evil.com&body=x')).not.toMatch(/[?&]/);
  });
});
