import { useState } from 'react';
import { ProductText } from '../constants/Text';
import './ProductImage.css';

type ProductImageProps = {
  src: string;
  alt: string;
};

// Shows a placeholder instead of a broken-image icon when the picture cannot be loaded.
const ProductImage = ({ src, alt }: ProductImageProps) => {
  const [hasFailed, setHasFailed] = useState(false);

  const handleImageError = () => setHasFailed(true);

  if (hasFailed) {
    return (
      <div className="product-image-fallback" role="img" aria-label={alt}>
        {ProductText.IMAGE_UNAVAILABLE}
      </div>
    );
  }

  return <img className="product-image" src={src} alt={alt} loading="lazy" onError={handleImageError} />;
};

export default ProductImage;
