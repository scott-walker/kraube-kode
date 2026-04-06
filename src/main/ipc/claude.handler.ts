import { ipcMain, dialog, nativeImage, type BrowserWindow } from 'electron';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { tmpdir } from 'node:os';
import type { IClaudePort } from '../../core/ports/claude.port';
import type { StreamGuard } from '../services/stream-guard';

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg']);

function isImagePath(filePath: string): boolean {
  const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
  return IMAGE_EXTS.has(ext);
}

async function buildFileInput(files: string[]): Promise<{ input?: string; images: string[] }> {
  if (files.length === 0) return { images: [] };
  const textParts: string[] = [];
  const images: string[] = [];
  for (const filePath of files) {
    if (isImagePath(filePath)) {
      images.push(filePath);
    } else {
      try {
        const content = await readFile(filePath, 'utf-8');
        textParts.push(`File: ${basename(filePath)} (${filePath})\n\`\`\`\n${content}\n\`\`\``);
      } catch {
        textParts.push(`File: ${basename(filePath)} (${filePath})\n[Error: could not read file]`);
      }
    }
  }
  return { input: textParts.length > 0 ? textParts.join('\n\n') : undefined, images };
}

export function registerClaudeHandlers(
  getWindow: () => BrowserWindow | null,
  claudePort: IClaudePort,
  streamGuard: StreamGuard,
): void {
  ipcMain.on('claude:send', async (_event, prompt: string, files?: string[], options?: Record<string, string>) => {
    const wc = getWindow()?.webContents;
    if (!wc) return;

    if (!claudePort.ready) {
      wc.send('claude:event', { type: 'error', message: 'SDK not ready. Wait for initialization or check settings.' });
      return;
    }

    try {
      const { input, images } = await buildFileInput(files ?? []);
      const fullPrompt = images.length > 0
        ? `${prompt}\n\n[Attached images: ${images.join(', ')}]`
        : prompt;
      for await (const event of streamGuard.stream(fullPrompt, input, options)) {
        wc.send('claude:event', event);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      wc.send('claude:event', { type: 'error', message });
    }
  });

  ipcMain.on('claude:abort', () => streamGuard.abort());

  ipcMain.handle('claude:get-sdk-status', () => {
    if (claudePort.ready) return { status: 'ready' };
    if (claudePort.initError) return { status: 'error', message: claudePort.initError };
    return { status: 'initializing' };
  });

  ipcMain.handle('claude:get-cwd', () => claudePort.cwd);

  ipcMain.handle('claude:save-temp-image', async (_event, bytes: Uint8Array, mimeType: string) => {
    const ext = mimeType === 'image/png' ? '.png' : mimeType === 'image/jpeg' ? '.jpg' : '.png';
    const dir = join(tmpdir(), 'kraube-kode-images');
    await mkdir(dir, { recursive: true });
    const filePath = join(dir, `paste-${Date.now()}${ext}`);
    await writeFile(filePath, Buffer.from(bytes));
    return filePath;
  });

  ipcMain.handle('claude:read-thumbnail', async (_event, filePath: string, size: number) => {
    try {
      const img = nativeImage.createFromPath(filePath);
      if (img.isEmpty()) return null;
      const resized = img.resize({ width: size, height: size });
      return resized.toDataURL();
    } catch {
      return null;
    }
  });

  ipcMain.handle('claude:list-sessions', (_event, limit?: number) => claudePort.listSessions(limit));

  ipcMain.handle('claude:supported-commands', () => claudePort.supportedCommands());

  ipcMain.handle('claude:get-session-messages', (_event, sessionId: string) =>
    claudePort.getSessionMessages(sessionId),
  );

  ipcMain.handle('claude:delete-session', async (_event, sessionId: string) => {
    const deleted = await claudePort.deleteSession(sessionId);
    return deleted;
  });

  ipcMain.handle('claude:pick-files', async () => {
    const win = getWindow();
    const result = await dialog.showOpenDialog(win!, {
      properties: ['openFile', 'multiSelections'],
      title: 'Attach files',
    });
    return result.canceled ? [] : result.filePaths;
  });

  ipcMain.handle('claude:new-session', async () => {
    const win = getWindow();
    const result = await dialog.showOpenDialog(win!, {
      properties: ['openDirectory'],
      title: 'Select project directory',
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    const cwd = result.filePaths[0];
    const switchResult = claudePort.newSession(cwd);
    if (switchResult === 'instant') {
      getWindow()?.webContents.send('claude:init-ready');
    }
    return cwd;
  });

  ipcMain.handle('claude:resume-session', (_event, cwd: string) => {
    const result = claudePort.resumeSession(cwd);
    if (result === 'instant') {
      getWindow()?.webContents.send('claude:init-ready');
    }
    return { instant: result === 'instant' };
  });
}
