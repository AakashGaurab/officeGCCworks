import { ListText } from '../constants/Text';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import type { Product } from '../types/Product';
import ErrorState from './ErrorState';
import LoadingState from './LoadingState';
import ProductGrid from './ProductGrid';

type InfiniteProductListProps = {
  products: Product[];
  isLoadingMore: boolean;
  hasNextPage: boolean;
  hasError: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
};

// Grid plus the invisible sentinel that triggers loading the next page when it scrolls into view.
const InfiniteProductList = ({
  products,
  isLoadingMore,
  hasNextPage,
  hasError,
  onLoadMore,
  onRetry,
}: InfiniteProductListProps) => {
  const canLoadMore = hasNextPage && !isLoadingMore && !hasError;
  const sentinelRef = useInfiniteScroll(onLoadMore, canLoadMore);
  // Tell the visitor the list is finished, so a list that stops growing does not look broken.
  const isEndOfList = !hasNextPage && !isLoadingMore && !hasError && products.length > 0;

  return (
    <>
      <ProductGrid products={products} />
      {isLoadingMore && <LoadingState />}
      {hasError && <ErrorState onRetry={onRetry} />}
      {canLoadMore && <div ref={sentinelRef} aria-hidden="true" />}
      {isEndOfList && <p className="list-end-message">{ListText.END_OF_LIST}</p>}
    </>
  );
};

export default InfiniteProductList;
