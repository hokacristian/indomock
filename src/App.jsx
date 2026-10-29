import { Suspense, lazy, useRef } from 'react';
import { DatabaseZap, TerminalSquare, Gauge } from 'lucide-react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Hero from './components/Hero.jsx';
import { useHashTab, useTheme } from './lib/hooks.js';
import { cx } from './components/ui/primitives.jsx';

const Generator = lazy(() => import('./tabs/Generator.jsx'));
const Playground = lazy(() => import('./tabs/Playground.jsx'));
const NetworkSimulator = lazy(() => import('./tabs/NetworkSimulator.jsx'));

const TABS = [
  { id: 'generator', label: 'Data Generator & Exporter', short: 'Generator', icon: DatabaseZap, Component: Generator },
  { id: 'playground', label: 'Live API Playground', short: 'Playground', icon: TerminalSquare, Component: Playground },
  { id: 'simulator', label: 'Network & Error Simulator', short: 'Simulator', icon: Gauge, Component: NetworkSimulator },
];

function PanelFallback() {
  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]" aria-busy="true" aria-label="Loading panel">
      <div className="skeleton h-96 rounded-xl" />
      <div className="skeleton h-96 rounded-xl" />
    </div>
  );
}

export default function App() {
  const { theme, toggle } = useTheme();
  const [tab, setTab] = useHashTab(TABS.map((t) => t.id), 'generator');
  const tabRefs = useRef({});

  const onTabKey = (e) => {
    const idx = TABS.findIndex((t) => t.id === tab);
    let next;
    if (e.key === 'ArrowRight') next = TABS[(idx + 1) % TABS.length];
    if (e.key === 'ArrowLeft') next = TABS[(idx - 1 + TABS.length) % TABS.length];
    if (e.key === 'Home') next = TABS[0];
    if (e.key === 'End') next = TABS[TABS.length - 1];
    if (next) {
      e.preventDefault();
      setTab(next.id);
      tabRefs.current[next.id]?.focus();
    }
  };

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-fg">
        Skip to content
      </a>
      <Header theme={theme} onToggleTheme={toggle} />
      <Hero onNavigate={setTab} />

      <main id="main" className="mx-auto max-w-7xl px-4 sm:px-6">
        <div
          role="tablist"
          aria-label="IndoMock tools"
          onKeyDown={onTabKey}
          className="sticky top-14 z-30 -mx-4 mb-6 flex gap-1 overflow-x-auto border-b border-line bg-canvas/85 px-4 backdrop-blur-md sm:mx-0 sm:px-0"
        >
          {TABS.map(({ id, label, short, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                ref={(el) => (tabRefs.current[id] = el)}
                id={`tab-${id}`}
                role="tab"
                type="button"
                aria-selected={active}
                aria-controls={`panel-${id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setTab(id)}
                className={cx(
                  'relative -mb-px inline-flex h-12 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors duration-150 sm:px-4',
                  active ? 'border-accent text-fg' : 'border-transparent text-fg-muted hover:border-line-strong hover:text-fg',
                )}
              >
                <Icon className={cx('size-4', active && 'text-accent-text')} aria-hidden="true" />
                <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>

        {TABS.map(({ id, Component }) => (
          <div key={id} id={`panel-${id}`} role="tabpanel" aria-labelledby={`tab-${id}`} hidden={tab !== id} tabIndex={-1}>
            {tab === id && (
              <Suspense fallback={<PanelFallback />}>
                <div className="animate-fade-up">
                  <Component />
                </div>
              </Suspense>
            )}
          </div>
        ))}
      </main>

      <Footer />
    </>
  );
}
