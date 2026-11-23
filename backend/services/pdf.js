import puppeteer from 'puppeteer';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const isBullet = (l) => /^\s*[-•*–]\s+/.test(l);
const stripBullet = (l) => l.replace(/^\s*[-•*–]\s+/, '');
const isHeading = (l) => {
  const t = l.trim().replace(/:$/, '');
  return t.length > 1 && t.length <= 40 && /[A-Z]/.test(t) && t === t.toUpperCase() && !isBullet(l);
};

export function buildResumeHTML(text, role = '') {
  const lines = String(text || '').replace(/\r/g, '').split('\n').map((l) => l.replace(/\*\*/g, '').trimEnd());
  while (lines.length && !lines[0].trim()) lines.shift();
  const name = lines.shift() || 'Your Name';
  let contact = '';
  if (lines.length && lines[0].trim() && !isHeading(lines[0]) && !isBullet(lines[0])) contact = lines.shift().trim();

  let html = '';
  let inList = false;
  const closeList = () => { if (inList) { html += '</ul>'; inList = false; } };
  for (const line of lines) {
    if (!line.trim()) { closeList(); continue; }
    if (isHeading(line)) { closeList(); html += `<h2>${esc(line.trim().replace(/:$/, ''))}</h2>`; }
    else if (isBullet(line)) { if (!inList) { html += '<ul>'; inList = true; } html += `<li>${esc(stripBullet(line))}</li>`; }
    else { closeList(); html += `<p>${esc(line.trim())}</p>`; }
  }
  closeList();

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(name)} - Resume</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10.5pt; line-height: 1.45; color: #111; margin: 0; }
  h1 { font-size: 20pt; margin: 0 0 2pt; letter-spacing: .3pt; }
  .role { font-size: 11pt; color: #333; margin: 0 0 2pt; }
  .contact { font-size: 9.5pt; color: #333; margin: 0 0 8pt; }
  h2 { font-size: 11pt; text-transform: uppercase; letter-spacing: .8pt; border-bottom: 1px solid #222; padding-bottom: 2pt; margin: 12pt 0 5pt; break-after: avoid; }
  p { margin: 0 0 4pt; }
  ul { margin: 0 0 4pt; padding-left: 16pt; }
  li { margin: 0 0 2.5pt; break-inside: avoid; }
</style></head><body>
<h1>${esc(name)}</h1>${role ? `<div class="role">${esc(role)}</div>` : ''}${contact ? `<div class="contact">${esc(contact)}</div>` : ''}
${html}
</body></html>`;
}

export async function generateResumePDF(text, role) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  try {
    const page = await browser.newPage();
    await page.setContent(buildResumeHTML(text, role), { waitUntil: 'load' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
