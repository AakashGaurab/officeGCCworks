import { describe, expect, it } from 'vitest';
import { searchByTitle } from '../src/application/searchByTitle.js';
import { buildProduct } from './helpers/buildProduct.js';

const products = [
  buildProduct({ id: 1, title: 'Red Backpack' }),
  buildProduct({ id: 2, title: 'Blue Shirt', description: 'backpack style' }),
];

describe('searchByTitle', () => {
  it('matches case-insensitively', () => {
    expect(searchByTitle(products, 'BACKPACK')).toEqual([products[0]]);
  });

  it('trims the search term', () => {
    expect(searchByTitle(products, '  shirt  ')).toEqual([products[1]]);
  });

  it('matches the title only, not the description', () => {
    expect(searchByTitle(products, 'style')).toEqual([]);
  });

  it.each([undefined, '', '   '])('does not filter when search is %j', (search) => {
    expect(searchByTitle(products, search)).toEqual(products);
  });
});
