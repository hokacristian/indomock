import { useId, useRef } from 'react';
import { Code2 } from 'lucide-react';
import { CopyButton, cx } from './ui/primitives.jsx';
import { CodeView } from './ui/CodeView.jsx';

/** Tabbed, copyable code snippets. `snippets`: [{ id, label, code }] */
export default function SnippetTabs({ snippets, active, onChange, title = 'Code snippets', maxHeight = '26rem' }) {
  const uid = useId();
  const refs = useRef({});
  const current = snippets.find((s) => s.id === active) ?? snippets[0];

  const onKey = (e) => {
    const idx = snippets.findIndex((s) => s.id === current.id);
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = snippets[(idx + step + snippets.length) % snippets.length];
    onChange(next.id);
    refs.current[next.id]?.focus();
  };

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 sm:px-5">
        <div role="tablist" aria-label={title} onKeyDown={onKey} className="-mb-px flex min-w-0 gap-1 overflow-x-auto">
          <Code2 className="my-auto mr-1 size-4 shrink-0 text-fg-muted" aria-hidden="true" />
          {snippets.map((s) => {
            const selected = s.id === current.id;
            return (
              <button
                key={s.id}
                ref={(el) => (refs.current[s.id] = el)}
                role="tab"
                type="button"
                id={`${uid}-${s.id}`}
                aria-selected={selected}
                aria-controls={`${uid}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => onChange(s.id)}
                className={cx(
                  'h-11 shrink-0 whitespace-nowrap border-b-2 px-2.5 font-mono text-xs font-medium transition-colors duration-150',
                  selected ? 'border-accent text-fg' : 'border-transparent text-fg-muted hover:text-fg',
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        <CopyButton text={current.code} label="Copy code" toast={`${current.label} snippet copied`} />
      </div>
      <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-${current.id}`} className="p-3 sm:p-4">
        <CodeView code={current.code} label={`${current.label} snippet`} maxHeight={maxHeight} />
      </div>
    </div>
  );
}
