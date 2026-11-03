import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import PageTitle from '../components/PageTitle';
import ProductGrid from '../components/ProductGrid';
import { HomeText } from '../constants/Text';
import { useFeaturedProducts } from '../hooks/useFeaturedProducts';

const HomePage = () => {
  const featured = useFeaturedProducts();

  const renderFeaturedProducts = () => {
    if (featured.isLoading) return <LoadingState />;
    if (featured.error) return <ErrorState onRetry={featured.retry} />;
    return <ProductGrid products={featured.data ?? []} />;
  };

  return (
    <>
      <PageTitle title={HomeText.PAGE_TITLE} />
      <section className="page-section">
        <h2>{HomeText.TOP_RATED}</h2>
        {renderFeaturedProducts()}
      </section>
    </>
  );
};

export default HomePage;
