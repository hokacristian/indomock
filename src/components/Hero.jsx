import { ArrowRight, Fingerprint, Smartphone, MapPin, QrCode } from 'lucide-react';
import { API_PREFIX, origin } from '../lib/api.js';
import { CopyButton } from './ui/primitives.jsx';
import { IdBadge } from './Header.jsx';

const FEATURES = [
  { icon: Fingerprint, label: 'NIK 16 digit', detail: 'valid region + DOB structure' },
  { icon: Smartphone, label: '+62 8xx', detail: 'Telkomsel · Indosat · XL · Tri' },
  { icon: MapPin, label: '38 Provinsi', detail: 'RT/RW, kelurahan, kode pos' },
  { icon: QrCode, label: 'QRIS & VA', detail: 'GoPay · OVO · DANA · BCA · Mandiri' },
];

export default function Hero({ onNavigate }) {
  const base = `${origin()}${API_PREFIX}`;
  return (
    <section className="relative overflow-hidden border-b border-line" aria-labelledby="hero-title">
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
        <div className="flex flex-wrap items-center gap-2">
          <IdBadge />
          <span className="font-mono text-xs text-fg-muted">Mock data generator · Live public REST API</span>
        </div>
        <h1 id="hero-title" className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-fg [text-wrap:balance] sm:text-[2.6rem]">
          Realistic Indonesian mock data, served as a{' '}
          <span className="font-mono text-accent-text">live API</span>.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-fg-muted">
          Stop testing with &ldquo;John Doe&rdquo;. Generate citizens with valid-format NIK, operator-accurate phone numbers,
          warung inventory in Rupiah, and QRIS / e-wallet transactions — then simulate slow 3G and 5xx errors from your
          Flutter or React app.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex min-w-0 max-w-full items-center gap-2 rounded-lg border border-line-strong bg-surface py-1 pl-3 pr-1 shadow-card">
            <span className="rounded bg-accent-soft px-1.5 py-0.5 font-mono text-[11px] font-bold text-accent-text">GET</span>
            <code className="min-w-0 truncate font-mono text-sm text-fg" title={`${base}/users`}>
              {base}/users
            </code>
            <CopyButton text={`${base}/users`} label="Copy endpoint URL" toast="Endpoint URL copied" iconOnly variant="ghost" />
          </div>
          <button
            type="button"
            onClick={() => {
              onNavigate('playground');
              document.getElementById('main')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
          >
            Try it in the playground
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, label, detail }) => (
            <li key={label} className="flex items-start gap-3 rounded-xl border border-line bg-surface/70 p-3 backdrop-blur-sm">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-accent-text ring-1 ring-line">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold text-fg">{label}</p>
                <p className="text-xs leading-snug text-fg-muted">{detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
