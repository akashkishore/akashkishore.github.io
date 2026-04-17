import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import App from './App';
import { ScrollToTop } from './components/ScrollToTop';

function renderAt(hash) {
  window.location.hash = hash;
  return render(<App />);
}

afterEach(() => {
  cleanup();
  window.location.hash = '#/';
});

function mockScrollMetrics(container, positions) {
  Object.defineProperty(container, 'scrollTop', {
    configurable: true,
    writable: true,
    value: 0,
  });
  container.getBoundingClientRect = () => ({
    top: 0,
    left: 0,
    bottom: 900,
    right: 0,
    width: 0,
    height: 900,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  container.scrollTo = ({ top }) => {
    container.scrollTop = top;
  };

  for (const [headingText, absoluteTop] of Object.entries(positions)) {
    const heading = screen.getByRole('heading', { name: headingText });
    heading.getBoundingClientRect = () => ({
      top: absoluteTop - container.scrollTop,
      left: 0,
      bottom: absoluteTop - container.scrollTop + 48,
      right: 0,
      width: 0,
      height: 48,
      x: 0,
      y: absoluteTop - container.scrollTop,
      toJSON: () => ({}),
    });
  }
}

function ScrollToTopHarness() {
  const navigate = useNavigate();

  return (
    <>
      <ScrollToTop />
      <button type="button" onClick={() => navigate('/page#first')}>Go to first hash</button>
      <button type="button" onClick={() => navigate('/page#second')}>Go to second hash</button>
      <button type="button" onClick={() => navigate('/next#second')}>Go to next page</button>
      <Routes>
        <Route path="/page" element={<div>Page</div>} />
        <Route path="/next" element={<div>Next</div>} />
      </Routes>
    </>
  );
}

test('routes #/writing to the writing index with featured posts first', () => {
  renderAt('#/writing');

  expect(screen.getAllByRole('heading', { name: 'Writing.' }).length).toBeGreaterThan(0);

  const featured = within(screen.getByTestId('featured-posts'));
  const featuredHeadings = featured.getAllByRole('heading', { level: 2 }).map((node) => node.textContent);
  expect(featuredHeadings).toEqual([
    'Single-Cell QC Is Mostly About Triage',
    'Attention Is Not Enough for a Useful Paper Explainer',
    'Dal for Weeknights, Not for Performance',
    'Stainless steel is the best pan. End. Of. Story.',
  ]);

  const feed = within(screen.getByTestId('writing-feed'));
  const feedHeadings = feed.getAllByRole('heading', { level: 2 }).map((node) => node.textContent);
  expect(feedHeadings).toEqual([
    'How I Take Notes for Technical Work',
    'Protein Language Models and What They Hide',
    'Fermented Rice Batter Notes',
    'Why Calibration Beats Confidence',
    'A Pittsburgh Walk Loop for Clearing a Stuck Afternoon',
  ]);

  expect(featured.getByRole('img', { name: 'Science graphic with linked panels' })).toBeInTheDocument();
  expect(feed.getByRole('img', { name: 'Abstract notebook graphic' })).toBeInTheDocument();
});

test('category filter updates the visible writing feed', async () => {
  renderAt('#/writing');

  await userEvent.click(screen.getAllByRole('button', { name: 'Science' })[0]);

  const featured = within(screen.getByTestId('featured-posts'));
  expect(featured.getByRole('heading', { name: 'Single-Cell QC Is Mostly About Triage' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Attention Is Not Enough for a Useful Paper Explainer' })).not.toBeInTheDocument();

  const feed = within(screen.getByTestId('writing-feed'));
  expect(feed.getByRole('heading', { name: 'Why Calibration Beats Confidence' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'How I Take Notes for Technical Work' })).not.toBeInTheDocument();
});

test('topic chips render as interactive controls and filter the writing feed', async () => {
  renderAt('#/writing');

  await userEvent.click(screen.getAllByRole('button', { name: 'transformers · 1' })[0]);

  await waitFor(() => {
    const featured = within(screen.getByTestId('featured-posts'));
    expect(featured.getByRole('heading', { name: 'Attention Is Not Enough for a Useful Paper Explainer' })).toBeInTheDocument();
  });

  expect(screen.queryByRole('heading', { name: 'Single-Cell QC Is Mostly About Triage' })).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'How I Take Notes for Technical Work' })).not.toBeInTheDocument();
});

test('multiple topic filters use AND matching', async () => {
  renderAt('#/writing');

  await userEvent.click(screen.getAllByRole('button', { name: 'reading-notes · 1' })[0]);
  await userEvent.click(screen.getAllByRole('button', { name: 'methods · 1' })[0]);

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Attention Is Not Enough for a Useful Paper Explainer' })).toBeInTheDocument();
  });

  expect(screen.queryByRole('heading', { name: 'Protein Language Models and What They Hide' })).not.toBeInTheDocument();
});

test('search combines with category and topic filters', async () => {
  renderAt('#/writing');

  await userEvent.click(screen.getAllByRole('button', { name: 'Papers' })[0]);
  await userEvent.click(screen.getAllByRole('button', { name: 'transformers · 1' })[0]);
  await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'verbs');

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Attention Is Not Enough for a Useful Paper Explainer' })).toBeInTheDocument();
  });

  expect(screen.queryByRole('heading', { name: 'Protein Language Models and What They Hide' })).not.toBeInTheDocument();
});

