import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { Claude } from '@scottwalker/claude-connector';

if (started) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
const claude = new Claude();

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 500,
    minHeight: 400,
    title: 'Kraube Kode',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
};

// IPC: stream a prompt to Claude
ipcMain.on('claude:stream', async (_event, prompt: string) => {
  if (!mainWindow) return;
  const wc = mainWindow.webContents;

  try {
    const stream = claude.stream(prompt);

    stream
      .on('text', (chunk: string) => {
        wc.send('claude:stream:chunk', chunk);
      })
      .on('error', (err: Error) => {
        wc.send('claude:stream:error', err.message);
      })
      .on('result', () => {
        wc.send('claude:stream:end');
      });

    await stream.done();
  } catch (err) {
    wc.send('claude:stream:error', err instanceof Error ? err.message : String(err));
    wc.send('claude:stream:end');
  }
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
