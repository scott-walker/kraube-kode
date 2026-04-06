import { memo, useState, useEffect, useCallback } from 'react';
import { useTheme, useSidebarOpen, useCurrentView, useSdkStatus, useSdkMessage, useConnectionSetupRequired } from '../../state/selectors';
import { useDragDrop } from '../../hooks/useDragDrop';
import Sidebar from '../sidebar/Sidebar';
import SidebarMini from '../sidebar/SidebarMini';
import TopBar from './TopBar';
import ChatView from '../chat/ChatView';
import InputArea from '../input/InputArea';
import SettingsPage from '../settings/SettingsPage';
import ManagementPage from '../management/ManagementPage';
import ConnectionSetupModal from '../connections/ConnectionSetupModal';
import ConfirmDialog from '../shared/ConfirmDialog';
import { Icons } from '../../icons';
import './AppShell.css';

export default memo(function AppShell() {
  const theme = useTheme();
  const sidebarOpen = useSidebarOpen();
  const currentView = useCurrentView();
  const sdkStatus = useSdkStatus();
  const sdkMessage = useSdkMessage();
  const setupRequired = useConnectionSetupRequired();
  const { dragOver, onDragEnter, onDragOver, onDragLeave, onDrop } = useDragDrop();

  const [closeRequested, setCloseRequested] = useState(false);

  useEffect(() => {
    return window.windowControls.onConfirmClose(() => setCloseRequested(true));
  }, []);

  const handleConfirmClose = useCallback(() => {
    setCloseRequested(false);
    window.windowControls.confirmCloseResponse(true);
  }, []);

  const handleCancelClose = useCallback(() => {
    setCloseRequested(false);
    window.windowControls.confirmCloseResponse(false);
  }, []);

  return (
    <div data-theme={theme} className="app-root">
      {closeRequested && (
        <ConfirmDialog
          title="Quit Kraube Kode?"
          message="Are you sure you want to close the application?"
          confirmLabel="Quit"
          danger
          onConfirm={handleConfirmClose}
          onCancel={handleCancelClose}
        />
      )}
      {setupRequired && <ConnectionSetupModal />}
      {sidebarOpen ? <Sidebar /> : <SidebarMini />}

      <div className={`app-main${!sidebarOpen ? ' app-main--collapsed' : ''}`} onDragEnter={onDragEnter} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
        <TopBar />

        {currentView === 'settings' ? (
          <SettingsPage />
        ) : currentView === 'management' ? (
          <ManagementPage />
        ) : (
          <>
            {dragOver && (
              <div className="drag-overlay">
                <div className="drag-overlay__content">
                  <Icons.Paperclip size={48} />
                  <span className="drag-overlay__label">Drop files to attach</span>
                </div>
              </div>
            )}

            {sdkStatus !== 'ready' ? (
              <div className="init-screen">
                <Icons.Spinner size={48} />
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
          </>
        )}

      </div>
    </div>
  );
});
