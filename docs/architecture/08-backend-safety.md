# 08 — Безопасность бэкенда: память, процессы, гонки

> Следить за потреблением памяти, за процессами. Не допускать утечек, неоправданной нагрузки, гонки состояний, конкурирующих операций.

## Почему

Electron-приложение — это два процесса (main + renderer), каждый со своим heap. Утечка в main-процессе не видна пользователю, пока приложение не сожрёт всю память и не упадёт через 3 часа работы. Гонка состояний в IPC — это "иногда работает, иногда нет" — самый мерзкий класс багов.

Claude Code SDK спавнит дочерние процессы. Если не отслеживать их lifecycle — zombie процессы накапливаются. Если не контролировать параллельные стримы — два запроса могут писать в один поток данных.

## Правила

1. **Каждый ресурс имеет owner и lifecycle**. Создал → используешь → закрываешь. Нет бесхозных handle'ов
2. **Cleanup обязателен**. `useEffect` → return cleanup. `EventEmitter.on` → `.off`. `stream` → `abort` при отмене
3. **Один активный стрим**. Параллельные стримы запрещены. Новый запрос — сначала abort предыдущего
4. **Mutex для критических секций**. Одновременная запись в БД, одновременный init — через блокировку
5. **Мониторинг в dev-режиме**. Логирование heap size, количества listeners, активных процессов

## Типичные утечки и как их предотвратить

### Event listeners

```typescript
// УТЕЧКА: listener не удаляется
ipcRenderer.on('claude:event', handler);
// При каждом mount компонента добавляется новый listener

// ПРАВИЛЬНО: cleanup в useEffect
useEffect(() => {
  const cleanup = window.claude.onEvent(handler);
  return cleanup;
}, []);
```

### Не закрытые стримы

```typescript
// УТЕЧКА: стрим не прерывается при unmount
const handle = claude.stream(prompt);
for await (const event of handle) { /* ... */ }
// Если компонент размонтирован — стрим продолжает работать

// ПРАВИЛЬНО: AbortController
const controller = new AbortController();
const handle = claude.stream(prompt, { signal: controller.signal });
// При unmount/отмене:
controller.abort();
```

### Гонка состояний

```typescript
// ГОНКА: два быстрых клика → два параллельных стрима
async function handleSend(prompt: string) {
  const handle = claude.stream(prompt);
  for await (const event of handle) {
    updateMessages(event);  // какой стрим пишет? оба?
  }
}

// ПРАВИЛЬНО: mutex + abort предыдущего
class StreamGuard {
  private controller: AbortController | null = null;

  async start(prompt: string): AsyncIterable<StreamEvent> {
    // Abort previous stream
    this.controller?.abort();
    this.controller = new AbortController();

    return claude.stream(prompt, {
      signal: this.controller.signal,
    });
  }

  abort() {
    this.controller?.abort();
    this.controller = null;
  }
}
```

### IPC race conditions

```typescript
// ГОНКА: settings:save вызван дважды быстро
// Первый save начинает reinit, второй — тоже
// Два init параллельно → undefined behavior

// ПРАВИЛЬНО: очередь операций
class InitQueue {
  private pending: Promise<void> = Promise.resolve();

  enqueue(fn: () => Promise<void>): Promise<void> {
    this.pending = this.pending.then(fn, fn);
    return this.pending;
  }
}
```

## Хорошо

```typescript
// Чёткий lifecycle: create → use → cleanup
app.on('ready', () => {
  claude = createClaude(settings);
  claude.init();
});

app.on('window-all-closed', () => {
  claude.close();  // cleanup
  app.quit();
});
```

## Ограничения

- **Запрещено** оставлять event listeners без cleanup
- **Запрещено** параллельные стримы к одному Claude instance
- **Запрещено** fire-and-forget для async операций, меняющих состояние. Всегда await + error handling
- **Запрещено** `setInterval` / `setTimeout` без сохранения ID и clearInterval/clearTimeout
- **Обязательно** каждый `on()` имеет парный `off()` / cleanup function
- **Обязательно** AbortController для всех отменяемых операций
- **Обязательно** в dev-режиме: предупреждение при >50 listeners на одном emitter
