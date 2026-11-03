import { act, waitFor } from '@testing-library/react';
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
// The sentinel can be in the DOM before React has run the effect that creates the observer (effects of
// a promise-driven render run after the commit), so wait for the observer instead of firing into nothing.
export const triggerIntersection = async () => {
  await waitFor(() => expect(callbacks.length).toBeGreaterThan(0));
  act(() => callbacks.at(-1)?.([{ isIntersecting: true }]));
};
