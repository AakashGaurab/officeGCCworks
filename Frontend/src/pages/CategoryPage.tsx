import { useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import InfiniteProductList from '../components/InfiniteProductList';
import LoadingState from '../components/LoadingState';
import PageTitle from '../components/PageTitle';
import ProductGrid from '../components/ProductGrid';
import { CategoryText, EmptyText } from '../constants/Text';
import { RouteParam } from '../constants/Routes';
import { useCategoryProducts } from '../hooks/useCategoryProducts';
import { isMissingResourceError } from '../utils/isMissingResourceError';
import { buildMoreInTitle, buildTopRatedTitle } from '../utils/sentences';

const CategoryPage = () => {
  // React Router already decodes the URL segment, e.g. "men%27s%20clothing" -> "men's clothing".
  const category = useParams()[RouteParam.CATEGORY] ?? '';
  const products = useCategoryProducts(category);
  const topRated = products.firstPage?.topRated ?? [];

  const renderContent = () => {
    if (products.isLoading) return <LoadingState />;
    if (products.isFirstLoadFailed && isMissingResourceError(products.error)) {
      return <EmptyState title={CategoryText.NOT_FOUND_TITLE} message={CategoryText.NOT_FOUND_MESSAGE} />;
    }
    if (products.isFirstLoadFailed) return <ErrorState onRetry={products.retry} />;
    if (topRated.length === 0 && products.items.length === 0) {
      return <EmptyState title={EmptyText.NO_PRODUCTS_TITLE} message={EmptyText.NO_PRODUCTS_MESSAGE} />;
    }
    return (
      <>
        <section className="page-section">
          <h2>{buildTopRatedTitle(category)}</h2>
          <ProductGrid products={topRated} />
        </section>
        {products.items.length > 0 && (
          <section className="page-section">
            <h2>{buildMoreInTitle(category)}</h2>
            <InfiniteProductList
              products={products.items}
              isLoadingMore={products.isLoadingMore}
              hasNextPage={products.hasNextPage}
              hasError={products.error !== null}
              onLoadMore={products.loadMore}
              onRetry={products.retry}
            />
          </section>
        )}
      </>
    );
  };

  return (
    <>
      <PageTitle title={category} />
      {renderContent()}
    </>
  );
};

export default CategoryPage;
