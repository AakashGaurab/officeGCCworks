import { describe, expect, it } from 'vitest';
import { getTopRated } from '../src/application/getTopRated.js';
import { sortByRating } from '../src/application/sortByRating.js';
import { buildProduct } from './helpers/buildProduct.js';

const withRating = (id: number, rate: number, count: number) =>
  buildProduct({ id, rating: { rate, count } });

const idsOf = (products: { id: number }[]) => products.map((product) => product.id);

describe('sortByRating', () => {
  it('sorts by rate descending', () => {
    const sorted = sortByRating([withRating(1, 3, 1), withRating(2, 5, 1), withRating(3, 4, 1)]);
    expect(idsOf(sorted)).toEqual([2, 3, 1]);
  });

  it('breaks rate ties by count descending', () => {
    const sorted = sortByRating([withRating(1, 4, 10), withRating(2, 4, 50)]);
    expect(idsOf(sorted)).toEqual([2, 1]);
  });

  it('breaks full ties by id ascending', () => {
    const sorted = sortByRating([withRating(9, 4, 10), withRating(2, 4, 10)]);
    expect(idsOf(sorted)).toEqual([2, 9]);
  });

  it('does not mutate the input', () => {
    const input = [withRating(1, 1, 1), withRating(2, 5, 1)];
    sortByRating(input);
    expect(idsOf(input)).toEqual([1, 2]);
  });
});

describe('getTopRated', () => {
  it('returns only the requested number of products', () => {
    const products = [withRating(1, 1, 1), withRating(2, 2, 1), withRating(3, 3, 1)];
    expect(idsOf(getTopRated(products, 2))).toEqual([3, 2]);
  });

  it('returns everything when there are fewer products than requested', () => {
    expect(getTopRated([withRating(1, 1, 1)], 5)).toHaveLength(1);
  });
});
