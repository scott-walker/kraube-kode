import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { SqliteAdapter } from './adapters/sqlite.adapter';
import { ClaudeConnectorAdapter } from './adapters/kraube-konnektor.adapter';
import { SettingsService } from './services/settings.service';
import { StreamGuard } from './services/stream-guard';
import { DEFAULT_SETTINGS } from '../core/types/settings';
import { registerSettingsHandlers } from './ipc/settings.handler';
import { registerClaudeHandlers } from './ipc/claude.handler';
import { registerWindowHandlers } from './ipc/window.handler';
import { registerTranscriptionHandlers } from './ipc/transcription.handler';
import { registerMcpHandlers } from './ipc/mcp.handler';
import { OpenAIWhisperAdapter } from './adapters/openai-whisper.adapter';
import type { ITranscriptionPort } from '../core/ports/transcription.port';

if (started) app.quit();

const ZOOM_STEP = 0.05;

// ── DI wiring ──
const storage = new SqliteAdapter(app.getPath('userData'));
storage.open();

const settingsService = new SettingsService(storage);
const claudeAdapter = new ClaudeConnectorAdapter(settingsService.current);
const streamGuard = new StreamGuard(claudeAdapter);

const transcriptionAdapters: Record<string, ITranscriptionPort> = {
  'openai-whisper': new OpenAIWhisperAdapter(() => settingsService.current.transcriptionApiKey),
};
const getTranscriptionAdapter = (): ITranscriptionPort => {
  const provider = settingsService.current.transcriptionProvider;
  return transcriptionAdapters[provider] ?? transcriptionAdapters['openai-whisper'];
};

let mainWindow: BrowserWindow | null = null;
const getWindow = () => mainWindow;

// ── IPC ──
registerSettingsHandlers(settingsService, () => claudeAdapter.reinit(settingsService.current));
registerClaudeHandlers(getWindow, claudeAdapter, streamGuard);
registerWindowHandlers(getWindow, claudeAdapter);
registerTranscriptionHandlers(getTranscriptionAdapter, settingsService);
registerMcpHandlers(claudeAdapter);

// ── Window ──
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600, height: 1000, minWidth: 800, minHeight: 600,
    title: 'Kraube Kode', frame: false, titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
    },
  });

  mainWindow.webContents.on('did-fail-load', (_e, errorCode, _desc, url) => {
    // ERR_CONNECTION_REFUSED (-102): dev server not ready yet, retry after short delay
    if (errorCode === -102 && MAIN_WINDOW_VITE_DEV_SERVER_URL && url.startsWith('http://localhost')) {
      setTimeout(() => mainWindow?.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL), 500);
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.setZoomFactor(settingsService.current.zoomFactor);
    if (claudeAdapter.ready) mainWindow.webContents.send('claude:init-ready');
    else if (claudeAdapter.initError) mainWindow.webContents.send('claude:init-error', claudeAdapter.initError);
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  else mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
}

// ── Lifecycle ──
app.on('ready', () => {
  createWindow();
  claudeAdapter.onInitStage((info) => mainWindow?.webContents.send('claude:init-stage', info));
  claudeAdapter.onInitReady(() => mainWindow?.webContents.send('claude:init-ready'));
  claudeAdapter.onInitError((msg) => mainWindow?.webContents.send('claude:init-error', msg));
  claudeAdapter.init().catch(() => {});

  const applyZoom = (factor: number) => {
    const clamped = Math.round(Math.max(0.5, Math.min(3, factor)) * 100) / 100;
    mainWindow?.webContents.setZoomFactor(clamped);
    settingsService.update({ zoomFactor: clamped });
  };

  mainWindow.webContents.on('before-input-event', (_event, input) => {
    if (!input.control && !input.meta) return;
    if (input.type !== 'keyDown') return;
    const wc = mainWindow?.webContents;
    if (!wc) return;

    if (input.key === '+' || input.key === '=') {
      _event.preventDefault();
      applyZoom(wc.getZoomFactor() + ZOOM_STEP);
    } else if (input.key === '-') {
      _event.preventDefault();
      applyZoom(wc.getZoomFactor() - ZOOM_STEP);
    } else if (input.key === '0') {
      _event.preventDefault();
      applyZoom(DEFAULT_SETTINGS.zoomFactor);
    }
  });
});

app.on('window-all-closed', () => {
  claudeAdapter.close();
  storage.close();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
