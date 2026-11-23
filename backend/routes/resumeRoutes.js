import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { generateResumePDF } from '../services/pdf.js';

const router = Router();

router.post('/pdf', requireAuth, async (req, res, next) => {
  try {
    const { atsResumeText, role = '' } = req.body || {};
    if (!atsResumeText?.trim()) return res.status(400).json({ error: 'atsResumeText is required to generate a PDF.' });
    const pdf = await generateResumePDF(atsResumeText.slice(0, 30000), String(role).slice(0, 100));
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="RoleReady_ATS_Resume.pdf"',
      'Content-Length': pdf.length,
    });
    res.send(pdf);
  } catch (e) {
    e.message = `PDF generation failed: ${e.message}`;
    next(e);
  }
});

export default router;
