import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

const BrokenComponent = () => {
  throw new Error('render failure');
};

describe('ErrorBoundary', () => {
  it('shows a friendly message instead of a blank page', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  });
});
