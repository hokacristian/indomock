import { memo, useMemo } from 'react';
import { cx } from './primitives.jsx';

const JSON_TOKEN = /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*")(\s*:)?|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\],])/g;
const HIGHLIGHT_LIMIT = 600_000; // characters — beyond this, render plain text to stay responsive

/** Tokenise pretty-printed JSON into coloured spans (no dependencies). */
function highlightJson(text) {
  const out = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(JSON_TOKEN)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const [, str, colon, bool, nul, num, punct] = m;
    if (str) {
      out.push(<span key={i++} className={colon ? 'syn-key' : 'syn-str'}>{str}</span>);
      if (colon) out.push(<span key={i++} className="syn-punct">{colon}</span>);
    } else if (bool) out.push(<span key={i++} className="syn-bool">{bool}</span>);
    else if (nul) out.push(<span key={i++} className="syn-null">{nul}</span>);
    else if (num) out.push(<span key={i++} className="syn-num">{num}</span>);
    else if (punct) out.push(<span key={i++} className="syn-punct">{punct}</span>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/**
 * Read-only code panel with a line-number gutter.
 * `language="json"` enables syntax highlighting.
 */
export const CodeView = memo(function CodeView({ code, language = 'text', className, maxHeight = '32rem', label, wrap = false }) {
  const lines = useMemo(() => (code ? code.split('\n').length : 0), [code]);
  const body = useMemo(() => {
    if (language === 'json' && code && code.length <= HIGHLIGHT_LIMIT) return highlightJson(code);
    return code;
  }, [code, language]);
  const gutter = useMemo(() => Array.from({ length: lines }, (_, n) => n + 1).join('\n'), [lines]);

  return (
    <div
      className={cx('code-scroll relative flex rounded-lg bg-code text-fg', className)}
      style={{ maxHeight }}
      tabIndex={0}
      role="region"
      aria-label={label ?? `${language.toUpperCase()} output`}
    >
      <pre aria-hidden="true" className="sticky left-0 select-none border-r border-line bg-code py-3 pl-3 pr-3 text-right text-fg-subtle/70">
        {gutter}
      </pre>
      <pre className={cx('min-w-0 flex-1 py-3 pl-4 pr-4', wrap ? 'whitespace-pre-wrap break-words [overflow-wrap:anywhere]' : 'whitespace-pre')}>
        <code>{body}</code>
      </pre>
    </div>
  );
});
