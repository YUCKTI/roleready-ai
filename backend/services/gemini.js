import { GoogleGenAI } from '@google/genai';
import { safeParseJSON } from './json.js';

let client;
function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    const err = new Error('GEMINI_API_KEY is not configured on the server.');
    err.status = 500;
    throw err;
  }
  client ||= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

async function askJSON(systemInstruction, prompt) {
  const ai = getClient();
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        contents: attempt === 0 ? prompt : `${prompt}\n\nReturn ONLY valid minified JSON. No markdown, no commentary.`,
        config: { systemInstruction, responseMimeType: 'application/json', temperature: 0.4 },
      });
      const parsed = safeParseJSON(res.text || '');
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (e) {
      if (attempt === 1) {
        const err = new Error(`Gemini request failed: ${e.message}`);
        err.status = 502;
        throw err;
      }
    }
  }
  const err = new Error('AI returned an unreadable response. Please try again.');
  err.status = 502;
  throw err;
}

const arr = (v) => (Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : typeof v === 'string' && v.trim() ? [v.trim()] : []);
const clamp = (n, lo, hi, d) => { n = Number(n); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : d; };

export async function analyzeResume({ targetRole, resumeText, jobDescription }) {
  const system = 'You are an expert technical recruiter and ATS resume coach. Never invent experience, employers, degrees or metrics the candidate does not have; for rewrites use only facts present in the resume and use placeholders like [X%] when a metric is missing. Respond with JSON only.';
  const prompt = `Target role: ${targetRole}

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription || '(none provided - infer typical requirements for the target role)'}

Return JSON with exactly this shape:
{
  "matchScore": number 0-100,
  "matchedSkills": string[],
  "missingSkills": string[],
  "bulletRewrites": [{"original": string (verbatim from resume), "improved": string (action verb + impact, concise), "reason": string}],
  "interviewQuestions": [{"id": string, "category": "Technical" | "Behavioural", "question": string, "expectedPoints": string[], "followUp": string}],
  "atsResumeText": string
}
Rules: 5-8 bulletRewrites; 8-10 interviewQuestions (about half Technical, half Behavioural); atsResumeText is a clean single-column plain-text resume built ONLY from the resume content, tailored to the role. Format atsResumeText as: line 1 = full name; line 2 = contact info separated by " | "; then section headings in ALL CAPS on their own line (SUMMARY, SKILLS, EXPERIENCE, PROJECTS, EDUCATION), bullets starting with "- ".`;

  const d = await askJSON(system, prompt);
  return {
    matchScore: clamp(d.matchScore, 0, 100, 0),
    matchedSkills: arr(d.matchedSkills),
    missingSkills: arr(d.missingSkills),
    bulletRewrites: (Array.isArray(d.bulletRewrites) ? d.bulletRewrites : [])
      .map((b) => ({ original: String(b?.original ?? ''), improved: String(b?.improved ?? ''), reason: String(b?.reason ?? '') }))
      .filter((b) => b.improved),
    interviewQuestions: (Array.isArray(d.interviewQuestions) ? d.interviewQuestions : [])
      .map((q, i) => ({
        id: String(q?.id || `q${i + 1}`),
        category: /behav/i.test(q?.category) ? 'Behavioural' : 'Technical',
        question: String(q?.question ?? ''),
        expectedPoints: arr(q?.expectedPoints),
        followUp: String(q?.followUp ?? ''),
      }))
      .filter((q) => q.question),
    atsResumeText: String(d.atsResumeText ?? ''),
  };
}

export async function evaluateAnswer({ question, category, expectedPoints, followUp, userAnswer }) {
  const system = 'You are a strict but encouraging interviewer. Evaluate candidate answers honestly against the expected points. Respond with JSON only.';
  const prompt = `Category: ${category || 'Technical'}
Question: ${question}
Expected points: ${JSON.stringify(expectedPoints || [])}
Planned follow-up: ${followUp || '(none)'}
Candidate answer: ${userAnswer}

Return JSON: {"score": integer 1-10, "verdict": string (one sentence), "strengths": string[], "improvements": string[], "followUp": string}
For Behavioural questions judge against the STAR structure. If the answer is empty or irrelevant, score 1-2.`;
  const d = await askJSON(system, prompt);
  return {
    score: clamp(d.score, 1, 10, 1),
    verdict: String(d.verdict ?? ''),
    strengths: arr(d.strengths),
    improvements: arr(d.improvements),
    followUp: String(d.followUp || followUp || ''),
  };
}
