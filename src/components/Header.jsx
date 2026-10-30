import { Moon, Sun, BookOpen, MapPinned } from 'lucide-react';
import { GithubMark } from './icons.jsx';

/** Merah-putih flag drawn in CSS so it renders identically on every OS (Windows shows 🇮🇩 as "ID"). */
export function IdBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface-2 py-0.5 pl-1 pr-2 font-mono text-[11px] font-semibold text-fg-muted ${className}`}
    >
      <span role="img" aria-label="Bendera Indonesia" className="flex h-3 w-[18px] flex-col overflow-hidden rounded-[3px] ring-1 ring-line-strong">
        <span className="flex-1 bg-merah" />
        <span className="flex-1 bg-white" />
      </span>
      ID
    </span>
  );
}

export function Logo() {
  return (
    <a href="/" className="group flex items-center gap-2.5 rounded-lg" aria-label="IndoMock home">
      <span className="relative grid size-8 place-items-center overflow-hidden rounded-lg bg-slate-900 ring-1 ring-line-strong">
        <span className="absolute inset-x-0 top-0 h-1/2 bg-merah" aria-hidden="true" />
        <span className="relative font-mono text-[13px] font-bold leading-none text-white">{'{}'}</span>
      </span>
      <span className="font-mono text-[15px] font-bold tracking-tight text-fg">
        Indo<span className="text-accent-text">Mock</span>
      </span>
    </a>
  );
}

const LINKS = [
  { href: '/api/v1', label: 'API Index', icon: BookOpen },
  { href: '/api/v1/regions', label: 'Regions', icon: MapPinned },
];

export default function Header({ theme, onToggleTheme }) {
  const isDark = theme === 'dark';
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Logo />
        <IdBadge className="hidden sm:inline-flex" />
        <span className="hidden rounded-md bg-accent-soft px-1.5 py-0.5 font-mono text-[11px] font-semibold text-accent-text md:inline">v1</span>

        <nav aria-label="Quick links" className="ml-auto flex items-center gap-1">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm text-fg-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="hidden md:inline">{label}</span>
              <span className="sr-only md:hidden">{label}</span>
            </a>
          ))}
          <a
            href="https://github.com/hokacristian"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm text-fg-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
          >
            <GithubMark className="size-4" />
            <span className="hidden md:inline">GitHub</span>
            <span className="sr-only md:hidden">GitHub</span>
          </a>
          <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Light mode' : 'Dark mode'}
            className="grid size-9 place-items-center rounded-lg border border-line text-fg-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
          >
            {isDark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
          </button>
        </nav>
      </div>
    </header>
  );
}
