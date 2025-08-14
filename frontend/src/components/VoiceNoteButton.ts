import React, { useEffect, useRef, useState } from "react";

type Props = {
  apiBase?: string;      // e.g., http://localhost:8000
  token: string;         // JWT from your auth flow
  onDraft?: (soap: any, transcript: string) => void;
  language?: string;     // e.g., "en" | "fr"
};

export default function VoiceNoteButton({ apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000", token, onDraft, language }: Props) {
  const [rec, setRec] = useState<MediaRecorder | null>(null);
  const [isRec, setIsRec] = useState(false);
  const chunks = useRef<BlobPart[]>([]);

  useEffect(() => {
    return () => { if (rec && rec.state !== "inactive") rec.stop(); };
  }, [rec]);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data); };
    mr.onstop = async () => {
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      chunks.current = [];
      await upload(blob);
    };
    mr.start();
    setRec(mr); setIsRec(true);
  };

  const stop = () => { rec?.stop(); setIsRec(false); };

  const upload = async (blob: Blob) => {
    const fd = new FormData();
    fd.append("audio", blob, "note.webm");
    if (language) fd.append("language", language);

    const sttRes = await fetch(`${apiBase}/api/v1/medical/stt`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!sttRes.ok) { alert("STT failed"); return; }
    const { transcript } = await sttRes.json();

    const noteRes = await fetch(`${apiBase}/api/v1/medical/note-from-transcript`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ transcript, language: language || "en" })
    });
    const { soap } = await noteRes.json();
    onDraft?.(soap, transcript);
  };

  return (
    <button
      onClick={isRec ? stop : start}
      className={`px-4 py-2 rounded ${isRec ? "bg-red-600" : "bg-indigo-600"} text-white`}
      title={isRec ? "Stop recording" : "Start recording"}
    >
      {isRec ? "■ Stop" : "● Record"}
    </button>
  );
}
