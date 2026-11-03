import { ProductText } from '../constants/Text';
import type { Product } from '../types/Product';
import { formatPrice } from '../utils/formatPrice';
import PageTitle from './PageTitle';
import ProductImage from './ProductImage';
import StarRating from './StarRating';
import './ProductDetails.css';

type ProductDetailsProps = {
  product: Product;
};

const ProductDetails = ({ product }: ProductDetailsProps) => (
  <article className="product-details">
    <div className="product-details-image">
      <ProductImage src={product.imageUrl} alt={product.title} />
    </div>
    <div>
      <PageTitle title={product.title} />
      <p className="product-details-category">
        {ProductText.CATEGORY}: {product.category}
      </p>
      <p className="product-details-price">{formatPrice(product.price)}</p>
      <StarRating rating={product.rating} />
      <h2>{ProductText.DESCRIPTION}</h2>
      <p>{product.description}</p>
      {/* The Enquire action will be added here in a later change. */}
    </div>
  </article>
);

export default ProductDetails;
