import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// The default 1000 ms for waitFor/findBy is too short when the whole suite runs in parallel and the CPU
// is busy; a longer limit only delays a real failure, it does not hide one.
const ASYNC_UTIL_TIMEOUT_MS = 4000;
configure({ asyncUtilTimeout: ASYNC_UTIL_TIMEOUT_MS });

// jsdom has no <dialog>.showModal()/close(). This stand-in only toggles the `open` attribute, which is
// enough for tests to see the dialog content; real focus trapping and Esc handling are the browser's job.
HTMLDialogElement.prototype.showModal = function showModal() {
  this.setAttribute('open', '');
};
HTMLDialogElement.prototype.close = function close() {
  this.removeAttribute('open');
  this.dispatchEvent(new Event('close'));
};

// jsdom has no IntersectionObserver; tests that need it install the fake from mockIntersectionObserver.ts.
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
