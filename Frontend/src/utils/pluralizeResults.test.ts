import { describeResultCount } from './pluralizeResults';

describe('describeResultCount', () => {
  it('uses the singular for one result', () => {
    expect(describeResultCount(1)).toBe('1 result');
  });

  it('uses the plural otherwise', () => {
    expect(describeResultCount(12)).toBe('12 results');
  });
});
