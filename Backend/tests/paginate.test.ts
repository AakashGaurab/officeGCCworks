import { describe, expect, it } from 'vitest';
import { paginate } from '../src/application/paginate.js';
import { MAX_PAGE_SIZE } from '../src/config/constants.js';

const numbers = Array.from({ length: 25 }, (_, index) => index + 1);

describe('paginate', () => {
  it('returns the first page with hasNextPage true', () => {
    const result = paginate(numbers, 1, 10);
    expect(result.items).toEqual(numbers.slice(0, 10));
    expect(result).toMatchObject({ page: 1, pageSize: 10, total: 25, hasNextPage: true });
  });

  it('returns a partial last page with hasNextPage false', () => {
    const result = paginate(numbers, 3, 10);
    expect(result.items).toEqual([21, 22, 23, 24, 25]);
    expect(result.hasNextPage).toBe(false);
  });

  it('reports hasNextPage false when the last page is exactly full', () => {
    expect(paginate(numbers.slice(0, 20), 2, 10).hasNextPage).toBe(false);
  });

  it('returns no items when the page is beyond the end', () => {
    const result = paginate(numbers, 99, 10);
    expect(result.items).toEqual([]);
    expect(result).toMatchObject({ total: 25, hasNextPage: false });
  });

  it('handles an empty list', () => {
    expect(paginate([], 1, 10)).toMatchObject({ items: [], total: 0, hasNextPage: false });
  });

  it('clamps pageSize to the maximum', () => {
    expect(paginate(numbers, 1, 1000).pageSize).toBe(MAX_PAGE_SIZE);
  });

  it('clamps pageSize and page to at least 1', () => {
    const result = paginate(numbers, 0, 0);
    expect(result).toMatchObject({ page: 1, pageSize: 1 });
    expect(result.items).toEqual([1]);
  });
});
