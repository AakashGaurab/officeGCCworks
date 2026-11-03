import { fireEvent, render, screen } from '@testing-library/react';
import ProductImage from './ProductImage';

describe('ProductImage', () => {
  it('falls back to a placeholder with the same accessible name when the image fails', () => {
    render(<ProductImage src="broken.png" alt="Backpack" />);

    fireEvent.error(screen.getByAltText('Backpack'));

    expect(screen.getByRole('img', { name: 'Backpack' })).toHaveTextContent('Image unavailable');
  });
});
