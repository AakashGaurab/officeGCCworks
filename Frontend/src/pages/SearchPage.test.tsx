import { screen } from '@testing-library/react';
import * as catalogueApi from '../api/catalogueApi';
import { RoutePath } from '../constants/Routes';
import { makePage } from '../test/fixtures';
import { installIntersectionObserver } from '../test/mockIntersectionObserver';
import { renderAtRoute } from '../test/renderWithRouter';
import SearchPage from './SearchPage';

vi.mock('../api/catalogueApi');

const renderSearch = (term: string) => renderAtRoute(<SearchPage />, RoutePath.SEARCH, `/search?q=${term}`);

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    installIntersectionObserver();
  });

  it('shows the result count and the matching products', async () => {
    vi.mocked(catalogueApi.getProducts).mockResolvedValue(makePage([1, 2, 3], false, 3));
    renderSearch('shirt');

    expect(await screen.findByRole('heading', { level: 2, name: '3 results' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(catalogueApi.getProducts).toHaveBeenCalledWith(
      { search: 'shirt', page: 1, pageSize: 10 },
      expect.any(AbortSignal),
    );
  });

  it('shows the empty state when nothing matches', async () => {
    vi.mocked(catalogueApi.getProducts).mockResolvedValue(makePage([], false));
    renderSearch('zzz');

    expect(await screen.findByText('No products found')).toBeInTheDocument();
  });

  it.each([['no term', ''], ['a blank term', '%20%20']])('does not call the API for %s', (_name, term) => {
    renderSearch(term);

    expect(screen.getByRole('heading', { level: 1, name: 'Search our catalogue' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(catalogueApi.getProducts).not.toHaveBeenCalled();
  });
});
