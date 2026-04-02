import { memo } from 'react';
import { Icons } from '../../icons';
import { useSdkStatus, useSdkMessage } from '../../state/selectors';
import './EmptyState.css';

export default memo(function EmptyState() {
  const sdkStatus = useSdkStatus();
  const sdkMessage = useSdkMessage();
  const ready = sdkStatus === 'ready';

  return (
    <div className="chat-empty">
      {ready ? <Icons.Terminal size={48} /> : <Icons.Spinner size={48} />}
      <h2 className="chat-empty__title">
        {ready ? 'Kraube Kode' : 'Starting Claude Code SDK…'}
      </h2>
      <p className="chat-empty__subtitle">
        {ready ? 'Start a conversation with Claude' : sdkMessage || 'Initializing…'}
      </p>
    </div>
  );
});
