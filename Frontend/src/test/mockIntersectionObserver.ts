import { vi } from 'vitest';

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;

const callbacks: ObserverCallback[] = [];

class FakeIntersectionObserver {
  constructor(callback: ObserverCallback) {
    callbacks.push(callback);
  }
  observe = vi.fn();
  disconnect = vi.fn();
}

export const installIntersectionObserver = () => {
  callbacks.length = 0;
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
};

// Pretends the sentinel scrolled into view for the most recently created observer.
export const triggerIntersection = () => callbacks.at(-1)?.([{ isIntersecting: true }]);
