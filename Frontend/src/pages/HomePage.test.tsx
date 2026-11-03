import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import * as catalogueApi from '../api/catalogueApi';
import { makeProducts } from '../test/fixtures';
import HomePage from './HomePage';

vi.mock('../api/catalogueApi');

const renderHome = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

describe('HomePage', () => {
  it('shows the 5 featured products without fetching categories again', async () => {
    vi.mocked(catalogueApi.getFeaturedProducts).mockResolvedValue(makeProducts([1, 2, 3, 4, 5]));
    renderHome();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(await screen.findAllByRole('article')).toHaveLength(5);
    expect(screen.getByRole('heading', { name: 'Top rated' })).toBeInTheDocument();
    expect(catalogueApi.getCategories).not.toHaveBeenCalled();
  });

  it('shows an error and recovers with Retry', async () => {
    vi.mocked(catalogueApi.getFeaturedProducts)
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValueOnce(makeProducts([1, 2, 3, 4, 5]));
    renderHome();

    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(5));
  });
});
