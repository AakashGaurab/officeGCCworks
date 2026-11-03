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

  return (
    <>
      <ProductGrid products={products} />
      {isLoadingMore && <LoadingState />}
      {hasError && <ErrorState onRetry={onRetry} />}
      {canLoadMore && <div ref={sentinelRef} aria-hidden="true" />}
    </>
  );
};

export default InfiniteProductList;
