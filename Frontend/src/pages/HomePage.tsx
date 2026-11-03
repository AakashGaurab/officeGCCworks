import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import InfiniteProductList from '../components/InfiniteProductList';
import LoadingState from '../components/LoadingState';
import PageTitle from '../components/PageTitle';
import ProductGrid from '../components/ProductGrid';
import { EmptyText, HomeText } from '../constants/Text';
import { useAllProducts } from '../hooks/useAllProducts';
import { useFeaturedProducts } from '../hooks/useFeaturedProducts';

const HomePage = () => {
  const featured = useFeaturedProducts();
  const allProducts = useAllProducts();

  const renderFeaturedProducts = () => {
    if (featured.isLoading) return <LoadingState />;
    if (featured.error) return <ErrorState onRetry={featured.retry} />;
    return <ProductGrid products={featured.data ?? []} />;
  };

  const renderAllProducts = () => {
    if (allProducts.isLoading) return <LoadingState />;
    if (allProducts.isFirstLoadFailed) return <ErrorState onRetry={allProducts.retry} />;
    if (allProducts.items.length === 0) {
      return <EmptyState title={EmptyText.NO_PRODUCTS_TITLE} message={EmptyText.NO_PRODUCTS_MESSAGE} />;
    }
    return (
      <InfiniteProductList
        products={allProducts.items}
        isLoadingMore={allProducts.isLoadingMore}
        hasNextPage={allProducts.hasNextPage}
        hasError={allProducts.error !== null}
        onLoadMore={allProducts.loadMore}
        onRetry={allProducts.retry}
      />
    );
  };

  return (
    <>
      <section className="home-hero">
        <PageTitle title={HomeText.PAGE_TITLE} />
        <p className="home-hero-intro">{HomeText.INTRO}</p>
      </section>
      <section className="page-section">
        <h2>{HomeText.TOP_RATED}</h2>
        {renderFeaturedProducts()}
      </section>
      <section className="page-section">
        <h2>{HomeText.ALL_PRODUCTS}</h2>
        {renderAllProducts()}
      </section>
    </>
  );
};

export default HomePage;
