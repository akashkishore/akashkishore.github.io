import {
  type JSX,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import MoonIcon from "./assets/svgs/icons/moon.svg?react";
import SunIcon from "./assets/svgs/icons/sun.svg?react";
import PlusIcon from "./assets/svgs/icons/plus.svg?react";
import {
  HashRouter,
  Link,
  Route,
  Routes,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { contactContent } from "./content/contact";
import { homeContent } from "./content/home";
import { infoContent } from "./content/info";
import { siteContent } from "./content/site";
import {
  getRelatedWritingPosts,
  getWritingPostBySlug,
  writingCategories,
  writingPosts,
} from "./content/writing";
import { writingMdxComponents } from "./content/writing/mdx-components";
import type { WritingCategory, WritingHeading, WritingPost } from "./content/types";
import { RenderErrorBoundary } from "./components/RenderErrorBoundary";
import { ScrollToTop } from "./components/ScrollToTop";
import { ThemeProvider, useTheme } from "./theme";

const formatOrdinals = (text: string): string =>
  text.replace(/\b(\d+)(st|nd|rd|th)\b/g, (_match: string, number: string, suffix: string) => `${number}<sup>${suffix}</sup>`);

function parseDisplayDate(value: string): Date {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  return new Date(value);
}

const formatDateLong = (value: string): string =>
  new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parseDisplayDate(value));

const formatDateShort = (value: string): string =>
  new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parseDisplayDate(value));

const writingCategoryLabel = (category: WritingCategory): string => category;
const homeGreetings = ["Hello!", "നമസ്കാരം!", "வணக்கம்!"];
const homeGreetingIntervalMs = 2500;
const writingTocActivationOffsetPx = 112;
const writingTocFallbackScrollMarginTopPx = 96;

type WritingFilterValue = "All" | WritingCategory;

type WritingTopicOption = {
  count: number;
  selected: boolean;
  tag: string;
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [delayMs, value]);

  return debouncedValue;
}

function normalizeWritingSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

function buildWritingSearchParams({
  category,
  query,
  topics,
}: {
  category: WritingFilterValue;
  query: string;
  topics: string[];
}): URLSearchParams {
  const params = new URLSearchParams();
  if (category !== "All") {
    params.set("category", category);
  }
  if (query) {
    params.set("q", query);
  }
  for (const topic of topics) {
    params.append("topic", topic);
  }
  return params;
}

function getScrollMarginTop(element: HTMLElement): number {
  const scrollMarginTop = Number.parseFloat(window.getComputedStyle(element).scrollMarginTop);
  return Number.isFinite(scrollMarginTop) ? scrollMarginTop : writingTocFallbackScrollMarginTopPx;
}

function getElementTopWithinScrollContainer(container: HTMLElement, element: HTMLElement): number {
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  return container.scrollTop + elementRect.top - containerRect.top;
}

function getWritingActiveHeadingId(headings: WritingHeading[], container: HTMLElement): string {
  const activationLine = container.scrollTop + writingTocActivationOffsetPx;
  let activeId = headings[0]?.id ?? "";

  for (const heading of headings) {
    const element = document.getElementById(heading.id);
    if (!(element instanceof HTMLElement)) {
      continue;
    }

    const headingTop = getElementTopWithinScrollContainer(container, element);
    if (headingTop <= activationLine) {
      activeId = heading.id;
    } else {
      break;
    }
  }

  return activeId;
}

function useWritingFilters(): {
  categoryCounts: Record<WritingCategory, number>;
  clearAll: () => void;
  currentCategory: WritingFilterValue;
  feedPosts: WritingPost[];
  featuredPosts: WritingPost[];
  hasActiveFilters: boolean;
  searchInput: string;
  selectedTopics: string[];
  setCurrentCategory: (value: WritingFilterValue) => void;
  setSearchInput: (value: string) => void;
  topicOptions: WritingTopicOption[];
  toggleTopic: (topic: string) => void;
  visibleCount: number;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const topicParams = [...new Set(searchParams.getAll("topic").filter(Boolean))];
  const queryParam = searchParams.get("q") ?? "";
  const currentCategory: WritingFilterValue =
    categoryParam && writingCategories.includes(categoryParam as WritingCategory)
      ? (categoryParam as WritingCategory)
      : "All";
  const [searchInput, setSearchInput] = useState(queryParam);
  const debouncedSearchInput = useDebouncedValue(searchInput, 250);
  const trimmedSearchInput = searchInput.trim();
  const normalizedQuery = normalizeWritingSearchQuery(debouncedSearchInput);

  useEffect(() => {
    setSearchInput(queryParam);
  }, [queryParam]);

  useEffect(() => {
    const nextParams = buildWritingSearchParams({
      category: currentCategory,
      query: trimmedSearchInput === "" ? "" : debouncedSearchInput.trim(),
      topics: topicParams,
    });

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [currentCategory, debouncedSearchInput, searchParams, setSearchParams, topicParams, trimmedSearchInput]);

  const categoryCounts = writingPosts.reduce<Record<WritingCategory, number>>(
    (acc, post) => {
      acc[post.category] += 1;
      return acc;
    },
    {
      Papers: 0,
      Cooking: 0,
      Science: 0,
      Misc: 0,
    },
  );

  const categoryFilteredPosts = currentCategory === "All"
    ? writingPosts
    : writingPosts.filter((post) => post.category === currentCategory);
  const categoryAndSearchFilteredPosts = normalizedQuery
    ? categoryFilteredPosts.filter((post) => post.searchText.includes(normalizedQuery))
    : categoryFilteredPosts;
  const matchingPosts = topicParams.length
    ? categoryAndSearchFilteredPosts.filter((post) => topicParams.every((topic) => post.tags?.includes(topic)))
    : categoryAndSearchFilteredPosts;

  const topicMap = new Map<string, number>();
  for (const post of categoryAndSearchFilteredPosts) {
    for (const tag of post.tags ?? []) {
      topicMap.set(tag, (topicMap.get(tag) ?? 0) + 1);
    }
  }
  for (const topic of topicParams) {
    if (!topicMap.has(topic)) {
      topicMap.set(topic, 0);
    }
  }
  const topicOptions = [...topicMap.entries()]
    .map(([tag, count]) => ({
      count,
      selected: topicParams.includes(tag),
      tag,
    }))
    .sort((a, b) => {
      if (a.selected !== b.selected) {
        return a.selected ? -1 : 1;
      }
      return b.count - a.count || a.tag.localeCompare(b.tag);
    });

  const featuredPosts = matchingPosts.filter((post) => post.featured);
  const featuredSlugs = new Set(featuredPosts.map((post) => post.slug));
  const feedPosts = matchingPosts.filter((post) => !featuredSlugs.has(post.slug));

  const writeParams = ({
    category,
    query,
    topics,
  }: {
    category: WritingFilterValue;
    query: string;
    topics: string[];
  }) => {
    const nextParams = buildWritingSearchParams({
      category,
      query: query.trim(),
      topics,
    });
    setSearchParams(nextParams, { replace: true });
  };

  const setCurrentCategory = (value: WritingFilterValue) => {
    writeParams({
      category: value,
      query: searchInput,
      topics: topicParams,
    });
  };

  const toggleTopic = (topic: string) => {
    const nextTopics = topicParams.includes(topic)
      ? topicParams.filter((value) => value !== topic)
      : [...topicParams, topic];
    writeParams({
      category: currentCategory,
      query: searchInput,
      topics: nextTopics,
    });
  };

  const clearAll = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  return {
    categoryCounts,
    clearAll,
    currentCategory,
    feedPosts,
    featuredPosts,
    hasActiveFilters: currentCategory !== "All" || topicParams.length > 0 || normalizedQuery.length > 0,
    searchInput,
    selectedTopics: topicParams,
    setCurrentCategory,
    setSearchInput,
    topicOptions,
    toggleTopic,
    visibleCount: matchingPosts.length,
  };
}

function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title ? `${title} | ${siteContent.name}` : siteContent.name;
  }, [title]);
}

