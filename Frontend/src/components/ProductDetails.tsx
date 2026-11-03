import { Link } from 'react-router-dom';
import { ProductText } from '../constants/Text';
import type { Product } from '../types/Product';
import { formatPrice } from '../utils/formatPrice';
import { buildCategoryPath } from '../utils/routePaths';
import EnquirySection from './EnquirySection';
import PageTitle from './PageTitle';
import ProductImage from './ProductImage';
import StarRating from './StarRating';
import './ProductDetails.css';

type ProductDetailsProps = {
  product: Product;
};

const ProductDetails = ({ product }: ProductDetailsProps) => (
  <>
    <Link className="back-link" to={buildCategoryPath(product.category)}>
      &larr; {ProductText.BACK_TO} <span className="text-capitalize">{product.category}</span>
    </Link>
    <article className="product-details">
      <div className="product-details-image">
        <ProductImage src={product.imageUrl} alt={product.title} />
      </div>
      <div className="product-details-info">
        <PageTitle title={product.title} />
        <p className="product-details-category">
          {ProductText.CATEGORY}: {product.category}
        </p>
        <p className="product-details-price">{formatPrice(product.price)}</p>
        <StarRating rating={product.rating} />
        <h2>{ProductText.DESCRIPTION}</h2>
        <p>{product.description}</p>
        <EnquirySection product={product} />
      </div>
    </article>
  </>
);

export default ProductDetails;
