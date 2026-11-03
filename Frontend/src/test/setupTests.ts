import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// jsdom has no IntersectionObserver; tests that need it install the fake from mockIntersectionObserver.ts.
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
