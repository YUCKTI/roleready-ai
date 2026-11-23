import { useState } from 'react';
import * as api from '../services/api.js';
import { Alert, Chip, CopyButton, Spinner } from './ui.jsx';

function ScoreRing({ score }) {
  const r = 52, c = 2 * Math.PI * r;
  const color = score >= 75 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171';
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={r} stroke="#1e293b" strokeWidth="10" fill="none" />
        <circle cx="60" cy="60" r={r} stroke={color} strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * score) / 100} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center"><div><div className="text-3xl font-bold">{score}</div><div className="text-[10px] uppercase tracking-wider text-slate-400">match</div></div></div>
    </div>
  );
}

export default function SkillGap({ form, setForm, analysis, setAnalysis }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/\.(txt|md)$/i.test(f.name)) { setError('Please upload a .txt or .md file, or paste your resume text.'); return; }
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, resumeText: String(reader.result || '') });
    reader.readAsText(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { setAnalysis(await api.analyze(form)); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form onSubmit={submit} className="card space-y-4 lg:col-span-2 lg:self-start">
        <h2 className="text-lg font-semibold">Analyze your fit</h2>
        <Alert message={error} onClose={() => setError('')} />
        <div>
          <label className="mb-1 block text-xs text-slate-400">Target role</label>
          <input className="input" placeholder="e.g. Frontend Developer" value={form.targetRole} onChange={set('targetRole')} required />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between"><label className="text-xs text-slate-400">Resume text</label>
            <label className="cursor-pointer text-xs text-cyan-400 hover:underline">Upload .txt/.md<input type="file" accept=".txt,.md" className="hidden" onChange={onFile} /></label></div>
          <textarea className="input h-44" placeholder="Paste your resume here…" value={form.resumeText} onChange={set('resumeText')} required />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Job description</label>
          <textarea className="input h-36" placeholder="Paste the job description…" value={form.jobDescription} onChange={set('jobDescription')} />
        </div>
        <button className="btn w-full" disabled={loading}>{loading ? <><Spinner /> Analyzing with Gemini…</> : 'Analyze & Rewrite'}</button>
      </form>

      <div className="space-y-6 lg:col-span-3">
        {!analysis && !loading && <div className="card text-center text-slate-400">Your match score, skill gaps and rewritten bullets will appear here.</div>}
        {loading && <div className="card flex items-center justify-center gap-3 py-16 text-slate-300"><Spinner className="h-6 w-6" /> Reading your resume against the job…</div>}
        {analysis && !loading && (
          <>
            <div className="card flex flex-col items-center gap-6 sm:flex-row">
              <ScoreRing score={analysis.matchScore} />
              <div className="space-y-4">
                <div><h3 className="mb-2 text-sm font-semibold text-slate-300">Matched skills</h3><div className="flex flex-wrap gap-2">{analysis.matchedSkills.length ? analysis.matchedSkills.map((s) => <Chip key={s}>{s}</Chip>) : <span className="text-sm text-slate-500">None found</span>}</div></div>
                <div><h3 className="mb-2 text-sm font-semibold text-slate-300">Missing skills</h3><div className="flex flex-wrap gap-2">{analysis.missingSkills.length ? analysis.missingSkills.map((s) => <Chip key={s} tone="amber">{s}</Chip>) : <span className="text-sm text-slate-500">No gaps 🎉</span>}</div></div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Bullet rewrites</h3>
              {analysis.bulletRewrites.map((b, i) => (
                <div key={i} className="card space-y-3">
                  {b.original && <p className="text-sm text-slate-500 line-through decoration-slate-600">{b.original}</p>}
                  <div className="flex items-start justify-between gap-3"><p className="text-sm text-emerald-200">{b.improved}</p><CopyButton text={b.improved} /></div>
                  {b.reason && <p className="text-xs text-slate-400">💡 {b.reason}</p>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
