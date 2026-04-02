import { memo } from 'react';
import { useTheme, useSidebarOpen, useSettingsOpen, useSdkStatus, useSdkMessage } from '../../state/selectors';
import { setDragOver, attachFiles } from '../../state/actions';
import { useDragDrop } from '../../hooks/useDragDrop';
import Sidebar from '../sidebar/Sidebar';
import TopBar from './TopBar';
import ChatView from '../chat/ChatView';
import InputArea from '../input/InputArea';
import SettingsOverlay from '../settings/SettingsOverlay';
import { Icons } from '../../icons';
import './AppShell.css';

export default memo(function AppShell() {
  const theme = useTheme();
  const sidebarOpen = useSidebarOpen();
  const settingsOpen = useSettingsOpen();
  const sdkStatus = useSdkStatus();
  const sdkMessage = useSdkMessage();
  const { dragOver, onDragOver, onDragLeave, onDrop } = useDragDrop();

  return (
    <div data-theme={theme} className="app-root">
      {sidebarOpen && <Sidebar />}

      <div className="app-main" onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
        {dragOver && (
          <div className="drag-overlay">
            <div className="drag-overlay__content">
              <Icons.Paperclip size={48} />
              <span className="drag-overlay__label">Drop files to attach</span>
            </div>
          </div>
        )}

        <TopBar />

        {sdkStatus !== 'ready' ? (
          <div className="init-screen">
            <Icons.Terminal size={48} />
            <div className="init-screen__title">
              {sdkStatus === 'error' ? 'Initialization failed' : 'Starting Claude Code SDK…'}
            </div>
            <div className="init-screen__message">{sdkMessage}</div>
          </div>
        ) : (
          <>
            <ChatView />
            <InputArea />
          </>
        )}
      </div>

      {settingsOpen && <SettingsOverlay />}
    </div>
  );
});
