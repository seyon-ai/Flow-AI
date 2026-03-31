// ── FlowAI Firebase Config ──
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyA6mD9wjzCpqZps20CnxZUmPoCUC_yBXCA",
  authDomain: "flowai-455e3.firebaseapp.com",
  projectId: "flowai-455e3",
  storageBucket: "flowai-455e3.firebasestorage.app",
  messagingSenderId: "575960248970",
  appId: "1:575960248970:web:636bf5b1c5c4e15b69f373"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ── AI Keys ──
export const GEMINI_KEY = 'AIzaSyAN1HJtqbS2tw-TZZoguQLScBxWAWczFeQ';
export const DEEPSEEK_KEY = 'sk-89618dc158a04c2b86afaed3ed3beedb';

// ── AI Caller with fallback ──
const SYSTEM_PROMPT = `You are FlowAI. Respond ONLY with valid JSON — no markdown, no backticks, no explanation.
JSON format:
{
  "summary": "One sentence describing the workflow",
  "nodes": [
    { "id": "n1", "type": "trigger|action|condition|output|delay", "icon": "emoji", "title": "Title", "description": "What this step does", "connectorLabel": "" }
  ]
}
Rules: First node must be trigger. Last must be output or action. Use 3-7 nodes. Be specific. ONLY JSON.`;

export async function callAI(prompt, onModelChange) {
  async function gemini() {
    if (onModelChange) onModelChange('Gemini');
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const d = await res.json();
    if (d.error) throw new Error(d.error.message);
    return d.candidates[0].content.parts[0].text;
  }

  async function deepseek() {
    if (onModelChange) onModelChange('DeepSeek');
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_KEY}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }],
        max_tokens: 1000
      })
    });
    const d = await res.json();
    if (d.error) throw new Error(d.error.message);
    return d.choices[0].message.content;
  }

  try { return await gemini(); }
  catch (e) { console.warn('Gemini failed, using DeepSeek:', e.message); return await deepseek(); }
}

// ── Shared CSS variables (injected as string for reuse) ──
export const SHARED_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #06090f; --surface: #0c1018; --surface2: #111822; --surface3: #161f2e;
    --border: #1a2740; --accent: #00c8ff; --accent2: #6c4fff;
    --green: #00e5a0; --orange: #ff6b35; --yellow: #ffc947; --red: #ff4560;
    --text: #ddeeff; --muted: #4a6080;
    --fh: 'Syne', sans-serif; --fm: 'Space Mono', monospace;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--fm); min-height: 100vh; }
  body::before { content:''; position:fixed; inset:0; background-image: linear-gradient(rgba(0,200,255,0.025) 1px,transparent 1px), linear-gradient(90deg,rgba(0,200,255,0.025) 1px,transparent 1px); background-size:48px 48px; pointer-events:none; z-index:0; }
  a { color: inherit; text-decoration: none; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }
  @keyframes blink { 0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)} }

  /* NAV */
  nav { position:relative; z-index:10; display:flex; align-items:center; justify-content:space-between; padding:12px 28px; border-bottom:1px solid var(--border); background:rgba(6,9,15,0.97); backdrop-filter:blur(12px); }
  .nav-logo { font-family:var(--fh); font-size:18px; font-weight:800; display:flex; align-items:center; gap:10px; cursor:pointer; }
  .nav-logo-icon { width:28px; height:28px; border-radius:7px; background:linear-gradient(135deg,var(--accent),var(--accent2)); display:flex; align-items:center; justify-content:center; font-size:14px; }
  .nav-logo span { color:var(--accent); }
  .nav-right { display:flex; align-items:center; gap:12px; }
  .nav-link { font-size:11px; color:var(--muted); padding:6px 14px; border-radius:8px; border:1px solid transparent; transition:all 0.2s; cursor:pointer; letter-spacing:0.5px; }
  .nav-link:hover, .nav-link.active { border-color:var(--border); color:var(--text); background:var(--surface2); }
  .nav-link.cta { border-color:rgba(0,200,255,0.4); color:var(--accent); background:rgba(0,200,255,0.06); }
  .nav-link.cta:hover { background:rgba(0,200,255,0.12); }
  .user-pill { display:flex; align-items:center; gap:8px; background:var(--surface2); border:1px solid var(--border); border-radius:20px; padding:5px 12px; font-size:11px; cursor:pointer; transition:all 0.2s; }
  .user-pill:hover { border-color:var(--red); color:var(--red); }
  .user-avatar { width:22px; height:22px; border-radius:50%; background:linear-gradient(135deg,var(--accent),var(--accent2)); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#06090f; }

  /* BUTTONS */
  .btn { font-family:var(--fm); font-size:12px; padding:10px 20px; border-radius:10px; border:1px solid var(--border); background:transparent; color:var(--muted); cursor:pointer; transition:all 0.2s; }
  .btn:hover { border-color:var(--accent); color:var(--accent); }
  .btn-primary { background:linear-gradient(135deg,var(--accent),var(--accent2)); color:#06090f; border:none; font-family:var(--fh); font-weight:700; }
  .btn-primary:hover { filter:brightness(1.1); transform:translateY(-1px); color:#06090f; }
  .btn-green { border-color:rgba(0,229,160,0.4); color:var(--green); }
  .btn-green:hover { background:rgba(0,229,160,0.08); }
  .btn:disabled { opacity:0.3; cursor:not-allowed; transform:none !important; filter:none !important; }

  /* TOAST */
  .toast { position:fixed; bottom:24px; right:24px; z-index:9999; background:var(--surface2); border:1px solid var(--border); border-radius:10px; padding:12px 20px; font-size:12px; color:var(--text); animation:fadeUp 0.3s ease; box-shadow:0 8px 32px rgba(0,0,0,0.4); }
`;
