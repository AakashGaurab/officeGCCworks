import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import PageTitle from '../components/PageTitle';
import ProductDetails from '../components/ProductDetails';
import { CommonText, ProductText } from '../constants/Text';
import { RouteParam, RoutePath } from '../constants/Routes';
import { useProduct } from '../hooks/useProduct';
import { isMissingResourceError } from '../utils/isMissingResourceError';

const ProductPage = () => {
  const id = Number(useParams()[RouteParam.PRODUCT_ID]);
  const { data: product, isLoading, error, retry } = useProduct(id);

  // Loaded products render their own h1 (the product title); every other state gets a generic one.
  const renderStateContent = () => {
    if (isLoading) return <LoadingState />;
    if (isMissingResourceError(error)) {
      return (
        <EmptyState title={ProductText.NOT_FOUND_TITLE} message={ProductText.NOT_FOUND_MESSAGE}>
          <Link to={RoutePath.HOME}>{CommonText.BACK_TO_HOME}</Link>
        </EmptyState>
      );
    }
    return <ErrorState onRetry={retry} />;
  };

  // key: a new product gets a fresh component tree, so enquiry form state cannot leak between products.
  if (product) return <ProductDetails key={product.id} product={product} />;

  return (
    <>
      <PageTitle title={ProductText.PAGE_TITLE} />
      {renderStateContent()}
    </>
  );
};

export default ProductPage;
