import { spokenRating } from './spokenRating';

describe('spokenRating', () => {
  it('builds one full sentence', () => {
    expect(spokenRating({ rate: 4.5, count: 100 })).toBe('Rated 4.5 out of 5, 100 reviews');
  });
});