test('search is case-insensitive and matches article body text', async () => {
  renderAt('#/writing');

  await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'VERBS');

  await waitFor(() => {
    const featured = within(screen.getByTestId('featured-posts'));
    expect(featured.getByRole('heading', { name: 'Attention Is Not Enough for a Useful Paper Explainer' })).toBeInTheDocument();
    const feed = within(screen.getByTestId('writing-feed'));
    expect(feed.queryByRole('heading', { name: 'How I Take Notes for Technical Work' })).not.toBeInTheDocument();
  });
});

test('topic list updates when category changes', async () => {
  renderAt('#/writing');

  expect(screen.getAllByRole('button', { name: 'lentils · 1' }).length).toBeGreaterThan(0);

  await userEvent.click(screen.getAllByRole('button', { name: 'Papers' })[0]);

  await waitFor(() => {
    expect(screen.queryAllByRole('button', { name: 'lentils · 1' })).toHaveLength(0);
  });

  expect(screen.getAllByRole('button', { name: 'proteins · 1' }).length).toBeGreaterThan(0);
});

test('topic list updates when search narrows results and selected topics remain visible', async () => {
  renderAt('#/writing');

  await userEvent.click(screen.getAllByRole('button', { name: 'transformers · 1' })[0]);
  await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'protein');

  await waitFor(() => {
    expect(screen.getAllByRole('button', { name: 'transformers · 0' }).length).toBeGreaterThan(0);
  });

  expect(screen.queryByRole('heading', { name: 'Attention Is Not Enough for a Useful Paper Explainer' })).not.toBeInTheDocument();
});

test('url params restore category, topics, and search state on initial load', async () => {
  renderAt('#/writing?category=Papers&topic=transformers&q=verbs');

  await waitFor(() => {
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('verbs');
  });

  expect(screen.getAllByRole('button', { name: 'Papers' })[0]).toHaveClass('font-semibold');
  expect(screen.getAllByRole('button', { name: 'transformers · 1' })[0]).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('heading', { name: 'Attention Is Not Enough for a Useful Paper Explainer' })).toBeInTheDocument();
});

test('clear all resets category, topics, and search', async () => {
  renderAt('#/writing');

  await userEvent.click(screen.getAllByRole('button', { name: 'Papers' })[0]);
  await userEvent.click(screen.getAllByRole('button', { name: 'transformers · 1' })[0]);
  await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'verbs');

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Attention Is Not Enough for a Useful Paper Explainer' })).toBeInTheDocument();
  });

  await userEvent.click(screen.getByRole('button', { name: 'Clear all' }));

  await waitFor(() => {
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('');
  });

  const feed = within(screen.getByTestId('writing-feed'));
  expect(feed.getByRole('heading', { name: 'How I Take Notes for Technical Work' })).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: 'transformers · 1' })[0]).toHaveAttribute('aria-pressed', 'false');
});

test('empty state appears when combined filters yield no matches', async () => {
  renderAt('#/writing');

  await userEvent.click(screen.getAllByRole('button', { name: 'Cooking' })[0]);
  await userEvent.click(screen.getAllByRole('button', { name: 'lentils · 1' })[0]);
  await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'mitochondrial');

  await waitFor(() => {
    expect(screen.getByText('No posts match the current filters.')).toBeInTheDocument();
  });
});

