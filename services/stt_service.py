# app/services/stt_service.py
from typing import Optional
import tempfile, os, asyncio
from transformers import pipeline

_ASR_PIPELINE = None
_MODEL_ID = os.getenv("ASR_MODEL_ID", "openai/whisper-base")  # override in env if you prefer

def _get_asr():
    global _ASR_PIPELINE
    if _ASR_PIPELINE is None:
        # device='cpu' by default; set device=0 for GPU if available
        _ASR_PIPELINE = pipeline("automatic-speech-recognition", model=_MODEL_ID)
    return _ASR_PIPELINE

async def transcribe_bytes(data: bytes, language: Optional[str] = None) -> str:
    # Write to a temp file because some backends require a path
    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
        f.write(data)
        tmp_path = f.name
    try:
        asr = _get_asr()
        # Whisper supports language hints; many HF pipelines ignore it but safe to pass
        result = await asyncio.to_thread(asr, tmp_path, generate_kwargs={"language": language} if language else None)
        text = result["text"] if isinstance(result, dict) else str(result)
        return text.strip()
    finally:
        try: os.remove(tmp_path)
        except Exception: pass
