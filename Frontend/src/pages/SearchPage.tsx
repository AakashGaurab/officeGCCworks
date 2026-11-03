import { useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import InfiniteProductList from '../components/InfiniteProductList';
import LoadingState from '../components/LoadingState';
import PageTitle from '../components/PageTitle';
import { EmptyText, SearchText } from '../constants/Text';
import { SearchQueryKey } from '../constants/Routes';
import { useSearchProducts } from '../hooks/useSearchProducts';
import { describeResultCount } from '../utils/pluralizeResults';
import { buildResultsForTitle } from '../utils/sentences';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const term = searchParams.get(SearchQueryKey.TERM)?.trim() ?? '';
  const hasTerm = term !== '';
  // Without a term there is nothing to search for, so the hook must not call the API.
  const products = useSearchProducts(term, hasTerm);

  const renderContent = () => {
    if (!hasTerm) return <p>{SearchText.NO_TERM_MESSAGE}</p>;
    if (products.isLoading) return <LoadingState />;
    if (products.isFirstLoadFailed) return <ErrorState onRetry={products.retry} />;
    if (products.items.length === 0) {
      return <EmptyState title={EmptyText.NO_PRODUCTS_TITLE} message={EmptyText.NO_PRODUCTS_MESSAGE} />;
    }
    return (
      <>
        <h2>{describeResultCount(products.firstPage?.total ?? products.items.length)}</h2>
        <InfiniteProductList
          products={products.items}
          isLoadingMore={products.isLoadingMore}
          hasNextPage={products.hasNextPage}
          hasError={products.error !== null}
          onLoadMore={products.loadMore}
          onRetry={products.retry}
        />
      </>
    );
  };

  return (
    <>
      <PageTitle title={hasTerm ? buildResultsForTitle(term) : SearchText.NO_TERM_TITLE} />
      {renderContent()}
    </>
  );
};

export default SearchPage;