function TopBar(): JSX.Element {
  const location = useLocation();
  const { pathname, hash } = location;
  const [menuOpen, setMenuOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileNavRef = useRef<HTMLDivElement | null>(null);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const toggleLabel = isDark ? "Light" : "Dark";
  const { label: currentLocationLabel, timeZone } = siteContent.currentLocation;

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, [timeZone]);

  const formattedDate = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
    timeZone,
  }).format(now);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, hash]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (mobileNavRef.current?.contains(target)) {
        return;
      }
      if (toggleButtonRef.current?.contains(target)) {
        return;
      }
      setMenuOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [menuOpen]);

  const formattedTime = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(now);

  const renderNavLinks = (linkClassName: (isActive: boolean) => string, onLinkClick?: () => void) =>
    siteContent.nav.map((item) => {
      const hashIndex = item.href.indexOf("#");
      let isActive = false;
      if (hashIndex >= 0) {
        const basePath = item.href.slice(0, hashIndex) || "/";
        const targetHash = item.href.slice(hashIndex);
        isActive = pathname === basePath && hash === targetHash;
      } else if (item.href === "/") {
        isActive = pathname === "/";
      } else {
        isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
      }

      return (
        <Link
          key={item.href}
          to={item.href}
          className={linkClassName(isActive)}
          onClick={onLinkClick}
        >
          {item.label}
        </Link>
      );
    });

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-neutral-200 bg-white/70 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/70">
      <div className="mx-auto flex h-12 max-w-[1400px] items-center justify-between px-5 text-sm">
        <div className="flex items-center gap-2">
          <Link to="/" className="font-semibold text-primary hover:underline underline-offset-4">
            ❤️ {siteContent.name}
          </Link>
        </div>
        <nav className="absolute left-1/2 hidden -translate-x-1/2 gap-4 text-muted lg:flex">
          {renderNavLinks(
            (isActive) =>
              `hover:underline underline-offset-4 ${isActive ? "font-semibold text-primary" : "text-muted"}`,
          )}
        </nav>
        <motion.button
          type="button"
          ref={toggleButtonRef}
          className="inline-flex items-center justify-center px-2 py-1 text-muted lg:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          animate={{ rotate: menuOpen ? 45 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <span className="sr-only">Open navigation</span>
          <PlusIcon className="h-5 w-5" aria-hidden="true" />
        </motion.button>
        <div className="hidden items-center gap-3 text-primary lg:flex">
          <span>
            {formattedDate} · {formattedTime} · {currentLocationLabel}
          </span>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded px-2 py-1 text-xs uppercase tracking-[0.2em] text-muted hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label={`Switch to ${toggleLabel.toLowerCase()} mode`}
            aria-pressed={isDark}
          >
            {isDark ? (
              <SunIcon className="h-4 w-4 text-yellow-400" aria-hidden="true" />
            ) : (
              <MoonIcon className="h-4 w-4 text-blue-900" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.div
              key="overlay"
              className="fixed inset-0 z-30 bg-black/40 lg:hidden"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              key="mobile-nav"
              ref={mobileNavRef}
              className="fixed top-12 left-0 right-0 z-40 border-b border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-[0_10px_30px_rgba(15,23,42,0.35)] lg:hidden"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <nav className="flex flex-col gap-3 px-5 py-4 text-primary">
                {renderNavLinks(
                  (isActive) => `text-base ${isActive ? "font-semibold text-primary" : "text-muted"}`,
                  () => setMenuOpen(false),
                )}
                <div className="mt-3 flex flex-col gap-2 border-t border-neutral-200 pt-3 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                  <span>
                    {formattedDate} · {formattedTime} · {currentLocationLabel}
                  </span>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="inline-flex w-min items-center gap-2 px-2 py-1 text-xs uppercase tracking-[0.2em] text-muted hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    aria-label={`Switch to ${toggleLabel.toLowerCase()} mode`}
                    aria-pressed={isDark}
                  >
                    {isDark ? (
                      <SunIcon className="h-4 w-4 text-yellow-400" aria-hidden="true" />
                    ) : (
                      <MoonIcon className="h-4 w-4 text-blue-900" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </nav>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function LeftRail(): JSX.Element {
  const [greetingIndex, setGreetingIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setGreetingIndex((current) => (current + 1) % homeGreetings.length);
    }, homeGreetingIntervalMs);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <aside className="layout-rail layout-rail--left layout-rail--viewport layout-rail--spacious">
      <div className="flex h-full flex-col pb-8">
        <div>
          <h2 className="text-5xl font-semibold leading-[0.95] tracking-tight">
            <span className="inline-flex min-h-[1.2em] items-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={homeGreetings[greetingIndex]}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="inline-block"
                >
                  {homeGreetings[greetingIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
            <br />
            I&apos;m <span className="text-pop-accent">{siteContent.name}</span>.  
          </h2>
        </div>
        <SocialLinks className="social-link-list mt-8 text-muted" />
        <div className="mt-auto">
          <CategoryList />
        </div>
      </div>
    </aside>
  );
}

function RightRail(): JSX.Element {
  return (
    <aside className="layout-rail layout-rail--right layout-rail--viewport layout-rail--spacious pl-8">
      <div className="flex h-full flex-col pb-8">
        <div>
          <img src={siteContent.portrait.src} alt={siteContent.portrait.alt} className="square-media" />
        </div>
        <div className="mt-auto text-sm">
          <div className="space-y-1 text-muted">{contactContent.email}</div>
          <div className="mt-4 text-xs text-neutral-400">© {new Date().getFullYear()}</div>
        </div>
      </div>
    </aside>
  );
}

function ThreeColFrame({
  children,
  contentClassName,
  leftSlot,
  rightSlot,
  columnBreakpoint = "xl",
}: {
  children: ReactNode;
  contentClassName?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  columnBreakpoint?: "lg" | "xl";
}): JSX.Element {
  const isLgBreakpoint = columnBreakpoint === "lg";
  const desktopScrollRegionClasses = isLgBreakpoint
    ? "lg:h-full lg:min-h-0 lg:overflow-y-auto"
    : "xl:h-full xl:min-h-0 xl:overflow-y-auto";
  const desktopViewportSpacerClass = isLgBreakpoint
    ? "hidden lg:block lg:h-[var(--layout-rail-viewport-tail-space)] lg:flex-none"
    : "hidden xl:block xl:h-[var(--layout-rail-viewport-tail-space)] xl:flex-none";
  const desktopFitSpacerClass = isLgBreakpoint
    ? "hidden lg:block lg:h-[var(--layout-rail-fit-tail-space)] lg:flex-none"
    : "hidden xl:block xl:h-[var(--layout-rail-fit-tail-space)] xl:flex-none";
  const wrapperClasses = [
    "mx-auto max-w-[1400px] px-5",
    isLgBreakpoint ? "lg:px-0" : "xl:px-0",
    "pt-16",
    isLgBreakpoint ? "lg:pt-0 lg:mt-12 lg:h-[calc(100vh-3rem)]" : "xl:pt-0 xl:mt-12 xl:h-[calc(100vh-3rem)]",
  ].join(" ");
  const frameClasses = [
    "flex flex-col gap-y-12",
    isLgBreakpoint ? "lg:flex-row lg:gap-x-10 lg:gap-y-0 lg:h-full lg:min-h-full lg:items-stretch" : "xl:flex-row xl:gap-x-10 xl:gap-y-0 xl:h-full xl:min-h-full xl:items-stretch",
    "px-4",
    isLgBreakpoint ? "lg:px-8" : "xl:px-8",
  ].join(" ");
  const leftRailClasses = [
    "hidden w-[300px] border-neutral-200 bg-[var(--layout-left-rail-bg)] dark:border-neutral-800",
    isLgBreakpoint ? "lg:flex lg:flex-none lg:basis-[300px] lg:border-r" : "xl:flex xl:flex-none xl:basis-[300px] xl:border-r",
    desktopScrollRegionClasses,
  ].join(" ");
  const rightRailClasses = [
    "hidden w-[280px] border-neutral-200 bg-[var(--layout-right-rail-bg)] dark:border-neutral-800",
    isLgBreakpoint ? "lg:flex lg:flex-shrink-0 lg:border-l" : "xl:flex xl:flex-shrink-0 xl:border-l",
    desktopScrollRegionClasses,
  ].join(" ");
  const mainClasses = [
    "bg-[var(--layout-center-bg)]",
    isLgBreakpoint ? "lg:flex-1 lg:px-8 lg:pb-[var(--layout-scroll-bottom-space)]" : "xl:flex-1 xl:px-8 xl:pb-[var(--layout-scroll-bottom-space)]",
    desktopScrollRegionClasses,
  ].join(" ");
  const innerClasses = [
    "mx-auto w-full min-h-full pt-10",
    isLgBreakpoint ? "lg:pt-12" : "xl:pt-12",
    contentClassName ?? "max-w-3xl",
  ].join(" ");
  const railInnerClasses = "w-full min-h-full";

  const renderRailSlot = (slot: ReactNode, defaultNode: ReactNode): JSX.Element => {
    const railContent = slot ?? defaultNode;
    const railElement = typeof railContent === "object" && railContent !== null && "props" in railContent
      ? (railContent as { props?: { className?: string } })
      : null;
    const usesFitRail = railElement?.props?.className?.includes("layout-rail--fit") ?? false;
    const spacerClassName = usesFitRail ? desktopFitSpacerClass : desktopViewportSpacerClass;

    return (
      <div className={railInnerClasses}>
        {railContent}
        <div aria-hidden="true" className={spacerClassName} />
      </div>
    );
  };

  return (
    <div className={wrapperClasses}>
      <div className={frameClasses}>
        <div className={leftRailClasses} data-scroll-region>
          {renderRailSlot(leftSlot, <LeftRail />)}
        </div>
        <main className={mainClasses} id="scroll-center" data-scroll-region>
          <div className={innerClasses}>{children}</div>
        </main>
        <div className={rightRailClasses} data-scroll-region>
          {renderRailSlot(rightSlot, <RightRail />)}
        </div>
      </div>
    </div>
  );
}

function SocialLinks({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}): JSX.Element {
  return (
    <div className={className ?? (compact ? "flex flex-wrap gap-4 text-sm text-muted" : "social-link-list text-muted")}>
      {siteContent.socials.map((social) => (
        <a
          key={social.label}
          href={social.href}
          className={compact ? "inline-flex items-center justify-center" : "social-link"}
          target={compact ? undefined : "_blank"}
          rel={compact ? undefined : "noreferrer"}
        >
          <img
            src={social.icon}
            alt={compact ? social.label : ""}
            className={["h-4 w-4", social.iconClassName].filter(Boolean).join(" ")}
          />
          {compact ? null : <span>{social.label}</span>}
        </a>
      ))}
    </div>
  );
}

function CategoryList(): JSX.Element {
  return (
    <ul className="meta-list--contrast">
      {siteContent.categories.map((category) => (
        <li key={category} className="flex items-center justify-between py-3">
          <span>{category}</span>
        </li>
      ))}
    </ul>
  );
}

function SkillsList({ skills }: { skills: typeof infoContent.skills }): JSX.Element {
  return (
    <ul className="mt-4 space-y-5">
      {skills.map((skill) => (
        <li key={skill.category}>
          <div className="font-medium text-primary">{skill.category}</div>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted">
            {skill.items.map((item) => (
              <span key={item} className="pill-tag">
                {item}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

function RecognitionsList({ recognitions }: { recognitions: typeof infoContent.recognitions }): JSX.Element {
  return (
    <ul className="mt-4 space-y-4 text-sm">
      {recognitions.map((recognition) => (
        <li key={`${recognition.year}-${recognition.title}`} className="border-b border-neutral-200 pb-4 last:border-b-0 last:pb-0">
          <div className="text-neutral-400">{recognition.year}</div>
          <div className="font-medium text-primary">{recognition.title}</div>
          {recognition.by ? <div className="text-muted">{recognition.by}</div> : null}
        </li>
      ))}
    </ul>
  );
}

function WritingPaperBadge({ post }: { post: WritingPost }): JSX.Element | null {
  if (!post.paperTitle) {
    return null;
  }

  return (
    <span className="rounded-full border border-neutral-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:border-neutral-800">
      Paper
    </span>
  );
}

function WritingArticleHeader({
  post,
  className,
}: {
  post: WritingPost;
  className?: string;
}): JSX.Element {
  return (
    <header className={className}>
      <h1 className="text-4xl font-semibold tracking-tight text-pop-accent lg:text-5xl">{post.title}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted">{post.excerpt}</p>
      <WritingArticleMeta post={post} className="mt-6 lg:hidden" />
      <div className="mt-6">
        <PaperCitationCard post={post} />
      </div>
    </header>
  );
}

function WritingFeedCard({ post }: { post: WritingPost }): JSX.Element {
  return (
    <article className="rounded-2xl border border-neutral-200 p-5 transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600">
      <Link to={`/writing/${post.slug}`} className="group block">
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          {post.heroImage ? (
            <img
              src={post.heroImage}
              alt={post.heroAlt ?? post.title}
              className="aspect-square w-full rounded-xl border border-neutral-200 object-cover dark:border-neutral-800 md:h-24 md:w-24 md:flex-none"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-neutral-500">
              <span>{writingCategoryLabel(post.category)}</span>
              <span>·</span>
              <time dateTime={post.date}>{formatDateShort(post.date)}</time>
              <WritingPaperBadge post={post} />
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-primary group-hover:underline underline-offset-4">
              {post.title}
            </h2>
            <p className="mt-3 hidden text-base leading-relaxed text-muted md:block">{post.excerpt}</p>
            {post.tags?.length ? (
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
                {post.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="pill-tag">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}

function RecentWritingPreview(): JSX.Element {
  const recentPosts = writingPosts.slice(0, 2);

  return (
    <section className="mt-20">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-lg font-semibold">Recent writing</h2>
        <Link to="/writing" className="text-xs text-muted hover:underline underline-offset-4">
          View all
        </Link>
      </div>
      <div className="space-y-5">
        {recentPosts.map((post) => (
          <article key={post.slug} className="border-t border-neutral-200 pt-5 first:border-t-0 first:pt-0">
            <Link to={`/writing/${post.slug}`} className="group block">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-neutral-500">
                <span>{writingCategoryLabel(post.category)}</span>
                <span>·</span>
                <time dateTime={post.date}>{formatDateShort(post.date)}</time>
              </div>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-primary group-hover:underline underline-offset-4">
                {post.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function WritingSearchControls({
  hasActiveFilters,
  onChange,
  onClearAll,
  value,
}: {
  hasActiveFilters: boolean;
  onChange: (value: string) => void;
  onClearAll: () => void;
  value: string;
}): JSX.Element {
  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex-1">
          <label htmlFor="writing-search" className="sr-only">
            Search
          </label>
          <input
            id="writing-search"
            type="search"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Search all writing"
            className="w-full rounded-2xl border border-neutral-300 bg-transparent px-5 py-4 text-base text-primary outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-500 dark:border-neutral-700 dark:focus:border-neutral-500"
          />
        </div>
        <button
          type="button"
          onClick={onClearAll}
          className={`shrink-0 text-sm ${hasActiveFilters ? "text-primary hover:underline underline-offset-4" : "text-neutral-400"}`}
          disabled={!hasActiveFilters}
        >
          Clear all
        </button>
      </div>
    </div>
  );
}

function HomePage(): JSX.Element {
  useDocumentTitle("");
  const formattedHeadline = formatOrdinals(homeContent.headline);
  const [greetingIndex, setGreetingIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setGreetingIndex((current) => (current + 1) % homeGreetings.length);
    }, homeGreetingIntervalMs);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <ThreeColFrame columnBreakpoint="lg">
      <section className="mobile-stack pt-6">
        <div>
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">
            <span className="inline-flex min-h-[1.2em] items-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={homeGreetings[greetingIndex]}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="inline-block"
                >
                  {homeGreetings[greetingIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
            <br />
            I&apos;m <span className="text-pop-accent">{siteContent.name}</span>. 
          </h2>
        </div>
        <SocialLinks compact />
        <div className="border-t border-neutral-400 pt-4">
          <CategoryList />
        </div>
      </section>
      <section className="mobile-stack mobile-divider-section mt-10 text-sm">
        <div>
          <img src={siteContent.portrait.src} alt={siteContent.portrait.alt} className="square-media" />
        </div>
      </section>
      <section className="pt-6 xl:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl leading-snug md:text-2xl"
          dangerouslySetInnerHTML={{ __html: formattedHeadline }}
        />
      </section>
      <br />
      <span className="text-2xl text-muted">This website is a work in progress. 👷🏾‍♂️</span>
      <section id="contact" className="mb-12 mt-12">
        <h3 className="mb-2 text-lg font-semibold">{contactContent.heading}</h3>
        <p className="text-primary">{contactContent.description} {contactContent.email}</p>
      </section>
      <RecentWritingPreview />
    </ThreeColFrame>
  );
}

function WritingSectionIntro({
  currentCategory,
  counts,
  className,
}: {
  currentCategory: WritingFilterValue;
  counts: Record<WritingCategory, number>;
  className?: string;
}): JSX.Element {
  return (
    <aside className={className ?? "layout-rail layout-rail--left layout-rail--fit layout-rail--spacious"}>
      <div className="space-y-8">
        <div>
          {/* <p className="eyebrow-label">Writing</p> */}
          <h1 className="mt-3 text-5xl font-semibold tracking-tight text-pop-accent">Writing.</h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            I love to yap. Figured it's worth documenting while I'm at it. 
          </p>
        </div>
        <div>
          <h2 className="eyebrow-label">Categories</h2>
          <ul className="meta-list mt-4">
            {writingCategories.map((category) => (
              <li key={category} className="flex items-center justify-between py-3">
                <span className={currentCategory === category ? "font-semibold text-primary" : "text-muted"}>
                  {writingCategoryLabel(category)}
                </span>
                <span className="text-neutral-400">{counts[category]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

function WritingFilterControls({
  value,
  onChange,
}: {
  value: WritingFilterValue;
  onChange: (value: WritingFilterValue) => void;
}): JSX.Element {
  return (
    <div>
      <h2 className="eyebrow-label">Browse</h2>
      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onChange("All")}
          className={`text-left text-sm ${value === "All" ? "font-semibold text-primary" : "text-muted hover:text-primary"}`}
        >
          All posts
        </button>
        {writingCategories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`text-left text-sm ${value === category ? "font-semibold text-primary" : "text-muted hover:text-primary"}`}
          >
            {writingCategoryLabel(category)}
          </button>
        ))}
      </div>
    </div>
  );
}

function WritingTopicControls({
  options,
  onToggle,
}: {
  onToggle: (topic: string) => void;
  options: WritingTopicOption[];
}): JSX.Element {
  if (options.length === 0) {
    return <></>;
  }

  return (
    <div className="mt-10 border-t border-neutral-200 pt-6 dark:border-neutral-800">
      <h2 className="eyebrow-label">Browse by topic</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.tag}
            type="button"
            onClick={() => onToggle(option.tag)}
            aria-pressed={option.selected}
            className={`pill-tag text-xs transition-colors ${
              option.selected
                ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-950"
                : "text-muted hover:border-neutral-400 hover:text-primary dark:hover:border-neutral-600"
            }`}
          >
            {option.tag} · {option.count}
          </button>
        ))}
      </div>
    </div>
  );
}

function WritingIndexFilters({
  currentCategory,
  hasActiveFilters,
  onCategoryChange,
  onClearAll,
  onTopicToggle,
  topicOptions,
}: {
  currentCategory: WritingFilterValue;
  hasActiveFilters: boolean;
  onCategoryChange: (value: WritingFilterValue) => void;
  onClearAll: () => void;
  onTopicToggle: (topic: string) => void;
  topicOptions: WritingTopicOption[];
}): JSX.Element {
  return (
    <div>
      <WritingFilterControls value={currentCategory} onChange={onCategoryChange} />
      <WritingTopicControls options={topicOptions} onToggle={onTopicToggle} />
      <div className="mt-10 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <button
          type="button"
          onClick={onClearAll}
          className={`text-sm ${hasActiveFilters ? "text-primary hover:underline underline-offset-4" : "text-neutral-400"}`}
          disabled={!hasActiveFilters}
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
}

function MobileWritingFiltersDialog({
  currentCategory,
  hasActiveFilters,
  onCategoryChange,
  onClearAll,
  onClose,
  onTopicToggle,
  topicOptions,
}: {
  currentCategory: WritingFilterValue;
  hasActiveFilters: boolean;
  onCategoryChange: (value: WritingFilterValue) => void;
  onClearAll: () => void;
  onClose: () => void;
  onTopicToggle: (topic: string) => void;
  topicOptions: WritingTopicOption[];
}): JSX.Element {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filter posts">
      <button
        type="button"
        aria-label="Close filters"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="absolute inset-x-4 top-6 max-h-[calc(100vh-3rem)] overflow-y-auto rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-black">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Filters</h2>
          <button type="button" onClick={onClose} className="text-sm text-muted hover:text-primary">
            Close
          </button>
        </div>
        <WritingIndexFilters
          currentCategory={currentCategory}
          hasActiveFilters={hasActiveFilters}
          onCategoryChange={onCategoryChange}
          onClearAll={onClearAll}
          onTopicToggle={onTopicToggle}
          topicOptions={topicOptions}
        />
      </div>
    </div>
  );
}

function WritingIndexRightRail(props: {
  currentCategory: WritingFilterValue;
  hasActiveFilters: boolean;
  onCategoryChange: (value: WritingFilterValue) => void;
  onClearAll: () => void;
  onTopicToggle: (topic: string) => void;
  topicOptions: WritingTopicOption[];
}): JSX.Element {
  return (
    <aside className="layout-rail layout-rail--right layout-rail--fit layout-rail--spacious">
      <WritingIndexFilters {...props} />
    </aside>
  );
}

function WritingIndexPage(): JSX.Element {
  useDocumentTitle("Writing");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const {
    categoryCounts,
    clearAll,
    currentCategory,
    feedPosts,
    featuredPosts,
    hasActiveFilters,
    searchInput,
    setCurrentCategory,
    setSearchInput,
    topicOptions,
    toggleTopic,
    visibleCount,
  } = useWritingFilters();

  return (
    <ThreeColFrame
      contentClassName="max-w-4xl"
      leftSlot={<WritingSectionIntro currentCategory={currentCategory} counts={categoryCounts} />}
      rightSlot={(
        <WritingIndexRightRail
          currentCategory={currentCategory}
          hasActiveFilters={hasActiveFilters}
          onCategoryChange={setCurrentCategory}
          onClearAll={clearAll}
          onTopicToggle={toggleTopic}
          topicOptions={topicOptions}
        />
      )}
      columnBreakpoint="lg"
    >
      <section className="pt-6 lg:pt-8">
        <div className="lg:hidden">
          <WritingSectionIntro
            currentCategory={currentCategory}
            counts={categoryCounts}
            className="mb-10 border-b border-neutral-200 pb-8 dark:border-neutral-800"
          />
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div />
        </div>
        <WritingSearchControls
          hasActiveFilters={hasActiveFilters}
          onChange={setSearchInput}
          onClearAll={clearAll}
          value={searchInput}
        />
        <div className="mt-6 flex items-center justify-between lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-primary dark:border-neutral-700"
          >
            Filters
          </button>
          <p className="text-sm text-muted">{visibleCount} visible</p>
        </div>
      </section>

      {isMobileFiltersOpen ? (
        <MobileWritingFiltersDialog
          currentCategory={currentCategory}
          hasActiveFilters={hasActiveFilters}
          onCategoryChange={setCurrentCategory}
          onClearAll={clearAll}
          onClose={() => setIsMobileFiltersOpen(false)}
          onTopicToggle={toggleTopic}
          topicOptions={topicOptions}
        />
      ) : null}

      {featuredPosts.length > 0 ? (
        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-lg font-semibold">Featured</h2>
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">Pinned at the top</p>
          </div>
          <div className="space-y-5" data-testid="featured-posts">
            {featuredPosts.map((post) => (
              <WritingFeedCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">All posts</h2>
          <p className="text-sm text-muted">{visibleCount} visible</p>
        </div>
        <div className="space-y-5" data-testid="writing-feed">
          {feedPosts.map((post) => (
            <WritingFeedCard key={post.slug} post={post} />
          ))}
          {feedPosts.length === 0 ? (
            <p className="text-sm text-muted">No posts match the current filters.</p>
          ) : null}
        </div>
      </section>
    </ThreeColFrame>
  );
}

function PaperCitationCard({ post }: { post: WritingPost }): JSX.Element | null {
  if (!post.paperTitle && !post.paperVenue && !post.paperUrl) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-neutral-200 p-4 text-sm dark:border-neutral-800">
      <p className="eyebrow-label">Paper</p>
      <div className="mt-3 space-y-1 text-primary">
        {post.paperTitle ? <div className="font-medium">{post.paperTitle}</div> : null}
        {(post.paperVenue || post.paperYear) ? (
          <div className="text-muted">
            {[post.paperVenue, post.paperYear].filter(Boolean).join(" · ")}
          </div>
        ) : null}
        {post.paperUrl ? (
          <a href={post.paperUrl} className="inline-block underline underline-offset-4" target="_blank" rel="noreferrer">
            Open paper
          </a>
        ) : null}
      </div>
    </div>
  );
}

function WritingArticleMeta({
  post,
  className,
}: {
  post: WritingPost;
  className?: string;
}): JSX.Element {
  return (
    <div className={className}>
      <div className="space-y-4 text-sm">
        <div>
          <p className="eyebrow-label">Category</p>
          <p className="mt-2 text-primary">{writingCategoryLabel(post.category)}</p>
        </div>
        {post.tags?.length ? (
          <div>
            <p className="eyebrow-label">Topics</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="pill-tag text-xs text-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        <div>
          <p className="eyebrow-label">Date</p>
          <time className="mt-2 block text-primary" dateTime={post.date}>{formatDateLong(post.date)}</time>
        </div>
        <div>
          <p className="eyebrow-label">Word count</p>
          <p className="mt-2 text-primary">{post.wordCount}</p>
        </div>
      </div>
    </div>
  );
}

function WritingArticleLeftRail({ post }: { post: WritingPost }): JSX.Element {
  return (
    <aside className="layout-rail layout-rail--left layout-rail--fit layout-rail--detail gap-8">
      {post.heroImage ? (
        <figure className="space-y-3">
          <img
            src={post.heroImage}
            alt={post.heroAlt ?? post.title}
            className="square-media rounded-2xl border border-neutral-200 dark:border-neutral-800"
          />
          {post.heroAlt ? <figcaption className="text-sm text-muted">{post.heroAlt}</figcaption> : null}
        </figure>
      ) : null}
      <WritingArticleMeta post={post} />
    </aside>
  );
}

function WritingTableOfContents({ headings }: { headings: WritingHeading[] }): JSX.Element {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");
  const pendingScrollTargetRef = useRef<{ id: string; top: number } | null>(null);

  useEffect(() => {
    setActiveId(headings[0]?.id ?? "");
    pendingScrollTargetRef.current = null;
  }, [headings]);

  useEffect(() => {
    if (headings.length === 0) {
      return;
    }

    const root = document.getElementById("scroll-center");
    if (!(root instanceof HTMLElement)) {
      return;
    }

    const syncActiveId = () => {
      setActiveId((currentId) => {
        const nextId = getWritingActiveHeadingId(headings, root);
        const pendingTarget = pendingScrollTargetRef.current;

        if (pendingTarget) {
          const hasReachedPendingTarget = Math.abs(root.scrollTop - pendingTarget.top) <= 8;
          if (hasReachedPendingTarget || nextId === pendingTarget.id) {
            pendingScrollTargetRef.current = null;
          } else if (currentId !== pendingTarget.id) {
            return pendingTarget.id;
          } else {
            return currentId;
          }
        }

        return currentId === nextId ? currentId : nextId;
      });
    };

    syncActiveId();
    root.addEventListener("scroll", syncActiveId, { passive: true });
    window.addEventListener("resize", syncActiveId);

    return () => {
      root.removeEventListener("scroll", syncActiveId);
      window.removeEventListener("resize", syncActiveId);
    };
  }, [headings]);

  if (headings.length === 0) {
    return (
      <div>
        <h2 className="eyebrow-label">Table of contents</h2>
        <p className="mt-4 text-sm text-muted">No section headings in this post.</p>
      </div>
    );
  }

  const scrollToHeading = (id: string) => {
    const root = document.getElementById("scroll-center");
    const element = document.getElementById(id);
    if (!(root instanceof HTMLElement) || !(element instanceof HTMLElement)) {
      return;
    }

    const targetTop = Math.max(0, getElementTopWithinScrollContainer(root, element) - getScrollMarginTop(element));
    pendingScrollTargetRef.current = { id, top: targetTop };
    root.scrollTo({ top: targetTop, behavior: "smooth" });
    setActiveId(id);
  };

  return (
    <div>
      <h2 className="eyebrow-label">Table of contents</h2>
      <nav className="mt-4">
        <ul className="space-y-3 text-sm">
          {headings.map((heading) => (
            <li key={heading.id} className={heading.depth === 3 ? "pl-4" : ""}>
              <button
                type="button"
                onClick={() => scrollToHeading(heading.id)}
                onMouseDown={(event) => event.preventDefault()}
                aria-current={activeId === heading.id ? "location" : undefined}
                className={`text-left ${activeId === heading.id ? "font-semibold text-primary" : "text-muted hover:text-primary"}`}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function WritingArticleRightRail({ post }: { post: WritingPost }): JSX.Element {
  return (
    <aside className="layout-rail layout-rail--right layout-rail--fit layout-rail--detail">
      <WritingTableOfContents headings={post.headings} />
    </aside>
  );
}

function WritingNotFound(): JSX.Element {
  return (
    <ThreeColFrame columnBreakpoint="lg">
      <section className="pt-6 lg:pt-0">
        <p className="eyebrow-label">Writing</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Post not found.</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          The writing post you requested does not exist.
        </p>
        <Link to="/writing" className="mt-6 inline-block underline underline-offset-4">
          Back to writing
        </Link>
      </section>
    </ThreeColFrame>
  );
}

function WritingArticlePage(): JSX.Element {
  const { slug } = useParams<{ slug: string }>();
  const post = getWritingPostBySlug(slug);

  useDocumentTitle(post ? `${post.title} | Writing` : "Writing");

  if (!post) {
    return <WritingNotFound />;
  }

  const relatedPosts = getRelatedWritingPosts(post);

  return (
    <ThreeColFrame
      contentClassName="max-w-none"
      leftSlot={<WritingArticleLeftRail post={post} />}
      rightSlot={<WritingArticleRightRail post={post} />}
      columnBreakpoint="lg"
    >
      <article className="pb-16 pt-6 lg:pt-0">
        {post.heroImage ? (
          <figure className="mb-8 space-y-3 lg:hidden">
            <img
              src={post.heroImage}
              alt={post.heroAlt ?? post.title}
              className="square-media rounded-2xl border border-neutral-200 dark:border-neutral-800"
            />
            {post.heroAlt ? <figcaption className="text-sm text-muted">{post.heroAlt}</figcaption> : null}
          </figure>
        ) : null}

        <WritingArticleHeader post={post} className="mb-10" />

        <RenderErrorBoundary
          resetKey={post.slug}
          fallback={
            <div className="mt-10 rounded-2xl border border-neutral-200 p-6 text-sm text-muted dark:border-neutral-800">
              This post failed to render. The rest of the page is still available.
            </div>
          }
        >
          <div className="writing-prose mt-10">
            <post.Content components={writingMdxComponents} />
          </div>
        </RenderErrorBoundary>

        {relatedPosts.length > 0 ? (
          <section className="mt-16 border-t border-neutral-200 pt-8 dark:border-neutral-800">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Related posts</h2>
              <span className="text-sm text-muted">{writingCategoryLabel(post.category)}</span>
            </div>
            <div className="space-y-5">
              {relatedPosts.map((relatedPost) => (
                <WritingFeedCard key={relatedPost.slug} post={relatedPost} />
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </ThreeColFrame>
  );
}

function InfoLeftRail(): JSX.Element {
  const info = infoContent;
  return (
    <aside className="layout-rail layout-rail--left layout-rail--fit layout-rail--spacious">
      <div>
        <h1 className="text-5xl font-semibold tracking-tight text-pop-accent">{info.title}</h1>
        <p className="mt-3 text-lg leading-relaxed text-neutral-500">{info.subtitle}</p>
      </div>
      <figure className="mt-10">
        <img src={info.portrait.src} alt={info.portrait.alt} className="square-media" />
        {info.portrait.credit ? <figcaption className="mt-3 text-sm text-neutral-500">{info.portrait.credit}</figcaption> : null}
      </figure>
      <div className="mt-10 space-y-3 text-sm text-muted">{info.contact.email}</div>
      <SocialLinks className="social-link-list mt-6 text-sm text-neutral-500" />
    </aside>
  );
}

function InfoRightRail(): JSX.Element {
  return (
    <aside className="layout-rail layout-rail--right layout-rail--fit layout-rail--spacious">
      <div>
        <h3 className="eyebrow-label">Skills</h3>
        <SkillsList skills={infoContent.skills} />
      </div>
      {infoContent.recognitions.length > 0 ? (
        <div className="mt-10 border-t border-neutral-200 pt-6">
          <h3 className="eyebrow-label">Recognitions</h3>
          <RecognitionsList recognitions={infoContent.recognitions} />
        </div>
      ) : null}
    </aside>
  );
}

function InfoPage(): JSX.Element {
  useDocumentTitle("Info");
  const info = infoContent;

  return (
    <ThreeColFrame contentClassName="max-w-none" leftSlot={<InfoLeftRail />} rightSlot={<InfoRightRail />} columnBreakpoint="lg">
      <section className="mobile-stack">
        <h1 className="text-4xl font-semibold tracking-tight">{info.title}</h1>
        <p className="text-base text-neutral-500">{info.subtitle}</p>
        <figure>
          <img src={info.portrait.src} alt={info.portrait.alt} className="square-media" />
          {info.portrait.credit ? <figcaption className="mt-3 text-sm text-neutral-500">{info.portrait.credit}</figcaption> : null}
        </figure>
        <div className="space-y-2 text-sm text-muted">{info.contact.email}</div>
        <SocialLinks className="flex flex-wrap gap-3 text-sm text-neutral-500" />
      </section>

      <article className="space-y-16 pt-6 lg:pt-8">
        <section>
          <h2 className="text-3xl font-semibold leading-tight text-primary md:text-4xl">Summary</h2>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-primary">{info.summary}</p>
        </section>

        <section>
          <h3 className="text-2xl font-semibold text-primary">Experience</h3>
          <div className="mt-6 space-y-10">
            {info.experience.map((role) => (
              <div key={`${role.organization}-${role.role}`} className="border-b border-neutral-200 pb-8 last:border-b-0 last:pb-0">
                <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
                  <div>
                    <h4 className="text-xl font-semibold text-primary">{role.role}</h4>
                    <div className="text-muted">
                      {role.organization} · {role.location}
                    </div>
                  </div>
                  <div className="text-sm text-neutral-500 md:text-right">
                    {role.start} - {role.end}
                  </div>
                </div>
                <ul className="mt-4 list-outside list-disc space-y-2 pl-5 text-base text-primary">
                  {role.accomplishments.map((accomplishment) => (
                    <li key={accomplishment}>{accomplishment}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-semibold text-primary">Education</h3>
          <div className="mt-6 space-y-8">
            {info.education.map((education) => (
              <div key={`${education.institution}-${education.program}`} className="border-b border-neutral-200 pb-6 last:border-b-0 last:pb-0">
                <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
                  <div>
                    <h4 className="text-xl font-semibold text-primary">{education.program}</h4>
                    <div className="text-muted">
                      {education.institution} · {education.location}
                    </div>
                  </div>
                  <div className="text-sm text-neutral-500 md:text-right">
                    {education.start} - {education.end}
                  </div>
                </div>
                <ul className="mt-4 list-outside list-disc space-y-2 pl-5 text-sm text-primary">
                  {education.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {info.publications.length > 0 ? (
          <section>
            <h3 className="text-2xl font-semibold text-primary">Publications</h3>
            <ul className="mt-6 space-y-4">
              {info.publications.map((publication) => (
                <li key={publication.title} className="border-b border-neutral-200 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
                    <div className="font-medium text-primary">{publication.title}</div>
                    {publication.year ? <div className="text-sm text-neutral-500">{publication.year}</div> : null}
                  </div>
                  <div className="text-sm text-muted">
                    {publication.link ? (
                      <a href={publication.link} className="hover:underline underline-offset-4" target="_blank" rel="noreferrer">
                        {publication.venue}
                      </a>
                    ) : (
                      publication.venue
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="space-y-8 lg:hidden">
          <div>
            <h3 className="eyebrow-label">Skills</h3>
            <SkillsList skills={info.skills} />
          </div>
          {info.recognitions.length > 0 ? (
            <div>
              <h3 className="eyebrow-label">Recognitions</h3>
              <RecognitionsList recognitions={info.recognitions} />
            </div>
          ) : null}
        </section>
      </article>
    </ThreeColFrame>
  );
}

export default function App(): JSX.Element {
  return (
    <ThemeProvider>
      <HashRouter>
        <ScrollToTop />
        <TopBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/info" element={<InfoPage />} />
          <Route path="/writing" element={<WritingIndexPage />} />
          <Route path="/writing/:slug" element={<WritingArticlePage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}