test('routes #/writing/:slug to an article with metadata, toc, equation, and syntax highlighting', () => {
  const { container } = renderAt('#/writing/attention-is-not-enough');

  expect(screen.getAllByRole('heading', { name: 'Attention Is Not Enough for a Useful Paper Explainer' }).length).toBeGreaterThan(0);
  expect(screen.getAllByText('Attention Is All You Need').length).toBeGreaterThan(0);
  expect(screen.getAllByRole('link', { name: 'Open paper' })[0]).toHaveAttribute('href', 'https://arxiv.org/abs/1706.03762');
  expect(screen.getAllByRole('img', { name: 'Abstract paper-inspired hero graphic' })).toHaveLength(2);
  expect(screen.getByRole('button', { name: "Start with the paper's verbs" })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Translate architecture into constraints' })).toBeInTheDocument();
  expect(screen.getByText(/\\mathrm{Attention}/)).toBeInTheDocument();

  cleanup();

  const result = renderAt('#/writing/single-cell-qc-is-mostly-about-triage');
  expect(result.container.querySelector('[data-line], pre code')).not.toBeNull();
  expect(result.container.querySelector('code[data-line-numbers]')).not.toBeNull();
  expect(screen.getAllByText('Single-Cell QC Is Mostly About Triage').length).toBeGreaterThan(0);
  void container;
});

test('writing article toc clicks scroll the article region without moving the right rail', async () => {
  renderAt('#/writing/attention-is-not-enough');

  const articleScrollRegion = document.getElementById('scroll-center');
  expect(articleScrollRegion).not.toBeNull();

  const scrollRegions = document.querySelectorAll('[data-scroll-region]');
  const rightRailScrollRegion = scrollRegions[2];
  expect(rightRailScrollRegion).toBeTruthy();

  Object.defineProperty(rightRailScrollRegion, 'scrollTop', {
    configurable: true,
    writable: true,
    value: 180,
  });
  rightRailScrollRegion.scrollTo = ({ top }) => {
    rightRailScrollRegion.scrollTop = top;
  };

  mockScrollMetrics(articleScrollRegion, {
    "Start with the paper's verbs": 160,
    'Translate architecture into constraints': 520,
    'A small equation helps': 760,
    'Explain the result as an experiment design choice': 1080,
    'The output should help the next action': 1420,
  });

  await userEvent.click(screen.getByRole('button', { name: 'Explain the result as an experiment design choice' }));

  expect(articleScrollRegion.scrollTop).toBe(984);
  expect(rightRailScrollRegion.scrollTop).toBe(180);
  expect(screen.getByRole('button', { name: 'Explain the result as an experiment design choice' })).toHaveAttribute('aria-current', 'location');
});

test('writing article toc keeps the clicked heading active during intermediate smooth-scroll events', async () => {
  renderAt('#/writing/attention-is-not-enough');

  const articleScrollRegion = document.getElementById('scroll-center');
  expect(articleScrollRegion).not.toBeNull();

  mockScrollMetrics(articleScrollRegion, {
    "Start with the paper's verbs": 160,
    'Translate architecture into constraints': 520,
    'A small equation helps': 760,
    'Explain the result as an experiment design choice': 1080,
    'The output should help the next action': 1420,
  });

  articleScrollRegion.scrollTo = ({ top }) => {
    articleScrollRegion.dataset.targetTop = String(top);
  };

  await userEvent.click(screen.getByRole('button', { name: 'Explain the result as an experiment design choice' }));

  act(() => {
    articleScrollRegion.dispatchEvent(new Event('scroll'));
  });

  expect(screen.getByRole('button', { name: 'Explain the result as an experiment design choice' })).toHaveAttribute('aria-current', 'location');
  expect(screen.getByRole('button', { name: "Start with the paper's verbs" })).not.toHaveAttribute('aria-current');
});

test('writing article toc active state follows the last heading crossing the activation line', async () => {
  renderAt('#/writing/attention-is-not-enough');

  const articleScrollRegion = document.getElementById('scroll-center');
  expect(articleScrollRegion).not.toBeNull();

  mockScrollMetrics(articleScrollRegion, {
    "Start with the paper's verbs": 160,
    'Translate architecture into constraints': 520,
    'A small equation helps': 760,
    'Explain the result as an experiment design choice': 1080,
    'The output should help the next action': 1420,
  });

  act(() => {
    articleScrollRegion.dispatchEvent(new Event('scroll'));
  });

  await waitFor(() => {
    expect(screen.getByRole('button', { name: "Start with the paper's verbs" })).toHaveAttribute('aria-current', 'location');
  });

  act(() => {
    articleScrollRegion.scrollTop = 680;
    articleScrollRegion.dispatchEvent(new Event('scroll'));
  });

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'A small equation helps' })).toHaveAttribute('aria-current', 'location');
  });

  expect(screen.getByRole('button', { name: 'Translate architecture into constraints' })).not.toHaveAttribute('aria-current');
});

test('ScrollToTop ignores hash-only navigation but resets on pathname changes', async () => {
  const windowScrollTo = vi.spyOn(window, 'scrollTo');

  render(
    <MemoryRouter initialEntries={['/page#start']}>
      <div data-scroll-region />
      <ScrollToTopHarness />
    </MemoryRouter>,
  );

  const scrollRegion = document.querySelector('[data-scroll-region]');
  Object.defineProperty(scrollRegion, 'scrollTop', {
    configurable: true,
    writable: true,
    value: 240,
  });
  scrollRegion.scrollTo = ({ top }) => {
    scrollRegion.scrollTop = top;
  };

  windowScrollTo.mockClear();
  scrollRegion.scrollTop = 240;

  await userEvent.click(screen.getByRole('button', { name: 'Go to second hash' }));

  expect(windowScrollTo).not.toHaveBeenCalled();
  expect(scrollRegion.scrollTop).toBe(240);

  await userEvent.click(screen.getByRole('button', { name: 'Go to next page' }));

  await waitFor(() => {
    expect(windowScrollTo).toHaveBeenCalled();
  });
  expect(scrollRegion.scrollTop).toBe(0);

  windowScrollTo.mockRestore();
});

test('homepage shows the two most recent writing previews', () => {
  renderAt('#/');

  expect(screen.getByRole('heading', { name: 'Recent writing' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Single-Cell QC Is Mostly About Triage' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Attention Is Not Enough for a Useful Paper Explainer' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Dal for Weeknights, Not for Performance' })).not.toBeInTheDocument();
});

test('missing writing slug shows a not-found state', () => {
  renderAt('#/writing/does-not-exist');

  expect(screen.getByRole('heading', { name: 'Post not found.' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Back to writing' })).toBeInTheDocument();
});
