import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import prepRoutes from './routes/prepRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';

if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET in .env (copy .env.example to .env)');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((s) => s.trim()) : true,
    exposedHeaders: ['Content-Disposition'],
  })
);
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'RoleReady AI' }));
app.use('/api/auth', authRoutes);
app.use('/api', prepRoutes); // /api/analyze, /api/interview/evaluate
app.use('/api/resume', resumeRoutes); // /api/resume/pdf

app.use((req, res) => res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body.' });
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => console.log(`RoleReady AI API running on http://localhost:${PORT}`));
