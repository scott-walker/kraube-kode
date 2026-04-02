import './TypingBar.css';

export default function TypingBar({ active }: { active: boolean }) {
  return (
    <div className={`typing-bar${active ? ' typing-bar--active' : ''}`} />
  );
}
