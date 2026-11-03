import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CategoryLinks from './CategoryLinks';

const CATEGORIES = ["men's clothing", 'jewelery'];

const renderLinksAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <CategoryLinks categories={CATEGORIES} label="Categories" />
    </MemoryRouter>,
  );

describe('CategoryLinks', () => {
  it('marks the category being viewed as the current page', () => {
    renderLinksAt("/category/men's%20clothing");

    expect(screen.getByRole('link', { name: "men's clothing" })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: "men's clothing" })).toHaveClass('category-link-active');
    expect(screen.getByRole('link', { name: 'jewelery' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'All products' })).not.toHaveAttribute('aria-current');
  });

  it('marks All products as current on the home page only', () => {
    renderLinksAt('/');

    expect(screen.getByRole('link', { name: 'All products' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'jewelery' })).not.toHaveAttribute('aria-current');
  });

  it('does not mark All products as current on other pages', () => {
    renderLinksAt('/products/3');

    expect(screen.getByRole('link', { name: 'All products' })).not.toHaveAttribute('aria-current');
  });
});
