import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from './Header';
import { MemoryRouter } from 'react-router-dom';

const renderHeader = (onSearch = vi.fn(), hasCategoriesError = false, onCategoriesRetry = vi.fn()) => {
  render(
    <MemoryRouter>
      <Header
        categories={["men's clothing"]}
        searchTerm=""
        onSearch={onSearch}
        hasCategoriesError={hasCategoriesError}
        onCategoriesRetry={onCategoriesRetry}
      />
    </MemoryRouter>,
  );
  return onSearch;
};

describe('Header search', () => {
  it('submits the trimmed term when clicking Search', async () => {
    const onSearch = renderHeader();

    await userEvent.type(screen.getByLabelText('Search products'), '  backpack ');
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(onSearch).toHaveBeenCalledWith('backpack');
  });

  it('submits when pressing Enter', async () => {
    const onSearch = renderHeader();

    await userEvent.type(screen.getByLabelText('Search products'), 'ring{Enter}');

    expect(onSearch).toHaveBeenCalledWith('ring');
  });

  it('ignores empty and whitespace-only input', async () => {
    const onSearch = renderHeader();

    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    await userEvent.type(screen.getByLabelText('Search products'), '   {Enter}');

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('links to categories with an encoded URL', () => {
    renderHeader();

    expect(screen.getByRole('link', { name: "men's clothing" })).toHaveAttribute(
      'href',
      "/category/men's%20clothing",
    );
  });
});

describe('Header categories error', () => {
  it('shows no retry when categories loaded', () => {
    renderHeader();

    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });

  it('shows an inline Retry that calls onCategoriesRetry', async () => {
    const onCategoriesRetry = vi.fn();
    renderHeader(vi.fn(), true, onCategoriesRetry);

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(onCategoriesRetry).toHaveBeenCalledTimes(1);
  });
});
