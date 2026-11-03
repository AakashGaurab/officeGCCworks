import { Link } from 'react-router-dom';
import type { Product } from '../types/Product';
import { formatPrice } from '../utils/formatPrice';
import { buildProductPath } from '../utils/routePaths';
import ProductImage from './ProductImage';
import StarRating from './StarRating';
import './ProductCard.css';

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product }: ProductCardProps) => (
  <article className="product-card">
    <Link className="product-card-link" to={buildProductPath(product.id)}>
      <ProductImage src={product.imageUrl} alt={product.title} />
      <h3 className="product-card-title">{product.title}</h3>
    </Link>
    <p className="product-card-price">{formatPrice(product.price)}</p>
    <StarRating rating={product.rating} />
  </article>
);

export default ProductCard;
