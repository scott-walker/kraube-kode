export default function TypingBar({ active }: { active: boolean }) {
  return (
    <div style={{
      height: 2, background: active ? 'var(--accent)' : 'transparent',
      borderRadius: 1, transition: 'all 0.4s ease',
      animation: active ? 'typing-bar 2s ease-in-out infinite' : 'none',
      opacity: active ? 1 : 0,
    }} />
  );
}
