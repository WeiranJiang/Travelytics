import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

const CANNED_REPLIES: { match: RegExp; reply: string }[] = [
  {
    match: /top gap|biggest gap|worst/i,
    reply:
      'The highest-impact gap right now is **pool status at the Broomfield resort** — 22 qualified guests have stayed in the last 2 weeks and the structured data hasn\'t been refreshed since January. Next is noise profile at the Rome property.',
  },
  {
    match: /response rate|how many|respon/i,
    reply:
      'Current 7-day response rate is **68%**, up 11 points from the previous week. Voice responses convert 14% better than text — keep voice-first UX in the review flow.',
  },
  {
    match: /ocala|prop-13|bell gardens|prop-11/i,
    reply:
      'For Ocala (prop-13): property conditions have trended down 0.8 points over 12 months and the listing has not been updated since 2024. Recommend prioritizing a gap question on listing accuracy. For Bell Gardens (prop-11): event-day noise from Los Alamitos racetrack is under-reported in structured fields.',
  },
  {
    match: /renovation|lobby/i,
    reply:
      'Active renovation gaps: **Broomfield lobby** (started Jan 2026, 14 qualified responders pending), **Broomfield spa** (Q1 2025 partial refresh). The lobby question has a confidence score of 0.91 and is ready to send.',
  },
  {
    match: /cost|roi|token|model/i,
    reply:
      'Current per-question cost on gpt-4o-mini averages **$0.0008**. Voice transcription uses the browser Web Speech API to avoid Whisper costs. End-to-end cost per refreshed listing field: ~$0.004.',
  },
  {
    match: /help|what can you/i,
    reply:
      'Ask me about top gaps, response rates, specific properties (e.g. "prop-09 Rome"), cost per question, or whether a given question is ready to send. I can also summarize recent user responses.',
  },
];

function reply(q: string): string {
  const hit = CANNED_REPLIES.find((r) => r.match.test(q));
  return (
    hit?.reply ??
    "I'd look at this in the Overview and Analytics tabs first — I can see 24 active gaps and 47 answers today. For a concrete answer on a specific property, try asking me about it by name."
  );
}

export function AssistantChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: "Hi — I'm the Ask What Matters assistant. I can answer questions about current gaps, user responses, and analytics. Try: \"what's the top gap right now?\"",
    },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const send = () => {
    const q = input.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setTimeout(() => {
      setMessages((m) => [...m, { role: 'assistant', text: reply(q) }]);
    }, 400);
  };

  return (
    <>
      {/* Floating trigger */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-action text-white shadow-float hover:bg-action-hover flex items-center justify-center"
          aria-label="Open assistant"
        >
          <MessageCircle size={22} />
        </button>
      )}
      {/* Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] h-[540px] bg-white rounded-lg shadow-float border border-divider flex flex-col overflow-hidden">
          <header className="bg-navy text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-brand-yellow flex items-center justify-center">
                <Sparkles size={14} className="text-navy" />
              </div>
              <div>
                <div className="text-sm font-semibold">AWM Assistant</div>
                <div className="text-[10px] text-white/70">Offline preview</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="p-1 rounded-full hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </header>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-surface-contrast/40">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
              >
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[80%] rounded-lg bg-action text-white px-3 py-2 text-sm'
                      : 'max-w-[85%] rounded-lg bg-white border border-divider px-3 py-2 text-sm text-navy leading-relaxed'
                  }
                >
                  {m.text.split('**').map((chunk, j) =>
                    j % 2 === 1 ? (
                      <strong key={j}>{chunk}</strong>
                    ) : (
                      <span key={j}>{chunk}</span>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="border-t border-divider px-3 py-2 flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a property, gap, or metric…"
              className="flex-1 rounded-full border border-divider px-3 py-2 text-sm focus:border-action focus:ring-1 focus:ring-action focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="h-9 w-9 rounded-full bg-action text-white flex items-center justify-center disabled:opacity-40 hover:bg-action-hover"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
