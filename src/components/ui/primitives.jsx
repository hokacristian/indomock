import { forwardRef, useId } from 'react';
import { Check, Copy, Loader2 } from 'lucide-react';
import { useCopy } from '../../lib/hooks.js';
import { useToast } from '../../lib/context.jsx';

const cx = (...c) => c.filter(Boolean).join(' ');
export { cx };

const VARIANTS = {
  primary: 'bg-accent text-accent-fg hover:bg-accent-hover border-transparent font-semibold',
  secondary: 'bg-surface-2 text-fg border-line-strong hover:bg-surface-3',
  ghost: 'bg-transparent text-fg-muted border-transparent hover:bg-surface-2 hover:text-fg',
  danger: 'bg-danger-soft text-danger border-transparent hover:brightness-110',
};
const SIZES = {
  sm: 'h-8 px-2.5 text-xs gap-1.5',
  md: 'h-10 px-3.5 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
};

export const Button = forwardRef(function Button(
  { variant = 'secondary', size = 'md', loading = false, icon: Icon, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        'inline-flex shrink-0 select-none items-center justify-center rounded-lg border font-medium',
        'transition-[background-color,color,border-color,transform] duration-150 active:scale-[0.97]',
        'disabled:opacity-50 disabled:active:scale-100',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className={size === 'sm' ? 'size-3.5' : 'size-4'} aria-hidden="true" />
      )}
      {children}
    </button>
  );
});

export function CopyButton({ text, label = 'Copy', toast, size = 'sm', variant = 'secondary', className, iconOnly = false }) {
  const [copied, copy] = useCopy();
  const push = useToast();
  const onClick = async () => {
    const ok = await copy(typeof text === 'function' ? text() : text);
    if (toast) push(ok ? toast : 'Copy failed — select and copy manually.', ok ? 'success' : 'error');
  };
  return (
    <Button
      size={size}
      variant={variant}
      onClick={onClick}
      icon={copied ? Check : Copy}
      className={cx(copied && 'text-accent-text', iconOnly && 'w-8 px-0', className)}
      aria-label={iconOnly ? label : undefined}
      title={iconOnly ? label : undefined}
    >
      {!iconOnly && <span aria-live="polite">{copied ? 'Copied' : label}</span>}
    </Button>
  );
}

/** Accessible radio-group styled as a segmented control. */
export function Segmented({ label, options, value, onChange, size = 'md', className }) {
  const name = useId();
  return (
    <div role="radiogroup" aria-label={label} className={cx('inline-flex rounded-lg border border-line bg-surface-2 p-1', className)}>
      {options.map((o) => {
        const active = o.value === value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            name={name}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              const idx = options.findIndex((x) => x.value === value);
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                onChange(options[(idx + 1) % options.length].value);
                e.currentTarget.parentElement.children[(idx + 1) % options.length]?.focus();
              }
              if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                const n = (idx - 1 + options.length) % options.length;
                onChange(options[n].value);
                e.currentTarget.parentElement.children[n]?.focus();
              }
            }}
            className={cx(
              'inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors duration-150',
              size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3 text-sm',
              active ? 'bg-surface text-fg shadow-card ring-1 ring-line-strong' : 'text-fg-muted hover:text-fg',
            )}
          >
            {Icon && <Icon className="size-3.5" aria-hidden="true" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Field({ label, hint, htmlFor, children, className }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-fg-muted">{hint}</p>}
    </div>
  );
}

export function Select({ id, value, onChange, children, className, ...props }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={cx('input appearance-none bg-[length:16px] bg-[right_0.6rem_center] bg-no-repeat pr-8', className)} style={{ backgroundImage: 'var(--im-chevron)' }} {...props}>
      {children}
    </select>
  );
}

const STATUS_TONE = (s) =>
  s >= 500 ? 'bg-danger-soft text-danger ring-danger/30'
    : s >= 400 ? 'bg-warn-soft text-warn ring-warn/30'
      : s >= 200 ? 'bg-accent-soft text-accent-text ring-accent/30'
        : 'bg-surface-2 text-fg-muted ring-line-strong';

/** HTTP status pill — colour plus explicit code + text (never colour alone). */
export function StatusBadge({ status, text, className }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-xs font-semibold ring-1 ring-inset', STATUS_TONE(status), className)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {status} {text}
    </span>
  );
}

export function MethodBadge({ method = 'GET' }) {
  const tone = method === 'POST' ? 'text-info bg-info-soft' : 'text-accent-text bg-accent-soft';
  return <span className={cx('rounded px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-wide', tone)}>{method}</span>;
}

export function Card({ className, children, ...props }) {
  return (
    <section className={cx('card', className)} {...props}>
      {children}
    </section>
  );
}

export function CardHeader({ title, description, icon: Icon, actions, id }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon && (
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-surface-2 text-fg-muted ring-1 ring-line">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <h2 id={id} className="text-sm font-semibold text-fg">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-fg-muted">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
