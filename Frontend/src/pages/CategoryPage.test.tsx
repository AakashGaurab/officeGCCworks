import { screen } from '@testing-library/react';
import * as catalogueApi from '../api/catalogueApi';
import { ApiError } from '../api/ApiError';
import { RoutePath } from '../constants/Routes';
import { makeCategoryListing } from '../test/fixtures';
import { installIntersectionObserver, triggerIntersection } from '../test/mockIntersectionObserver';
import { renderAtRoute } from '../test/renderWithRouter';
import CategoryPage from './CategoryPage';

vi.mock('../api/catalogueApi');

const renderCategory = () => renderAtRoute(<CategoryPage />, RoutePath.CATEGORY, "/category/men's%20clothing");

describe('CategoryPage', () => {
  beforeEach(installIntersectionObserver);

  it('shows top rated first, then more with the next page on scroll', async () => {
    vi.mocked(catalogueApi.getCategoryProducts)
      .mockResolvedValueOnce(makeCategoryListing([1, 2], [3, 4], true))
      .mockResolvedValueOnce(makeCategoryListing([1, 2], [5], false));
    renderCategory();

    expect(await screen.findByRole('heading', { name: "Top rated in men's clothing" })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: "More in men's clothing" })).toBeInTheDocument();
    expect(catalogueApi.getCategoryProducts).toHaveBeenCalledWith(
      "men's clothing",
      { page: 1, pageSize: 10 },
      expect.any(AbortSignal),
    );
    expect(screen.getAllByRole('article')).toHaveLength(4);

    await triggerIntersection();
    expect(await screen.findByText('Product 5')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
  });

  it('shows a friendly message for an unknown category', async () => {
    vi.mocked(catalogueApi.getCategoryProducts).mockRejectedValue(new ApiError(404, 'NOT_FOUND', 'x'));
    renderCategory();

    expect(await screen.findByText('Category not found')).toBeInTheDocument();
  });

  it('shows an error state when the API fails', async () => {
    vi.mocked(catalogueApi.getCategoryProducts).mockRejectedValue(new ApiError(502, 'UPSTREAM_ERROR', 'x'));
    renderCategory();

    expect(await screen.findByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
