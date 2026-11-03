import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import * as catalogueApi from '../api/catalogueApi';
import * as enquiryApi from '../api/enquiryApi';
import { ApiError } from '../api/ApiError';
import { RoutePath } from '../constants/Routes';
import { makeProduct } from '../test/fixtures';
import { renderAtRoute } from '../test/renderWithRouter';
import ProductPage from './ProductPage';

vi.mock('../api/catalogueApi');
vi.mock('../api/enquiryApi');

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

  it('lets the customer enquire about the product and shows a thank you', async () => {
    vi.mocked(catalogueApi.getProductById).mockResolvedValue(makeProduct(7));
    vi.mocked(enquiryApi.submitEnquiry).mockResolvedValue({ id: 'abc', status: 'received' });
    const user = userEvent.setup();
    renderProduct();

    await user.click(await screen.findByRole('button', { name: 'Enquire' }));
    expect(screen.getByRole('heading', { name: 'Enquire about Product 7' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Name'), 'Ada');
    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Message'), 'Hello');
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));

    expect(await screen.findByRole('heading', { name: 'Thank you' })).toBeInTheDocument();
    expect(enquiryApi.submitEnquiry).toHaveBeenCalledWith(7, expect.anything(), expect.anything());
  });

  it('does not carry a typed enquiry over to the next product', async () => {
    vi.mocked(catalogueApi.getProductById).mockImplementation((id) => Promise.resolve(makeProduct(id)));
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/products/7']}>
        <Link to="/products/8">Next product</Link>
        <Routes>
          <Route path={RoutePath.PRODUCT} element={<ProductPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole('button', { name: 'Enquire' }));
    await user.type(screen.getByLabelText('Name'), 'Ada');
    await user.click(screen.getByRole('link', { name: 'Next product' }));
    await screen.findByRole('heading', { name: 'Product 8' });

    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Enquire' }));
    expect(screen.getByLabelText('Name')).toHaveValue('');
  });
});
