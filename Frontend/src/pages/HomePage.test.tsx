import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import * as catalogueApi from '../api/catalogueApi';
import { makePage, makeProducts } from '../test/fixtures';
import { installIntersectionObserver, triggerIntersection } from '../test/mockIntersectionObserver';
import HomePage from './HomePage';

vi.mock('../api/catalogueApi');

const FEATURED_IDS = [1, 2, 3, 4, 5];

const renderHome = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

const getSection = (name: string) => within(screen.getByRole('heading', { name }).closest('section') as HTMLElement);

describe('HomePage', () => {
  beforeEach(() => {
    installIntersectionObserver();
    vi.mocked(catalogueApi.getFeaturedProducts).mockResolvedValue(makeProducts(FEATURED_IDS));
    vi.mocked(catalogueApi.getProducts).mockResolvedValue(makePage([6, 7], false));
  });

  it('shows the 5 featured products without fetching categories again', async () => {
    renderHome();

    expect(await getSection('Top rated').findAllByRole('article')).toHaveLength(5);
    expect(catalogueApi.getCategories).not.toHaveBeenCalled();
  });

  it('shows all products below the top rated ones', async () => {
    renderHome();

    expect(await getSection('All products').findAllByRole('article')).toHaveLength(2);
    expect(catalogueApi.getProducts).toHaveBeenCalledWith({ page: 1, pageSize: 10 }, expect.any(AbortSignal));
  });

  it('loads the next page when scrolled to the end, then says the list is finished', async () => {
    vi.mocked(catalogueApi.getProducts)
      .mockResolvedValueOnce(makePage([6, 7], true))
      .mockResolvedValueOnce(makePage([8], false));
    renderHome();

    expect(await getSection('All products').findAllByRole('article')).toHaveLength(2);
    expect(screen.queryByText("You've reached the end of the list")).not.toBeInTheDocument();

    await triggerIntersection();

    expect(await screen.findByText('Product 8')).toBeInTheDocument();
    expect(getSection('All products').getAllByRole('article')).toHaveLength(3);
    expect(screen.getByText("You've reached the end of the list")).toBeInTheDocument();
  });

  it('shows an empty message when there are no products', async () => {
    vi.mocked(catalogueApi.getProducts).mockResolvedValue(makePage([], false));
    renderHome();

    expect(await screen.findByText('No products found')).toBeInTheDocument();
  });

  it('shows an error for the top rated section and recovers with Retry', async () => {
    vi.mocked(catalogueApi.getFeaturedProducts)
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValueOnce(makeProducts(FEATURED_IDS));
    renderHome();

    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(getSection('Top rated').getAllByRole('article')).toHaveLength(5));
  });

  it('shows an error for the all products list and recovers with Retry', async () => {
    vi.mocked(catalogueApi.getProducts)
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValueOnce(makePage([6, 7], false));
    renderHome();

    expect(await getSection('All products').findByRole('alert')).toHaveTextContent('Something went wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(getSection('All products').getAllByRole('article')).toHaveLength(2));
  });
});
