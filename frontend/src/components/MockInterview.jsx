import { useState } from 'react';
import * as api from '../services/api.js';
import { Alert, Spinner } from './ui.jsx';

const scoreColor = (s) => (s >= 8 ? 'text-emerald-400' : s >= 5 ? 'text-amber-400' : 'text-red-400');

function QuestionCard({ q, index }) {
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError(''); setLoading(true);
    try {
      setResult(await api.evaluate({ question: q.question, category: q.category, expectedPoints: q.expectedPoints, followUp: q.followUp, userAnswer: answer }));
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="card space-y-3">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-500">Q{index + 1}</span>
        <span className={`rounded-full px-2 py-0.5 font-medium ${q.category === 'Technical' ? 'bg-indigo-500/15 text-indigo-300' : 'bg-fuchsia-500/15 text-fuchsia-300'}`}>{q.category}</span>
      </div>
      <p className="font-medium">{q.question}</p>
      <textarea className="input h-28" placeholder="Type your answer…" value={answer} onChange={(e) => setAnswer(e.target.value)} />
      <Alert message={error} onClose={() => setError('')} />
      <button className="btn" onClick={submit} disabled={loading || !answer.trim()}>{loading ? <><Spinner /> Evaluating…</> : result ? 'Re-evaluate' : 'Evaluate answer'}</button>

      {result && (
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <div className="flex items-center gap-3"><div className={`text-3xl font-bold ${scoreColor(result.score)}`}>{result.score}<span className="text-sm text-slate-500">/10</span></div><p className="text-sm text-slate-300">{result.verdict}</p></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><h4 className="mb-1 text-xs font-semibold uppercase text-emerald-400">Strengths</h4><ul className="list-disc space-y-1 pl-4 text-sm text-slate-300">{result.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
            <div><h4 className="mb-1 text-xs font-semibold uppercase text-amber-400">Improve</h4><ul className="list-disc space-y-1 pl-4 text-sm text-slate-300">{result.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
          </div>
          {result.followUp && <p className="text-sm"><span className="font-semibold text-cyan-400">Follow-up: </span>{result.followUp}</p>}
        </div>
      )}
    </div>
  );
}

export default function MockInterview({ analysis }) {
  const [filter, setFilter] = useState('All');
  if (!analysis) return <div className="card text-center text-slate-400">Run an analysis first to generate your tailored interview questions.</div>;
  const visible = (q) => filter === 'All' || q.category === filter;

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {['All', 'Technical', 'Behavioural'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-sm transition ${filter === f ? 'bg-indigo-500 text-white' : 'border border-slate-700 text-slate-300 hover:border-slate-500'}`}>{f}</button>
        ))}
      </div>
      {/* All cards stay mounted (hidden) so answers/feedback survive filter changes */}
      {analysis.interviewQuestions.map((q, i) => (
        <div key={q.id + i} className={visible(q) ? '' : 'hidden'}><QuestionCard q={q} index={i} /></div>
      ))}
      {!analysis.interviewQuestions.some(visible) && <div className="card text-center text-slate-400">No {filter} questions.</div>}
    </div>
  );
}
