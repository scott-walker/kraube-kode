import { memo, useEffect } from 'react';
import { pushOverlay, popOverlay } from '../../state/actions';
import './ConfirmDialog.css';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default memo(function ConfirmDialog({ title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel }: Props) {
  useEffect(() => {
    pushOverlay();
    return () => popOverlay();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <h3 className="confirm-dialog__title">{title}</h3>
        <p className="confirm-dialog__message">{message}</p>
        <div className="confirm-dialog__actions">
          <button className="confirm-dialog__btn confirm-dialog__btn--cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`confirm-dialog__btn${danger ? ' confirm-dialog__btn--danger' : ' confirm-dialog__btn--confirm'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
});
