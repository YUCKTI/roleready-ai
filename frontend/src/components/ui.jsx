import { useState } from 'react';

export const Spinner = ({ className = 'h-4 w-4' }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-90" />
  </svg>
);

export const Alert = ({ message, onClose }) =>
  message ? (
    <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
      <span>{message}</span>
      {onClose && <button onClick={onClose} className="text-red-300 hover:text-white" aria-label="Dismiss">✕</button>}
    </div>
  ) : null;

export const Chip = ({ children, tone = 'green' }) => (
  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${tone === 'green' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>{children}</span>
);

export function CopyButton({ text, label = 'Copy' }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); } catch {
      const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
    }
    setDone(true); setTimeout(() => setDone(false), 1500);
  };
  return <button onClick={copy} className="btn-ghost">{done ? '✓ Copied' : label}</button>;
}

export const Brand = ({ size = 'text-xl' }) => (
  <div className="flex items-center gap-2">
    <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 font-black text-white">R</div>
    <div>
      <div className={`${size} font-bold leading-tight`}>RoleReady <span className="text-cyan-400">AI</span></div>
      <div className="text-xs text-slate-400">Bridge the gap. Own the interview.</div>
    </div>
  </div>
);
