import { useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';
import { isVoiceSupported, startVoiceSession, type VoiceSession } from '@/lib/voice';

export function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<VoiceSession | null>(null);

  useEffect(() => () => sessionRef.current?.stop(), []);

  if (!isVoiceSupported()) {
    return (
      <span className="text-xs text-ink-muted italic">
        Voice input unavailable in this browser
      </span>
    );
  }

  const start = () => {
    setError(null);
    const session = startVoiceSession(
      (text, isFinal) => {
        if (isFinal) onTranscript(text);
      },
      (msg) => {
        setError(msg);
        setRecording(false);
      },
    );
    if (session) {
      sessionRef.current = session;
      setRecording(true);
    }
  };

  const stop = () => {
    sessionRef.current?.stop();
    sessionRef.current = null;
    setRecording(false);
  };

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-negative">{error}</span>}
      <button
        type="button"
        onClick={recording ? stop : start}
        className={
          recording
            ? 'flex items-center gap-2 rounded-full bg-negative px-3 py-1.5 text-sm text-white hover:opacity-90'
            : 'flex items-center gap-2 rounded-full bg-action px-3 py-1.5 text-sm text-white hover:bg-action-hover'
        }
        aria-label={recording ? 'Stop recording' : 'Start voice input'}
      >
        {recording ? <Square size={14} fill="white" /> : <Mic size={14} />}
        {recording ? 'Stop' : 'Speak'}
      </button>
    </div>
  );
}
