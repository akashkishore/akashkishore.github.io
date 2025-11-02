import { type JSX, type ReactNode, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ReactComponent as MoonIcon } from "./assets/svgs/icons/moon.svg";
import { ReactComponent as SunIcon } from "./assets/svgs/icons/sun.svg";
import { ReactComponent as PlusIcon } from "./assets/svgs/icons/plus.svg";
import {
  HashRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { siteContent } from "./content/site";
import { homeContent } from "./content/home";
import { infoContent } from "./content/info";
import { workContent } from "./content/work";
import { contactContent } from "./content/contact";
import type { WorkItem, WorkType } from "./content/types";
import { ThemeProvider, useTheme } from "./theme";

const formatOrdinals = (text: string): string =>
  text.replace(/\b(\d+)(st|nd|rd|th)\b/g, (_match: string, number: string, suffix: string) => `${number}<sup>${suffix}</sup>`);

// ------- UI -------
function TopBar(): JSX.Element {
  const location = useLocation();
  const { pathname, hash } = location;
  const [menuOpen, setMenuOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
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
  const formattedTime = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(now);
  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const renderNavLinks = (linkClassName: (isActive: boolean) => string, onLinkClick?: () => void) =>
    siteContent.nav.map((n) => {
      const hashIndex = n.href.indexOf("#");
      let isActive = false;
      if (hashIndex >= 0) {
        const basePath = n.href.slice(0, hashIndex) || "/";
        const targetHash = n.href.slice(hashIndex);
        isActive = pathname === basePath && hash === targetHash;
      } else if (n.href === "/") {
        isActive = pathname === "/";
      } else {
        isActive = pathname === n.href || pathname.startsWith(`${n.href}/`);
      }
      return (
        <Link
          key={n.href}
          to={n.href}
          className={linkClassName(isActive)}
          onClick={onLinkClick}
        >
          {n.label}
        </Link>
      );
    });

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 backdrop-blur border-b border-neutral-200 dark:bg-neutral-900/70 dark:border-neutral-800">
      <div className="mx-auto max-w-[1400px] px-5 h-12 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {/* <span className="inline-block h-2 w-2 rounded-sm bg-neutral-900 dark:bg-neutral-100 transition-colors" /> */}
          <Link to="/" className="font-semibold hover:underline underline-offset-4 text-primary">❤️ {siteContent.name}</Link>
        </div>
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-4 text-muted">
          {renderNavLinks(
            (isActive) =>
              `hover:underline underline-offset-4 ${isActive ? "font-semibold text-primary" : "text-muted"}`,
          )}
        </nav>
        <motion.button
          type="button"
          className="md:hidden inline-flex items-center justify-center px-2 py-1 text-muted dark:border-neutral-700"
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          animate={{ rotate: menuOpen ? 45 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <span className="sr-only">Open navigation</span>
          <PlusIcon className="h-5 w-5" aria-hidden="true" />
        </motion.button>
        <div className="hidden md:flex items-center gap-3 text-primary">
          <span>
            {formattedDate} · {formattedTime} · {currentLocationLabel}
          </span>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded px-2 py-1 text-xs uppercase tracking-[0.2em] text-muted hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            aria-label={`Switch to ${toggleLabel.toLowerCase()} mode`}
            aria-pressed={isDark}
          >
            {/* <span>{toggleLabel}</span> */}
            {isDark ? (
              <SunIcon className="h-4 w-4 text-yellow-400" aria-hidden="true" />
            ) : (
              <MoonIcon className="h-4 w-4 text-blue-900" aria-hidden="true" />
            )}
          </button>
          {/* <a href="#contact" className="hover:underline underline-offset-4 text-primary dark:text-neutral-100">Book a Call</a> */}
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="overlay"
              className="fixed inset-0 z-30 bg-black/40 md:hidden"
              onClick={closeMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              key="mobile-nav"
              className="md:hidden fixed top-12 left-0 right-0 z-40 bg-white border-b border-neutral-200 shadow-sm dark:bg-neutral-900 dark:border-neutral-800 dark:shadow-[0_10px_30px_rgba(15,23,42,0.35)]"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
            <nav className="flex flex-col px-5 py-4 gap-3 text-primary">
              {renderNavLinks(
                (isActive) =>
                  `text-base ${isActive ? "font-semibold text-primary" : "text-muted"}`,
                closeMenu,
              )}
              <div className="pt-3 mt-3 border-t border-neutral-200 flex flex-col gap-2 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <span>
                  {formattedDate} · {formattedTime} · {currentLocationLabel}
                </span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-2 px-2 py-1 text-xs uppercase tracking-[0.2em] text-muted hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800 w-min"
                  aria-label={`Switch to ${toggleLabel.toLowerCase()} mode`}
                  aria-pressed={isDark}
                >
                  {/* <span>{toggleLabel}</span> */}
                  {isDark ? (
                    <SunIcon className="h-4 w-4 text-yellow-400" aria-hidden="true" />
                  ) : (
                    <MoonIcon className="h-4 w-4 text-blue-900" aria-hidden="true" />
                  )}
                </button>
                {/* <a href="#contact" className="underline underline-offset-4 text-neutral-700 dark:text-neutral-200">Book a Call</a> */}
              </div>
            </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

function LeftRail(): JSX.Element {
  return (
    <aside className="hidden xl:block w-full sticky top-12 h-[calc(100vh-3rem)] pr-10 pt-10 xl:pt-20">
      <div className="h-full flex flex-col">
        <div>
          <h2 className="text-5xl leading-[0.95] font-semibold tracking-tight">Hello!<br/>I'm {siteContent.name}.</h2>
        </div>
        <div className="mt-8 flex flex-col gap-2 text-muted">
          {siteContent.socials.map((s) => (
            <a key={s.label} href={s.href} className="inline-flex items-center gap-2 hover:underline underline-offset-4">
              <img src={s.icon} alt="" className={["h-4 w-4", s.iconClassName].filter(Boolean).join(" ")} />
              <span>{s.label}</span>
            </a>
          ))}
        </div>
        <div className="mt-auto pb-8">
          <ul className="divide-y divide-neutral-400 text-sm font-semibold dark:divide-neutral-800">
            {siteContent.categories.map((c) => (
              <li key={c} className="py-3 flex items-center justify-between"><span>{c}</span>
              {/* <span className="text-neutral-400">›</span> */}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

function RightRail(): JSX.Element {
  // const telLink = siteContent.metaRight.phone.replace(/\D+/g, "");
  return (
    <aside className="hidden xl:block sticky top-12 h-[calc(100vh-3rem)] pl-8 pt-10 xl:pt-20">
      <div className="h-full flex flex-col">
        {/* <div className="pt-6 text-sm text-muted dark:text-neutral-300">
          <div className="flex items-start gap-2"><span className="text-neutral-400">✦</span><span>{siteContent.metaRight.status}</span></div>
        </div> */}
        <div>
          <img src={siteContent.portrait.src} alt={siteContent.portrait.alt} className="w-full aspect-[4/4] object-cover rounded" />
          <div className="mt-4 text-center text-sm">
            {/* <div>{siteContent.metaRight.role}</div>
            <div className="text-muted">{`Currently in ${siteContent.currentLocation.label}`}</div> */}
            {/* <div className="text-neutral-400">{siteContent.metaRight.since}</div> */}
          </div>
        </div>
        <div className="mt-auto pb-10 text-sm">
          <div className="space-y-1 text-muted">
            <a href={`mailto:${siteContent.metaRight.email}`} className="block hover:underline underline-offset-4 text-primary">{siteContent.metaRight.email}</a>
            {/* <a href={`tel:${telLink}`} className="block hover:underline underline-offset-4">{siteContent.metaRight.phone}</a> */}
          </div>
          <div className="mt-4 text-neutral-400 text-xs">© {new Date().getFullYear()}</div>
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
}: {
  children: ReactNode;
  contentClassName?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
}): JSX.Element {
  return (
    <div className="mx-auto max-w-[1400px] px-5 xl:px-0 pt-16 xl:pt-0 xl:mt-12 xl:h-[calc(100vh-3rem)]">
      <div className="flex flex-col gap-y-12 xl:flex-row xl:gap-x-10 xl:gap-y-0 xl:h-full">
        <div className="hidden xl:flex xl:flex-none xl:basis-[300px] w-[300px] bg-[var(--layout-left-rail-bg)] xl:border-r border-neutral-200 dark:border-neutral-800">
          {leftSlot ?? <LeftRail />}
        </div>
        <main className="bg-[var(--layout-center-bg)] pb-20 xl:px-8 xl:flex-1 xl:h-full xl:overflow-y-auto" id="scroll-center">
          <div className={`mx-auto w-full pt-10 xl:pt-12 ${contentClassName ?? "max-w-3xl"}`}>{children}</div>
        </main>
        <div className="hidden xl:flex xl:flex-shrink-0 w-[280px] bg-[var(--layout-right-rail-bg)] xl:border-l border-neutral-200 dark:border-neutral-800">
          {rightSlot ?? <RightRail />}
        </div>
      </div>
    </div>
  );
}

// ------------ PAGES ------------
function HomePage(): JSX.Element {
  const formattedHeadline = formatOrdinals(homeContent.headline);
  return (
    <ThreeColFrame>
      <section className="xl:hidden pt-6 space-y-6">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight leading-tight">Hello!<br/>I'm {siteContent.name}.</h2>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted">
          {siteContent.socials.map((s) => (
            <a key={s.label} href={s.href} className="inline-flex items-center justify-center">
              <img src={s.icon} alt={s.label} className={["h-4 w-4", s.iconClassName].filter(Boolean).join(" ")} />
            </a>
          ))}
        </div>
        <div className="border-t border-neutral-400 pt-4">
          <ul className="divide-y divide-neutral-400 text-sm font-semibold dark:divide-neutral-800">
            {siteContent.categories.map((c) => (
              <li key={c} className="py-3 flex items-center justify-between">
                <span>{c}</span>
                {/* <span className="text-neutral-400">›</span> */}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="xl:hidden border-t border-neutral-200 mt-10 pt-6 space-y-6 text-sm">
        {/* <div className="flex items-start gap-2 text-muted">
          <span className="text-neutral-400">✦</span>
          <span>{siteContent.metaRight.status}</span>
        </div> */}
        <div>
          <img src={siteContent.portrait.src} alt={siteContent.portrait.alt} className="w-full aspect-[4/4] object-cover rounded" />
          <div className="mt-3 text-center">
            {/* <div className="font-medium text-primary">{siteContent.metaRight.role}</div>
            <div className="text-muted">{siteContent.metaRight.location}</div> */}
            {/* <div className="text-neutral-400 text-xs">{siteContent.metaRight.since}</div> */}
          </div>
        </div>
        <div className="space-y-2">
          <a href={`mailto:${siteContent.metaRight.email}`} className="block underline underline-offset-4">{siteContent.metaRight.email}</a>
          {/* <a href={`tel:${siteContent.metaRight.phone.replace(/\D+/g, "")}`} className="block text-muted underline underline-offset-4">{siteContent.metaRight.phone}</a> */}
        </div>
      </section>
      <section className="pt-6 xl:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl md:text-2xl leading-snug"
          dangerouslySetInnerHTML={{ __html: formattedHeadline }}
        />
      </section>
      <br />
      <span className="text-2xl text-muted">This website is a work in progress. 👷🏾‍♂️</span>
      {/* <section className="mt-20">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-lg font-semibold">Selected work</h2>
          <Link to="/work" className="text-xs text-muted hover:underline underline-offset-4">View all</Link>
        </div>
        <div className="space-y-10">
          {workContent.projects.slice(0, 2).map((w) => (
            <article key={w.id}>
              <Link to={`/work/${w.id}`} className="group block">
                <img src={w.cover} alt={w.title} className="w-full aspect-[16/9] object-cover rounded" />
                <div className="mt-2 flex items-center justify-between">
                  <h3 className="text-base md:text-lg font-medium group-hover:underline underline-offset-4">{w.title} • {w.role}</h3>
                  <span className="text-xs text-neutral-500">{w.year}</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section> */}
      <section id="contact" className="mb-24 mt-24">
        <h3 className="text-lg font-semibold mb-2">{contactContent.heading}</h3>
        <p className="text-primary">
          {contactContent.description}{" "}
          <a href={`mailto:${contactContent.email}`} className="underline underline-offset-4">
            {contactContent.email}
          </a>
        </p>
      </section>
    </ThreeColFrame>
  );
}

function WorkFilter({ value, onChange }: { value: "All" | WorkType; onChange: (v: "All" | WorkType) => void }): JSX.Element {
  return (
    <ul className="text-sm text-muted">
      {workContent.filterTabs.map((tab) => (
        <li key={tab}>
          <button onClick={() => onChange(tab)} className={`block py-0.5 hover:underline underline-offset-4 ${value === tab ? 'font-semibold text-primary' : ''}`}>{tab}</button>
        </li>
      ))}
    </ul>
  );
}

function WorkIndexPage(): JSX.Element {
  const [search, setSearch] = useSearchParams();
  const current = (search.get('type') as WorkType | null) || 'All';
  const setType = (t: "All" | WorkType) => {
    const next = new URLSearchParams(search);
    if (t === 'All') next.delete('type'); else next.set('type', t);
    setSearch(next, { replace: true });
  };
  const items = workContent.projects.filter((w) => current === 'All' || w.types.includes(current));

  return (
    <ThreeColFrame>
      <section className="pt-6 xl:pt-0">
        <div className="flex items-start justify-between gap-6">
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">My Work.</h1>
          <div className="hidden md:block"><WorkFilter value={current} onChange={setType} /></div>
        </div>
      </section>

      <section className="mt-8">
        <div className="md:hidden mb-4"><WorkFilter value={current} onChange={setType} /></div>
        <div className="grid md:grid-cols-2 gap-8">
          {items.map((w) => (
            <article key={w.id}>
              <Link to={`/work/${w.id}`} className="group block">
                <img src={w.cover} alt={w.title} className="w-full aspect-[4/4] object-cover rounded" />
                <div className="mt-1 flex items-center justify-between">
                  <h3 className="text-sm md:text-base font-medium group-hover:underline underline-offset-4">{w.title} • {w.role}</h3>
                  <span className="text-xs text-neutral-500">’{w.year}</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </ThreeColFrame>
  );
}

function WorkDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const proj = workContent.projects.find((p) => p.id === id);
  if (!proj) {
    return (
      <ThreeColFrame>
        <div className="pt-6 xl:pt-0"><p className="text-sm text-neutral-500">Project not found.</p><button onClick={() => nav(-1)} className="underline underline-offset-4 mt-2">Go back</button></div>
      </ThreeColFrame>
    );
  }

  const leftSlot = <WorkDetailLeftRail proj={proj} />;
  const rightSlot = <WorkDetailRightRail proj={proj} />;

  return (
    <ThreeColFrame contentClassName="max-w-none" leftSlot={leftSlot} rightSlot={rightSlot}>
      <article className="pt-6 xl:pt-0 space-y-16 xl:space-y-0 xl:[&>*:not(:first-child)]:mt-16">
        <section>
          <p className="text-2xl leading-snug text-primary md:text-3xl md:leading-[1.4]">{proj.summary}</p>
        </section>

        <section className="xl:hidden border-t border-neutral-200 pt-6 text-sm space-y-6">
          <div>
            <h3 className="text-primary font-semibold uppercase tracking-[0.18em] text-xs">Challenge</h3>
            <p className="mt-3 leading-relaxed text-primary">{proj.challenge}</p>
          </div>
          <div>
            <h3 className="text-primary font-semibold uppercase tracking-[0.18em] text-xs">Solution</h3>
            <p className="mt-3 leading-relaxed text-primary">{proj.solution}</p>
          </div>
        </section>

        <section>
          <div className="flex items-baseline justify-between text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            <span>Live project</span>
            <span>© {proj.title}</span>
          </div>
          <div className="mt-6 space-y-10">
            {proj.images.map((src, i) => (
              <img key={src} src={src} alt={`${proj.title} ${i + 1}`} className="w-full object-cover rounded" />
            ))}
          </div>
        </section>
      </article>
    </ThreeColFrame>
  );
}

function WorkDetailLeftRail({ proj }: { proj: WorkItem }): JSX.Element {
  return (
    <aside className="xl:sticky top-12 h-fit flex flex-col gap-8 xl:border-r xl:border-neutral-200 xl:pr-10 pt-10 xl:pt-12 w-full">
      <div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight">{proj.title}</h1>
      </div>
      <figure className="mt-2">
        <img src={proj.cover} alt={proj.title} className="w-full aspect-[4/4] object-cover rounded" />
        <figcaption className="text-neutral-500 mt-3 text-sm">{proj.role}</figcaption>
      </figure>
      <dl className="divide-y divide-neutral-200 text-sm">
        <div className="flex justify-between py-3">
          <dt className="text-neutral-500 uppercase tracking-[0.18em] text-xs">Year</dt>
          <dd className="font-medium text-primary">’{proj.year}</dd>
        </div>
        <div className="flex justify-between py-3">
          <dt className="text-neutral-500 uppercase tracking-[0.18em] text-xs">Client</dt>
          <dd className="font-medium text-primary">{proj.client}</dd>
        </div>
        <div className="flex justify-between py-3">
          <dt className="text-neutral-500 uppercase tracking-[0.18em] text-xs">Service</dt>
          <dd className="font-medium text-primary">{proj.service}</dd>
        </div>
      </dl>
    </aside>
  );
}

function WorkDetailRightRail({ proj }: { proj: WorkItem }): JSX.Element {
  return (
    <aside className="hidden xl:flex xl:flex-col border-l border-neutral-200 pl-10 pt-10 xl:pt-12 text-sm">
      <div className="border-b border-neutral-200 pb-6">
        <h3 className="text-primary font-semibold uppercase tracking-[0.18em] text-xs">Challenge</h3>
        <p className="mt-3 leading-relaxed text-primary">{proj.challenge}</p>
      </div>
      <div className="pt-6">
        <h3 className="text-primary font-semibold uppercase tracking-[0.18em] text-xs">Solution</h3>
        <p className="mt-3 leading-relaxed text-primary">{proj.solution}</p>
      </div>
    </aside>
  );
}

function InfoLeftRail(): JSX.Element {
  const info = infoContent;
  const contact = info.contact;
  const telLink = contact.phone ? contact.phone.replace(/\D+/g, "") : "";
  return (
    <aside className="hidden xl:flex xl:flex-col sticky top-12 h-fit pr-10 pt-10 xl:pt-12 w-full">
      <div>
        <h1 className="text-5xl font-semibold tracking-tight">{info.title}</h1>
        <p className="mt-3 text-neutral-500 text-lg leading-relaxed">{info.subtitle}</p>
      </div>
      <figure className="mt-10">
        <img src={info.portrait.src} alt={info.portrait.alt} className="w-full aspect-[4/4] object-cover rounded" />
        {info.portrait.credit ? <figcaption className="text-neutral-500 mt-3 text-sm">{info.portrait.credit}</figcaption> : null}
      </figure>
      <div className="mt-10 space-y-3 text-sm text-muted">
        <a href={`mailto:${contact.email}`} className="hover:underline underline-offset-4">{contact.email}</a>
        {/* {contact.phone ? (
          <a href={`tel:${telLink}`} className="hover:underline underline-offset-4">
            {contact.phone}
          </a>
        ) : null} */}
        {/* <div className="text-neutral-500">{contact.location}</div> */}
        {/* {contact.linkedin ? (
          <a href={contact.linkedin} className="hover:underline underline-offset-4" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        ) : null} */}
        {/* {contact.website ? (
          <a href={contact.website} className="hover:underline underline-offset-4" target="_blank" rel="noreferrer">
            Portfolio
          </a>
        ) : null} */}
      </div>
      <div className="mt-6 flex flex-col gap-2 text-sm text-neutral-500">
        {siteContent.socials.map((social) => (
          <a key={social.label} href={social.href} className="inline-flex items-center gap-2 hover:underline underline-offset-4" target="_blank" rel="noreferrer">
            <img src={social.icon} alt="" className={["h-4 w-4", social.iconClassName].filter(Boolean).join(" ")} />
            <span>{social.label}</span>
          </a>
        ))}
      </div>
    </aside>
  );
}

function InfoRightRail(): JSX.Element {
  const info = infoContent;
  return (
    <aside className="hidden xl:flex xl:flex-col xl:sticky top-12 h-[calc(100vh-3rem)] pl-10 pt-10 xl:pt-20 w-full">
      <div>
        <h3 className="uppercase tracking-[0.18em] text-xs text-neutral-500">Skills</h3>
        <ul className="mt-4 space-y-5">
          {info.skills.map((skill) => (
            <li key={skill.category}>
              <div className="font-medium text-primary">{skill.category}</div>
              <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted">
                {skill.items.map((item) => (
                  <span key={item} className="rounded-full border border-neutral-200 px-2.5 py-1">
                    {item}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
      {info.recognitions.length > 0 ? (
        <div className="mt-10 border-t border-neutral-200 pt-6">
          <h3 className="uppercase tracking-[0.18em] text-xs text-neutral-500">Recognitions</h3>
          <ul className="mt-4 space-y-4 text-sm">
            {info.recognitions.map((rec) => (
              <li key={`${rec.year}-${rec.title}`} className="border-b border-neutral-200 pb-4 last:border-b-0 last:pb-0">
                <div className="text-neutral-400">{rec.year}</div>
                <div className="font-medium text-primary">{rec.title}</div>
                {rec.by ? <div className="text-muted">{rec.by}</div> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}

function InfoPage(): JSX.Element {
  const info = infoContent;
  const contact = info.contact;
  const telLink = contact.phone ? contact.phone.replace(/\D+/g, "") : "";
  return (
    <ThreeColFrame contentClassName="max-w-none" leftSlot={<InfoLeftRail />} rightSlot={<InfoRightRail />}>
      <section className="lg:hidden space-y-6">
        <h1 className="text-4xl font-semibold tracking-tight">{info.title}</h1>
        <p className="text-neutral-500 text-base">{info.subtitle}</p>
        <figure>
          <img src={info.portrait.src} alt={info.portrait.alt} className="w-full aspect-[4/4] object-cover rounded" />
          {info.portrait.credit ? <figcaption className="text-neutral-500 mt-3 text-sm">{info.portrait.credit}</figcaption> : null}
        </figure>
        <div className="space-y-2 text-sm text-muted">
          <a href={`mailto:${contact.email}`} className="hover:underline underline-offset-4">{contact.email}</a>
          {/* {contact.phone ? (
            <a href={`tel:${telLink}`} className="hover:underline underline-offset-4">
              {contact.phone}
            </a>
          ) : null}
          <div className="text-neutral-500">{contact.location}</div>
          {contact.linkedin ? (
            <a href={contact.linkedin} className="hover:underline underline-offset-4" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          ) : null}
          {contact.website ? (
            <a href={contact.website} className="hover:underline underline-offset-4" target="_blank" rel="noreferrer">
              Portfolio
            </a>
          ) : null} */}
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-neutral-500">
          {siteContent.socials.map((social) => (
            <a key={social.label} href={social.href} className="inline-flex items-center gap-2 hover:underline underline-offset-4" target="_blank" rel="noreferrer">
              <img src={social.icon} alt="" className={["h-4 w-4", social.iconClassName].filter(Boolean).join(" ")} />
              <span>{social.label}</span>
            </a>
          ))}
        </div>
      </section>

      <article className="pt-6 lg:pt-8 space-y-16">
        <section>
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight text-primary">Summary</h2>
          <p className="mt-5 text-primary text-lg leading-relaxed max-w-3xl">{info.summary}</p>
        </section>

        <section>
          <h3 className="text-2xl font-semibold text-primary">Experience</h3>
          <div className="mt-6 space-y-10">
            {info.experience.map((role) => (
              <div key={`${role.organization}-${role.role}`} className="border-b border-neutral-200 pb-8 last:border-b-0 last:pb-0">
                <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
                  <div>
                    <h4 className="text-xl font-semibold text-primary">{role.role}</h4>
                    <div className="text-muted">{role.organization} · {role.location}</div>
                  </div>
                  <div className="text-sm text-neutral-500 md:text-right">
                    {role.start} — {role.end}
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-primary list-disc list-outside pl-5">
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
            {info.education.map((edu) => (
              <div key={`${edu.institution}-${edu.program}`} className="border-b border-neutral-200 pb-6 last:border-b-0 last:pb-0">
                <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
                  <div>
                    <h4 className="text-xl font-semibold text-primary">{edu.program}</h4>
                    <div className="text-muted">{edu.institution} · {edu.location}</div>
                  </div>
                  <div className="text-sm text-neutral-500 md:text-right">
                    {edu.start} — {edu.end}
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-primary list-disc list-outside pl-5">
                  {edu.notes.map((note) => (
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
              {info.publications.map((pub) => (
                <li key={pub.title} className="border-b border-neutral-200 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
                    <div className="font-medium text-primary">{pub.title}</div>
                    {pub.year ? <div className="text-sm text-neutral-500">{pub.year}</div> : null}
                  </div>
                  <div className="text-sm text-muted">
                    {pub.link ? (
                      <a href={pub.link} className="hover:underline underline-offset-4" target="_blank" rel="noreferrer">
                        {pub.venue}
                      </a>
                    ) : (
                      pub.venue
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="lg:hidden space-y-8">
          <div>
            <h3 className="uppercase tracking-[0.18em] text-xs text-neutral-500">Skills</h3>
            <ul className="mt-4 space-y-5">
              {info.skills.map((skill) => (
                <li key={skill.category}>
                  <div className="font-medium text-primary">{skill.category}</div>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted">
                    {skill.items.map((item) => (
                      <span key={item} className="rounded-full border border-neutral-200 px-2.5 py-1">
                        {item}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {info.recognitions.length > 0 ? (
            <div>
              <h3 className="uppercase tracking-[0.18em] text-xs text-neutral-500">Recognitions</h3>
              <ul className="mt-4 space-y-4 text-sm">
                {info.recognitions.map((rec) => (
                  <li key={`${rec.year}-${rec.title}`} className="border-b border-neutral-200 pb-4 last:border-b-0 last:pb-0">
                    <div className="text-neutral-400">{rec.year}</div>
                    <div className="font-medium text-primary">{rec.title}</div>
                    {rec.by ? <div className="text-muted">{rec.by}</div> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </article>
    </ThreeColFrame>
  );
}

// ------------ APP ------------
export default function App(): JSX.Element {
  return (
    <ThemeProvider>
      <HashRouter>
        <TopBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/info" element={<InfoPage />} />
          {/* <Route path="/work" element={<WorkIndexPage />} /> */}
          <Route path="/work/:id" element={<WorkDetailPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}
