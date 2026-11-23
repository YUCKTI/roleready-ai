// Safely extract JSON from model output (handles ```json fences, preamble text, trailing commas).
export function safeParseJSON(raw) {
  if (raw == null) return null;
  if (typeof raw === 'object') return raw;
  let text = String(raw).trim().replace(/^```(?:json|JSON)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const attempts = [text];
  const s = text.indexOf('{');
  const e = text.lastIndexOf('}');
  if (s !== -1 && e > s) attempts.push(text.slice(s, e + 1));
  for (const t of attempts) {
    for (const candidate of [t, t.replace(/,\s*([}\]])/g, '$1')]) {
      try { return JSON.parse(candidate); } catch { /* try next */ }
    }
  }
  return null;
}
