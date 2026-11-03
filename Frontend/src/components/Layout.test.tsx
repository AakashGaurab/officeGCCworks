import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import * as catalogueApi from '../api/catalogueApi';
import Layout from './Layout';

vi.mock('../api/catalogueApi');

const LocationProbe = () => {
  const location = useLocation();
  return <p data-testid="location">{`${location.pathname}${location.search}`}</p>;
};

const renderLayout = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="*" element={<LocationProbe />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(catalogueApi.getCategories).mockResolvedValue(['jewelery']);
  });

  it('navigates to the search page when the header search is submitted', async () => {
    renderLayout();

    await userEvent.type(screen.getByLabelText('Search products'), 'red shirt{Enter}');

    expect(screen.getByTestId('location')).toHaveTextContent('/search?q=red%20shirt');
  });

  it('offers Retry when categories fail and shows the links after it works', async () => {
    vi.mocked(catalogueApi.getCategories).mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce(['jewelery']);
    renderLayout();

    await userEvent.click(await screen.findByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('link', { name: 'jewelery' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(catalogueApi.getCategories).toHaveBeenCalledTimes(2);
  });
});
