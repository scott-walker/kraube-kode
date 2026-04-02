import { memo } from 'react';
import { Icons } from '../../icons';

const OPTIONS = [
  { label: 'Auto-approve', icon: <Icons.Check size={12} />, active: false },
  { label: 'Loop mode',    icon: <Icons.Loop size={12} />,  active: true },
  { label: 'Verbose',      icon: <Icons.Eye size={12} />,   active: false },
];

export default memo(function InputToolbar() {
  return (
    <div className="input-area__toolbar">
      {OPTIONS.map((opt, i) => (
        <button key={i} className={`input-area__opt-btn${opt.active ? ' is-active' : ''}`}>
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
});
