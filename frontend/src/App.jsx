import { useEffect, useState } from 'react';
import * as api from './services/api.js';
import AuthForm from './components/AuthForm.jsx';
import SkillGap from './components/SkillGap.jsx';
import MockInterview from './components/MockInterview.jsx';
import AtsResume from './components/AtsResume.jsx';
import { Brand } from './components/ui.jsx';

const TABS = ['Skill Gap & Rewrites', 'Mock Interview', 'ATS Resume'];
const readUser = () => { try { return JSON.parse(localStorage.getItem('rr_user')); } catch { return null; } };

export default function App() {
  const [user, setUser] = useState(readUser);
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ targetRole: '', resumeText: '', jobDescription: '' });
  const [analysis, setAnalysis] = useState(null);
  const [runId, setRunId] = useState(0);
  const [atsText, setAtsText] = useState('');

  const logout = () => { api.setToken(''); localStorage.removeItem('rr_user'); setUser(null); setAnalysis(null); setAtsText(''); };
  useEffect(() => { api.setUnauthorizedHandler(logout); }, []);

  const onAuth = ({ token, user }) => { api.setToken(token); localStorage.setItem('rr_user', JSON.stringify(user)); setUser(user); };
  const onAnalysis = (data) => { setAnalysis(data); setAtsText(data?.atsResumeText || ''); setRunId((n) => n + 1); };

  if (!user || !api.getToken()) return <AuthForm onAuth={onAuth} />;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <header className="flex flex-wrap items-center justify-between gap-4 py-6">
        <Brand />
        <div className="flex items-center gap-3 text-sm text-slate-400"><span>Hi, {user.name}</span><button onClick={logout} className="btn-ghost">Log out</button></div>
      </header>
      <nav className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-1">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${tab === i ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}>{t}</button>
        ))}
      </nav>
      {/* Views stay mounted so inputs and interview answers aren't lost when switching tabs */}
      <div className={tab === 0 ? '' : 'hidden'}><SkillGap form={form} setForm={setForm} analysis={analysis} setAnalysis={onAnalysis} /></div>
      <div className={tab === 1 ? '' : 'hidden'}><MockInterview key={runId} analysis={analysis} /></div>
      <div className={tab === 2 ? '' : 'hidden'}><AtsResume analysis={analysis} text={atsText} setText={setAtsText} role={form.targetRole} /></div>
    </div>
  );
}
