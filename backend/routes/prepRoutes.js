import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { analyzeResume, evaluateAnswer } from '../services/gemini.js';

const router = Router();

router.post('/analyze', requireAuth, async (req, res, next) => {
  try {
    const { targetRole, resumeText, jobDescription = '' } = req.body || {};
    if (!targetRole?.trim()) return res.status(400).json({ error: 'targetRole is required.' });
    if (!resumeText || resumeText.trim().length < 50) return res.status(400).json({ error: 'resumeText is required (at least 50 characters).' });
    const result = await analyzeResume({
      targetRole: targetRole.trim(),
      resumeText: resumeText.slice(0, 20000),
      jobDescription: String(jobDescription).slice(0, 12000),
    });
    res.json(result);
  } catch (e) { next(e); }
});

router.post('/interview/evaluate', requireAuth, async (req, res, next) => {
  try {
    const { question, category, expectedPoints, followUp, userAnswer } = req.body || {};
    if (!question?.trim()) return res.status(400).json({ error: 'question is required.' });
    if (!userAnswer?.trim()) return res.status(400).json({ error: 'Please write an answer first.' });
    res.json(await evaluateAnswer({ question, category, expectedPoints, followUp, userAnswer: userAnswer.slice(0, 6000) }));
  } catch (e) { next(e); }
});

export default router;
