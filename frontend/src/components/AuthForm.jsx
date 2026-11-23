import { useState } from 'react';
import * as api from '../services/api.js';
import { Alert, Brand, Spinner } from './ui.jsx';

export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = mode === 'login' ? await api.login({ email: form.email, password: form.password }) : await api.register(form);
      onAuth(data);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="mb-8"><Brand size="text-3xl" /></div>
      <form onSubmit={submit} className="card space-y-4">
        <h2 className="text-lg font-semibold">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <Alert message={error} onClose={() => setError('')} />
        {mode === 'register' && <input className="input" placeholder="Full name" value={form.name} onChange={set('name')} required />}
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        <input className="input" type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={set('password')} required />
        <button className="btn w-full" disabled={loading}>{loading && <Spinner />}{mode === 'login' ? 'Log in' : 'Sign up'}</button>
        <p className="text-center text-sm text-slate-400">
          {mode === 'login' ? 'New here? ' : 'Already registered? '}
          <button type="button" className="text-cyan-400 hover:underline" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Create an account' : 'Log in'}
          </button>
        </p>
      </form>
    </div>
  );
}
