# 03 — StateManager и единый источник истины (фронтенд)

> Единый StateManager — единственный поставщик DataLayer. Консистентное, непротиворечивое состояние. Минимум данных, максимум вычислимых производных. Минимум мутаций.

## Почему

Когда состояние разбросано по десяткам `useState` в разных компонентах, невозможно гарантировать его консистентность. Компонент A показывает "connected", компонент B — "disconnected". Кто прав? Никто не знает, потому что нет единого источника.

StateManager решает это: одно место, одна правда, все остальные — подписчики. Computed properties гарантируют, что производные данные всегда актуальны и никогда не рассинхронизируются с базовыми.

## Правила

1. **Один StateManager на приложение**. Никаких параллельных сторов, контекстов-дублёров
2. **Минимальный набор базовых данных**. Если значение можно вычислить из других — оно computed, не stored
3. **Мутации только через actions/dispatch**. Прямое изменение state запрещено
4. **Селекторы для чтения**. Компоненты подписываются на конкретные срезы, а не на весь стор
5. **Нормализованные данные**. Сущности хранятся по ID, связи — через ссылки

## Структура состояния

```typescript
interface AppState {
  // ─── Базовые данные (хранятся) ───
  settings: AppSettings;
  sessions: Record<string, SessionEntity>;
  activeSessionId: string | null;
  messages: Record<string, MessageEntity[]>;  // sessionId → messages
  sdkStatus: 'idle' | 'initializing' | 'ready' | 'error';
  sdkError: string | null;

  // ─── Транзиентное UI (НЕ персистируется) ───
  ui: {
    sidebarOpen: boolean;
    settingsOpen: boolean;
    streamingSessionId: string | null;
  };
}

// ─── Computed (вычисляются, НЕ хранятся) ───
// activeSession    = sessions[activeSessionId]
// activeMessages   = messages[activeSessionId]
// isStreaming      = ui.streamingSessionId !== null
// canSend          = sdkStatus === 'ready' && !isStreaming
// sessionList      = Object.values(sessions).sort(byLastModified)
```

## Хорошо

```typescript
// Computed property — всегда актуально, нет рассинхронизации
const isStreaming = computed(() => store.ui.streamingSessionId !== null);

// Селектор — компонент подписан только на то, что ему нужно
const activeMessages = useSelector(state =>
  state.messages[state.activeSessionId] ?? []
);
```

```typescript
// Мутация через action — единая точка изменения
store.dispatch(addMessage(sessionId, message));
// Middleware: persist → IPC → re-render
```

## Плохо

```typescript
// Разбросанный state — невозможно отследить, кто что меняет
const [messages, setMessages] = useState([]);
const [isStreaming, setIsStreaming] = useState(false);
const [activeSession, setActiveSession] = useState(null);
// 3 независимых useState, которые должны быть согласованы вручную

// Дублирование: isStreaming хранится отдельно, хотя вычислимо
setIsStreaming(true);  // а если забыли сбросить в false?
```

```typescript
// Хранение вычислимых данных
const [sessionCount, setSessionCount] = useState(0);
// При добавлении сессии нужно не забыть обновить sessionCount
// Вместо: const sessionCount = computed(() => Object.keys(sessions).length)
```

## Ограничения

- **Запрещено** использовать `useState` для данных, которые шарятся между компонентами. Только StateManager
- **Запрещено** хранить вычислимые данные. `isStreaming`, `sessionCount`, `canSend` — computed
- **Запрещено** мутировать state напрямую. Только через dispatch/actions
- **Допускается** `useState` для локального UI-состояния компонента (hover, local input value, animation state)
- **Обязательно** каждый action — чистая функция без side effects. Side effects — в middleware
