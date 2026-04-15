import { useEffect, useState } from 'react';

/**
 * CSS-only confetti burst. Generates 40 pieces that fall with randomized
 * horizontal drift. Mounts briefly, then unmounts to free DOM.
 */
export function Confetti({ durationMs = 3500 }: { durationMs?: number }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), durationMs);
    return () => clearTimeout(t);
  }, [durationMs]);

  if (!visible) return null;

  const colors = ['#1668E3', '#FEC84C', '#227950', '#FDDB32', '#6AE0EB'];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 2.2 + Math.random() * 1.2,
    rotate: Math.random() * 720,
    color: colors[i % colors.length],
    size: 6 + Math.random() * 8,
  }));

  return (
    <>
      <style>{`
        @keyframes awm-confetti-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(var(--r)); opacity: 0.6; }
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {pieces.map((p) => (
          <span
            key={p.id}
            style={{
              position: 'absolute',
              top: 0,
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.4,
              backgroundColor: p.color,
              borderRadius: 1,
              animation: `awm-confetti-fall ${p.duration}s ${p.delay}s linear forwards`,
              // custom property consumed by keyframes
              ['--r' as string]: `${p.rotate}deg`,
            }}
          />
        ))}
      </div>
    </>
  );
}
