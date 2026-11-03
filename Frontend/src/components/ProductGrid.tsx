import type { Product } from '../types/Product';
import ProductCard from './ProductCard';
import './ProductGrid.css';

type ProductGridProps = {
  products: Product[];
};

const ProductGrid = ({ products }: ProductGridProps) => {
  const renderProduct = (product: Product) => (
    <li key={product.id}>
      <ProductCard product={product} />
    </li>
  );

  return <ul className="product-grid">{products.map(renderProduct)}</ul>;
};

export default ProductGrid;
