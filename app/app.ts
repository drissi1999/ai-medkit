import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * AI Medkit – Frontend Demo (single‑file React)
 * -------------------------------------------------
 * What this demo shows (works with the backend you have):
 * 1) Login → fetch JWT from /api/v1/auth/token (password is "dev" for now).
 * 2) Health check panel.
 * 3) Voice recorder → /api/v1/medical/stt → transcript.
 * 4) Build SOAP draft → /api/v1/medical/note-from-transcript → editable preview.
 * 5) WebSocket echo tester to /api/v1/ws/stream.
 *
 * How to use locally with Vite:
 *   - Put this as src/App.tsx in your front app (or any route page).
 *   - npm run dev (Vite) and set API Base (e.g., http://localhost:8000) in the UI.
 *   - Or set VITE_API_BASE_URL and click "Use VITE URL".
 */

// ----------------------------
// Small helpers
// ----------------------------
const ls = {
  get(k: string, d = "") { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set(k: string, v: string) { try { localStorage.setItem(k, v); } catch {} },
  del(k: string) { try { localStorage.removeItem(k); } catch {} },
};

const defaultApiBase = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000";

function cls(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

// ----------------------------
// Login Panel
// ----------------------------
function LoginPanel({ apiBase, onToken }: { apiBase: string; onToken: (t: string) => void }) {
  const [username, setUsername] = useState("doc1");
  const [password, setPassword] = useState("dev");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true); setError(null);
    try {
      const body = new URLSearchParams({ username, password });
      const res = await fetch(`${apiBase}/api/v1/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const token = json.access_token as string;
      onToken(token);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={login} className="space-y-2">
      <div className="text-sm text-gray-500">Use password <b>dev</b> for the stubbed backend.</div>
      <div className="flex gap-2">
        <input value={username} onChange={e=>setUsername(e.target.value)} className="border rounded px-2 py-1 w-40" placeholder="username" />
        <input value={password} onChange={e=>setPassword(e.target.value)} className="border rounded px-2 py-1 w-40" type="password" placeholder="password" />
        <button type="submit" disabled={loading} className={cls("px-3 py-1 rounded text-white", loading?"bg-gray-400":"bg-indigo-600 hover:bg-indigo-700")}>{loading?"…":"Login"}</button>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
    </form>
  );
}

// ----------------------------
// Health Panel
// ----------------------------
function HealthPanel({ apiBase, token }: { apiBase: string; token?: string }) {
  const [health, setHealth] = useState<any>(null);
  const [medPing, setMedPing] = useState<any>(null);

  async function fetchHealth() {
    try {
      const res = await fetch(`${apiBase}/health`);
      setHealth(await res.json());
    } catch (e) { setHealth({ error: String(e) }); }
  }
  async function fetchMedPing() {
    try {
      const res = await fetch(`${apiBase}/api/v1/medical/ping`, { headers: token ? { Authorization: `Bearer ${token}` } : {} as any });
      setMedPing(await res.json());
    } catch (e) { setMedPing({ error: String(e) }); }
  }

  useEffect(()=>{ fetchHealth(); }, [apiBase]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button onClick={fetchHealth} className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300">Health</button>
        <button onClick={fetchMedPing} className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300">Medical /ping</button>
      </div>
      <pre className="bg-black text-green-300 p-2 rounded text-xs overflow-auto max-h-40">{JSON.stringify({ health, medPing }, null, 2)}</pre>
    </div>
  );
}

// ----------------------------
// Voice Note → STT → SOAP Draft
// ----------------------------
function VoiceNote({ apiBase, token, onDraft }: { apiBase: string; token: string; onDraft: (soap: any, transcript: string) => void }) {
  const [lang, setLang] = useState("fr");
  const [isRec, setIsRec] = useState(false);
  const [rec, setRec] = useState<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const [transcript, setTranscript] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        chunks.current = [];
        await upload(blob);
      };
      mr.start();
      setRec(mr); setIsRec(true);
    } catch (e: any) { setError(e.message || String(e)); }
  }
  function stop() { try { rec?.stop(); } finally { setIsRec(false); } }

  async function upload(blob: Blob) {
    setBusy(true); setError(null);
    try {
      const fd = new FormData();
      fd.append("audio", blob, "note.webm");
      fd.append("language", lang);
      const stt = await fetch(`${apiBase}/api/v1/medical/stt`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (!stt.ok) throw new Error(`STT ${stt.status}`);
      const sttJson = await stt.json();
      setTranscript(sttJson.transcript || "");

      const note = await fetch(`${apiBase}/api/v1/medical/note-from-transcript`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ transcript: sttJson.transcript, language: lang })
      });
      if (!note.ok) throw new Error(`note ${note.status}`);
      const { soap } = await note.json();
      onDraft(soap, sttJson.transcript);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <select value={lang} onChange={(e)=>setLang(e.target.value)} className="border rounded px-2 py-1">
          <option value="fr">fr</option>
          <option value="en">en</option>
        </select>
        {!isRec ? (
          <button onClick={start} disabled={busy} className="px-3 py-1 rounded text-white bg-rose-600 hover:bg-rose-700">● Record</button>
        ) : (
          <button onClick={stop} className="px-3 py-1 rounded text-white bg-gray-700">■ Stop</button>
        )}
        <span className="text-sm text-gray-500">or upload wav/webm →</span>
        <input type="file" accept="audio/*" onChange={async (e)=>{ const f=e.target.files?.[0]; if (f) await upload(f); }} />
      </div>
      {busy && <div className="text-xs text-gray-500">Processing… first time may download a model.</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {transcript && (
        <div>
          <div className="text-sm text-gray-600">Transcript</div>
          <textarea value={transcript} readOnly className="w-full h-24 border rounded p-2 text-sm" />
        </div>
      )}
    </div>
  );
}

// ----------------------------
// SOAP Editor
// ----------------------------
function SoapEditor({ soap, onChange }: { soap: any; onChange: (s: any) => void }) {
  const [s, setS] = useState(JSON.stringify(soap, null, 2));
  useEffect(()=>{ setS(JSON.stringify(soap, null, 2)); }, [soap]);
  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-600">SOAP (editable JSON)</div>
      <textarea className="w-full h-48 border rounded p-2 text-sm font-mono" value={s} onChange={(e)=>{
        setS(e.target.value);
        try { const j = JSON.parse(e.target.value); onChange(j); } catch {}
      }} />
      <details className="text-sm text-gray-600">
        <summary className="cursor-pointer">Rendered (read‑only)</summary>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div><h4 className="font-semibold">Subjective</h4><ul className="list-disc ml-5 text-sm">{(soap?.subjective||[]).map((x: any, i: number)=> <li key={i}>{String(x)}</li>)}</ul></div>
          <div><h4 className="font-semibold">Objective</h4><ul className="list-disc ml-5 text-sm">{(soap?.objective||[]).map((x: any, i: number)=> <li key={i}>{String(x)}</li>)}</ul></div>
          <div><h4 className="font-semibold">Assessment</h4><ul className="list-disc ml-5 text-sm">{(soap?.assessment||[]).map((x: any, i: number)=> <li key={i}>{String(x)}</li>)}</ul></div>
          <div><h4 className="font-semibold">Plan</h4><ul className="list-disc ml-5 text-sm">{(soap?.plan||[]).map((x: any, i: number)=> <li key={i}>{String(x)}</li>)}</ul></div>
        </div>
      </details>
    </div>
  );
}

// ----------------------------
// WebSocket Echo Tester
// ----------------------------
function WsTester({ apiBase }: { apiBase: string }) {
  const [wsPath, setWsPath] = useState("/api/v1/ws/stream");
  const [messages, setMessages] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  function connect() {
    disconnect();
    const url = `${apiBase}`.replace("http", "ws") + wsPath;
    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onopen = () => setMessages(m => [...m, `connected: ${url}`]);
    ws.onmessage = (e) => setMessages(m => [...m, String(e.data)]);
    ws.onclose = () => setMessages(m => [...m, "[ws closed]"]);
    ws.onerror = (e) => setMessages(m => [...m, "[ws error]"]);
  }
  function disconnect(){ try { wsRef.current?.close(); } catch {} }
  function send(msg: string) { wsRef.current?.send(msg); setMessages(m=>[...m, "> "+msg]); }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <input value={wsPath} onChange={e=>setWsPath(e.target.value)} className="border rounded px-2 py-1 w-64" />
        <button onClick={connect} className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300">Connect</button>
        <button onClick={()=>send(`ping ${Date.now()}`)} className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300">Send Ping</button>
        <button onClick={disconnect} className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300">Disconnect</button>
      </div>
      <pre className="bg-black text-green-300 p-2 rounded text-xs overflow-auto max-h-40">{messages.join("\n")}</pre>
    </div>
  );
}

// ----------------------------
// Main App
// ----------------------------
export default function App() {
  const [apiBase, setApiBase] = useState(ls.get("apiBase", defaultApiBase));
  const [token, setToken] = useState<string | null>(ls.get("jwt", "" ) || null);
  const [soap, setSoap] = useState<any | null>(null);
  const [transcript, setTranscript] = useState<string>("");

  useEffect(()=>{ ls.set("apiBase", apiBase); }, [apiBase]);
  useEffect(()=>{ if (token) ls.set("jwt", token); else ls.del("jwt"); }, [token]);

  const authedHeaders = useMemo(()=> token ? { Authorization: `Bearer ${token}` } : {}, [token]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">AI Medkit – Frontend Demo</h1>
          <div className="flex items-center gap-2">
            <input value={apiBase} onChange={e=>setApiBase(e.target.value)} className="border rounded px-2 py-1 w-72" placeholder="http://localhost:8000" />
            <button className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300" onClick={()=> setApiBase(defaultApiBase)}>Use VITE URL</button>
          </div>
        </header>

        <section className="bg-white rounded-2xl shadow p-4 space-y-3">
          <h2 className="font-semibold">1) Login</h2>
          {token ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-700">JWT set</span>
              <button onClick={()=>setToken(null)} className="px-3 py-1 rounded bg-rose-100 hover:bg-rose-200">Logout</button>
            </div>
          ) : (
            <LoginPanel apiBase={apiBase} onToken={setToken} />
          )}
        </section>

        <section className="bg-white rounded-2xl shadow p-4 space-y-3">
          <h2 className="font-semibold">2) Health & Pings</h2>
          <HealthPanel apiBase={apiBase} token={token || undefined} />
        </section>

        <section className="bg-white rounded-2xl shadow p-4 space-y-3">
          <h2 className="font-semibold">3) Voice → Transcript → SOAP Draft</h2>
          {!token && <div className="text-sm text-rose-700">Login first to get a token.</div>}
          {token && (
            <VoiceNote apiBase={apiBase} token={token} onDraft={(s, t)=>{ setSoap(s); setTranscript(t); }} />
          )}
          {soap && (
            <div className="mt-3">
              <SoapEditor soap={soap} onChange={setSoap} />
              <div className="flex gap-2 mt-2">
                <button className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700" onClick={()=>{
                  const data = new Blob([JSON.stringify({ transcript, soap }, null, 2)], { type: "application/json" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(data);
                  a.download = `note-${Date.now()}.json`;
                  a.click();
                }}>Download JSON</button>
                <button className="px-3 py-1 rounded bg-slate-200" onClick={()=>{ setSoap(null); setTranscript(""); }}>Clear</button>
              </div>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow p-4 space-y-3">
          <h2 className="font-semibold">4) WebSocket Echo Tester</h2>
          <WsTester apiBase={apiBase} />
        </section>

        <footer className="text-xs text-gray-500 text-center pt-6">
          <div>Demo only – no medical advice. All actions require clinician review.</div>
        </footer>
      </div>
    </div>
  );
}
