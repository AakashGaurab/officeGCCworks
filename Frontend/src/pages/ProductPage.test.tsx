import { screen } from '@testing-library/react';
import * as catalogueApi from '../api/catalogueApi';
import { ApiError } from '../api/ApiError';
import { RoutePath } from '../constants/Routes';
import { makeProduct } from '../test/fixtures';
import { renderAtRoute } from '../test/renderWithRouter';
import ProductPage from './ProductPage';

vi.mock('../api/catalogueApi');

const renderProduct = () => renderAtRoute(<ProductPage />, RoutePath.PRODUCT, '/products/7');

describe('ProductPage', () => {
  it('shows the product details', async () => {
    vi.mocked(catalogueApi.getProductById).mockResolvedValue(makeProduct(7, { price: 109.95 }));
    renderProduct();

    expect(await screen.findByRole('heading', { name: 'Product 7' })).toBeInTheDocument();
    expect(screen.getByText('$109.95')).toBeInTheDocument();
    expect(screen.getByText('Description 7')).toBeInTheDocument();
    expect(screen.getByAltText('Product 7')).toBeInTheDocument();
    expect(screen.getByLabelText(/Rated 4.5 out of 5, 100 reviews/)).toBeInTheDocument();
  });

  it('shows a heading while loading', () => {
    vi.mocked(catalogueApi.getProductById).mockReturnValue(new Promise(() => {}));
    renderProduct();

    expect(screen.getByRole('heading', { level: 1, name: 'Product' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows the not found state on a 404', async () => {
    vi.mocked(catalogueApi.getProductById).mockRejectedValue(new ApiError(404, 'NOT_FOUND', 'x'));
    renderProduct();

    expect(await screen.findByText('Product not found')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Product' })).toBeInTheDocument();
  });

  it('shows an error with Retry on other failures', async () => {
    vi.mocked(catalogueApi.getProductById).mockRejectedValue(new ApiError(502, 'UPSTREAM_ERROR', 'x'));
    renderProduct();

    expect(await screen.findByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Product' })).toBeInTheDocument();
  });
});
