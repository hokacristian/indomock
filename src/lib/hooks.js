import { useCallback, useEffect, useRef, useState } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  );
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    try {
      localStorage.setItem('indomock-theme', theme);
    } catch {
      /* private mode */
    }
  }, [theme]);
  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
  return { theme, toggle };
}

/** Tab state synced with location.hash for deep links (#generator, #playground…). */
export function useHashTab(ids, fallback) {
  const read = () => {
    const h = window.location.hash.replace('#', '');
    return ids.includes(h) ? h : fallback;
  };
  const [tab, setTab] = useState(read);
  useEffect(() => {
    const onHash = () => setTab(read());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const select = useCallback((id) => {
    setTab(id);
    window.history.replaceState(null, '', `#${id}`);
  }, []);
  return [tab, select];
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for non-secure contexts (plain http on LAN IPs).
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

/** Returns [copied, copy] — `copied` flips true for 1.6s after a successful copy. */
export function useCopy() {
  const [copied, setCopied] = useState(false);
  const timer = useRef();
  const copy = useCallback(async (text) => {
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    }
    return ok;
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return [copied, copy];
}

export function useDebounced(value, ms) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/** Live elapsed-ms counter while `running` is true. */
export function useElapsed(running) {
  const [ms, setMs] = useState(0);
  useEffect(() => {
    if (!running) return undefined;
    const start = performance.now();
    setMs(0);
    let raf;
    const tick = () => {
      setMs(Math.round(performance.now() - start));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);
  return ms;
}

export function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
