import { useState } from 'react';
import * as api from '../services/api.js';
import { Alert, CopyButton, Spinner } from './ui.jsx';

const isH = (l) => { const t = l.trim().replace(/:$/, ''); return t.length > 1 && t.length <= 40 && t === t.toUpperCase() && /[A-Z]/.test(t) && !/^\s*[-•*]/.test(l); };

function Preview({ text, role }) {
  const lines = text.split('\n').map((l) => l.replace(/\*\*/g, ''));
  const first = lines.findIndex((l) => l.trim());
  const name = first >= 0 ? lines[first] : 'Your Name';
  const rest = first >= 0 ? lines.slice(first + 1) : [];
  return (
    <div className="max-h-[36rem] overflow-auto rounded-lg bg-white p-8 font-sans text-[12px] leading-relaxed text-neutral-900">
      <h1 className="text-xl font-bold">{name}</h1>
      {role && <div className="text-neutral-700">{role}</div>}
      {rest.map((l, i) => {
        if (!l.trim()) return null;
        if (isH(l)) return <h2 key={i} className="mb-1 mt-3 border-b border-neutral-800 pb-0.5 text-[11px] font-bold uppercase tracking-wider">{l.trim().replace(/:$/, '')}</h2>;
        if (/^\s*[-•*–]\s+/.test(l)) return <div key={i} className="flex gap-2 pl-3"><span>•</span><span>{l.replace(/^\s*[-•*–]\s+/, '')}</span></div>;
        return <p key={i}>{l.trim()}</p>;
      })}
    </div>
  );
}

export default function AtsResume({ analysis, text, setText, role }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  if (!analysis) return <div className="card text-center text-slate-400">Run an analysis first to generate your ATS-friendly resume.</div>;

  const download = async () => {
    setError(''); setLoading(true);
    try { await api.downloadResumePdf({ atsResumeText: text, role }); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card space-y-3">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Edit resume text</h2><CopyButton text={text} /></div>
        <p className="text-xs text-slate-400">Line 1: name · Line 2: contact · ALL-CAPS lines become headings · lines starting with "- " become bullets.</p>
        <textarea className="input h-[32rem] font-mono text-xs leading-relaxed" value={text} onChange={(e) => setText(e.target.value)} />
        <Alert message={error} onClose={() => setError('')} />
        <button className="btn w-full" onClick={download} disabled={loading || !text.trim()}>{loading ? <><Spinner /> Generating PDF…</> : '⬇ Download ATS PDF'}</button>
      </div>
      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">Preview</h2>
        <Preview text={text} role={role} />
      </div>
    </div>
  );
}
