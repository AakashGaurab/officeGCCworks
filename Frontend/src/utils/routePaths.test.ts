import { buildCategoryPath, buildProductPath, buildSearchPath } from './routePaths';

describe('routePaths', () => {
  it('encodes spaces and apostrophes in category names', () => {
    expect(buildCategoryPath("men's clothing")).toBe("/category/men's%20clothing");
  });

  it('encodes characters that would break the path', () => {
    expect(buildCategoryPath('a/b?c')).toBe('/category/a%2Fb%3Fc');
  });

  it('builds a product path', () => {
    expect(buildProductPath(7)).toBe('/products/7');
  });

  it('encodes the search term in the query string', () => {
    expect(buildSearchPath('red & blue')).toBe('/search?q=red%20%26%20blue');
  });
});
