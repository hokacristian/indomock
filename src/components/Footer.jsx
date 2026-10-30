import { Globe, ShieldCheck } from 'lucide-react';
import { Logo, IdBadge } from './Header.jsx';
import { GithubMark } from './icons.jsx';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <Logo />
            <IdBadge />
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-fg-muted">
            Mock data & live REST API rasa Indonesia — for mobile, frontend, and backend developers who are tired of
            &ldquo;John Doe, 123 Main St.&rdquo;
          </p>
          <p className="flex max-w-sm items-start gap-2 text-xs leading-relaxed text-fg-muted">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-accent-text" aria-hidden="true" />
            All data is synthetic. NIK, phone numbers and accounts are randomly generated and are not linked to real people.
          </p>
        </div>

        <div>
          <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-fg-muted">Endpoints</h2>
          <ul className="space-y-2 font-mono text-sm">
            {['users', 'products', 'transactions', 'custom', 'regions'].map((r) => (
              <li key={r}>
                <a href={`/api/v1/${r}${r === 'custom' ? '?fields=nama:full_name,hp:phone' : ''}`} target="_blank" rel="noreferrer" className="text-fg-muted transition-colors hover:text-accent-text">
                  /api/v1/{r}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-fg-muted">Credits</h2>
          <p className="text-sm text-fg">
            Crafted by{' '}
            <a href="https://hokacristian.com" target="_blank" rel="noreferrer" className="font-semibold underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent-text hover:decoration-accent">
              Hoka Cristian Son
            </a>
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href="https://hokacristian.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-fg-muted transition-colors hover:text-fg">
                <Globe className="size-4" aria-hidden="true" /> hokacristian.com
              </a>
            </li>
            <li>
              <a href="https://github.com/hokacristian" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-fg-muted transition-colors hover:text-fg">
                <GithubMark className="size-4" /> github.com/hokacristian
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-fg-muted sm:px-6">
          <span>© {new Date().getFullYear()} IndoMock · mock.hokacristian.com</span>
        </div>
      </div>
    </footer>
  );
}
