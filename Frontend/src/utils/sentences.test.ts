import { buildDocumentTitle, buildMoreInTitle, buildResultsForTitle, buildTopRatedTitle } from './sentences';

describe('sentences', () => {
  it('builds the category headings', () => {
    expect(buildTopRatedTitle('jewelery')).toBe('Top rated in jewelery');
    expect(buildMoreInTitle('jewelery')).toBe('More in jewelery');
  });

  it('quotes the search term', () => {
    expect(buildResultsForTitle('ring')).toBe('Results for "ring"');
  });

  it('appends the app name to the document title', () => {
    expect(buildDocumentTitle('Welcome')).toBe('Welcome | Product Catalogue');
  });
});
