/**
 * Thin wrapper around the browser Web Speech API.
 * Free, no backend needed, ships on Chrome/Safari/Edge. Firefox lacks support —
 * fall back to the text input in that case.
 *
 * For higher-accuracy transcription, the backend exposes POST /voice/transcribe
 * (see `api/client.ts#transcribeVoice`). This file covers the in-browser path.
 */

type SR = typeof window extends { SpeechRecognition: infer T }
  ? T
  : typeof window extends { webkitSpeechRecognition: infer T }
    ? T
    : null;

export function isVoiceSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export interface VoiceSession {
  stop: () => void;
}

export function startVoiceSession(
  onResult: (text: string, isFinal: boolean) => void,
  onError: (msg: string) => void,
): VoiceSession | null {
  const Ctor =
    (window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR })
      .SpeechRecognition ??
    (window as unknown as { webkitSpeechRecognition?: SR }).webkitSpeechRecognition;
  if (!Ctor) {
    onError('Voice input not supported in this browser.');
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rec: any = new (Ctor as any)();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = 'en-US';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rec.onresult = (event: any) => {
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const r = event.results[i];
      if (r.isFinal) final += r[0].transcript;
      else interim += r[0].transcript;
    }
    if (final) onResult(final, true);
    else if (interim) onResult(interim, false);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rec.onerror = (e: any) => onError(e.error ?? 'Voice recognition error');

  rec.start();
  return { stop: () => rec.stop() };
}
