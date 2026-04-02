import './PulsingDots.css';

export default function PulsingDots({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  return (
    <span className={`pulsing-dots${size === 'lg' ? ' pulsing-dots--lg' : ''}`}>
      {[0, 1, 2].map(i => (
        <span key={i} className="pulsing-dot" />
      ))}
    </span>
  );
}
