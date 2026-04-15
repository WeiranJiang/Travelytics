export function Avatar({ initial, size = 40 }: { initial: string; size?: number }) {
  return (
    <div
      className="inline-flex items-center justify-center rounded-full bg-[#4D5167] text-white font-medium border border-divider"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial.toUpperCase()}
    </div>
  );
}
