import { useEffect, useRef } from 'react';
import { INTERSECTION_ROOT_MARGIN } from '../constants/AppConstants';

// Attach the returned ref to an element at the end of the list; onReachEnd fires when it scrolls into view.
// If the sentinel is still visible after new items load, the observer fires again, so tall screens fill up.
export const useInfiniteScroll = (onReachEnd: () => void, isEnabled: boolean) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!isEnabled || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onReachEnd();
      },
      { rootMargin: INTERSECTION_ROOT_MARGIN },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [onReachEnd, isEnabled]);

  return sentinelRef;
};
