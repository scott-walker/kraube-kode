# 06 — Строгая семантика

> Бэкенд и фронтенд общаются в единых терминах. БД, структуры данных, API — единая терминология. Чёткие, ясные, выразительные названия.

## Почему

Когда фронтенд называет сущность `session`, бэкенд — `conversation`, а БД — `chat_thread` — это три разных ментальных модели одного и того же. Каждый разработчик тратит когнитивный ресурс на перевод между терминами. Баги рождаются на стыках: "я думал `session` — это про WebSocket-сессию, а не про чат".

Единый ubiquitous language (DDD) — это не педантизм, это инженерная необходимость. Когда весь стек говорит на одном языке, код читается как документация.

## Правила

1. **Один термин — одно значение** во всём стеке. `Session` = сессия Claude Code диалога. Везде. Без исключений
2. **Глоссарий обязателен**. Каждый доменный термин зафиксирован с определением
3. **Именование отражает домен, не реализацию**. `sendMessage` — не `postToIPC`. `streamResponse` — не `iterateAsyncGenerator`
4. **Глаголы для действий, существительные для сущностей**. `createSession`, не `sessionCreate`. `Message`, не `MessageData`
5. **Булевы начинаются с is/has/can/should**. `isStreaming`, `canSend`, `hasError`

## Глоссарий проекта

| Термин | Определение | Где используется |
|--------|------------|-----------------|
| **Session** | Один диалог с Claude Code, имеет sessionId | Везде |
| **Message** | Одно сообщение в сессии (user или assistant) | Везде |
| **Block** | Структурная единица assistant-сообщения (text, tool_call, code, diff) | Frontend, Types |
| **Stream** | Поток событий от Claude SDK в реальном времени | Backend, IPC |
| **StreamEvent** | Одно событие в потоке (text, tool_use, result, error) | Везде |
| **Tool** | Инструмент Claude Code (Read, Write, Bash, etc.) | Везде |
| **Settings** | Конфигурация приложения, персистируется | Везде |
| **Theme** | Набор CSS-переменных для визуального оформления | Frontend, Settings |
| **Port** | Интерфейс для взаимодействия с внешней системой | Architecture |
| **Adapter** | Реализация порта для конкретной технологии | Architecture |

## Хорошо

```typescript
// Единая терминология: Session везде — Session
// БД
CREATE TABLE sessions (session_id TEXT PRIMARY KEY, summary TEXT);

// Тип
interface Session { sessionId: string; summary: string; }

// IPC
ipcMain.handle('sessions:list', () => sessionService.list());

// Компонент
function SessionList({ sessions }: { sessions: Session[] }) {}
```

```typescript
// Глаголы ясно описывают действие
async function createSession(): Promise<Session> {}
async function resumeSession(id: string): Promise<void> {}
async function sendMessage(prompt: string): Promise<void> {}
function abortStream(): void {}
```

## Плохо

```typescript
// Один и тот же концепт — три разных имени
// Бэкенд:
interface ConversationData { conv_id: string; }
// Фронтенд:
interface ChatSession { id: number; }
// IPC:
ipcMain.handle('get-thread', () => {});
// БД:
CREATE TABLE dialogs (dialog_id INTEGER);
```

```typescript
// Имя описывает реализацию, не домен
function handleIPCStreamChunkEvent() {}  // что это делает?
// vs
function appendStreamText() {}           // понятно
```

```typescript
// Неочевидные булевы
const streaming = true;      // streaming что? куда?
const ready = false;          // к чему ready?
// vs
const isStreaming = true;     // ясно
const isSdkReady = false;    // ясно
```

## Ограничения

- **Запрещено** использовать разные имена для одной сущности в разных слоях
- **Запрещено** использовать аббревиатуры без определения в глоссарии (MCP, SDK — ок, они общепринятые)
- **Запрещено** именовать по реализации: `sqliteGet`, `ipcSend`, `reduxAction`. Имена — по домену
- **Обязательно** новый доменный термин → сначала в глоссарий, потом в код
- **Обязательно** code review включает проверку семантики имён
