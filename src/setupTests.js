import '@testing-library/jest-dom';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});

class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe(target) {
    this.callback([
      {
        isIntersecting: true,
        target,
        boundingClientRect: { top: 0 },
      },
    ]);
  }

  unobserve() {}

  disconnect() {}
}

window.IntersectionObserver = MockIntersectionObserver;
window.MathJax = {
  typesetPromise: () => Promise.resolve(),
};
window.scrollTo = () => {};
window.HTMLElement.prototype.scrollTo = () => {};
window.HTMLElement.prototype.scrollIntoView = () => {};
