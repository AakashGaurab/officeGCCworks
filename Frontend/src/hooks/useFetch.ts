import { useCallback, useEffect, useRef, useState } from 'react';
import { toError } from '../utils/toError';

type SettledState<T> = {
  requestId: string;
  data: T | null;
  error: Error | null;
};

const INITIAL_ATTEMPT = 0;

// Loads one resource. It reloads when `key` changes and ignores answers from outdated requests.
export const useFetch = <T>(fetcher: (signal: AbortSignal) => Promise<T>, key: string) => {
  const [settled, setSettled] = useState<SettledState<T> | null>(null);
  const [attempt, setAttempt] = useState(INITIAL_ATTEMPT);
  const fetcherRef = useRef(fetcher);
  // Identifies one request. While the stored result belongs to another request we are loading,
  // so no state has to be reset inside the effect.
  const requestId = `${key}:${attempt}`;

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    const controller = new AbortController();

    fetcherRef
      .current(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setSettled({ requestId, data, error: null });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setSettled({ requestId, data: null, error: toError(error) });
      });

    // Cleanup runs on key change/unmount: abort the request so its late answer is dropped.
    return () => controller.abort();
  }, [requestId]);

  const retry = useCallback(() => setAttempt((previous) => previous + 1), []);

  const isCurrent = settled?.requestId === requestId;
  return {
    data: isCurrent ? settled.data : null,
    error: isCurrent ? settled.error : null,
    isLoading: !isCurrent,
    retry,
  };
};
