# 04 — Контракты, интерфейсы и абстракции

> Архитектура строится на контрактах и интерфейсах. Паттерны: порты, стратегии, адаптеры. Максимальная абстрактность.

## Почему

Код, привязанный к конкретной реализации, невозможно менять без каскадных правок. Сегодня мы используем `kraube-konnektor` — завтра может появиться другой SDK. Сегодня SQLite — завтра PostgreSQL. Сегодня Electron IPC — завтра WebSocket.

Контракт (интерфейс) — это обещание: "я предоставляю такие методы с такими сигнатурами". Реализация может быть любой. Потребитель работает с контрактом, не с реализацией. Это и есть Loose Coupling.

## Правила

1. **Каждый слой общается через интерфейс**. UI → StateManager → Service → Port → Adapter → External
2. **Dependency Inversion**. Высокоуровневый модуль не зависит от низкоуровневого. Оба зависят от абстракции
3. **Port** — интерфейс, описывающий что нужно системе от внешнего мира
4. **Adapter** — реализация порта для конкретной технологии
5. **Strategy** — взаимозаменяемые алгоритмы за единым интерфейсом

## Архитектура слоёв

```
┌─────────────────────────────────────────────┐
│  UI Layer (React components)                │
│  - Только рендеринг и user interactions     │
│  - Читает данные через селекторы            │
│  - Отправляет actions в StateManager        │
└──────────────┬──────────────────────────────┘
               │ actions / selectors
┌──────────────▼──────────────────────────────┐
│  StateManager                               │
│  - Единый стор состояния                    │
│  - Computed properties                      │
│  - Middleware: persistence, IPC, logging     │
└──────────────┬──────────────────────────────┘
               │ service calls
┌──────────────▼──────────────────────────────┐
│  Service Layer                              │
│  - Бизнес-логика, оркестрация               │
│  - Работает через порты (интерфейсы)        │
└──────────────┬──────────────────────────────┘
               │ port interfaces
┌──────────────▼──────────────────────────────┐
│  Ports (interfaces)                         │
│  - IClaudePort                              │
│  - IStoragePort                             │
│  - ISettingsPort                            │
└──────────────┬──────────────────────────────┘
               │ implementations
┌──────────────▼──────────────────────────────┐
│  Adapters (implementations)                 │
│  - ClaudeConnectorAdapter                   │
│  - SQLiteStorageAdapter                     │
│  - ElectronIPCAdapter                       │
└─────────────────────────────────────────────┘
```

## Хорошо

```typescript
// Порт — контракт, без привязки к реализации
interface IClaudePort {
  init(): Promise<void>;
  stream(prompt: string): AsyncIterable<StreamEvent>;
  abort(): void;
  close(): void;
  readonly ready: boolean;
}

// Адаптер — конкретная реализация порта
class ClaudeConnectorAdapter implements IClaudePort {
  private claude: Claude;

  async init() { await this.claude.init(); }
  stream(prompt: string) { return this.claude.stream(prompt); }
  abort() { this.claude.abort(); }
  close() { this.claude.close(); }
  get ready() { return this.claude.ready; }
}

// Сервис работает с портом, не с адаптером
class ChatService {
  constructor(private claude: IClaudePort) {}

  async sendMessage(prompt: string): AsyncIterable<StreamEvent> {
    if (!this.claude.ready) throw new Error('Not ready');
    return this.claude.stream(prompt);
  }
}
```

```typescript
// Порт для хранения — можно подменить реализацию
interface IStoragePort {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  query<T>(collection: string, filter: Filter): Promise<T[]>;
}

// Адаптер для SQLite
class SQLiteStorageAdapter implements IStoragePort { /* ... */ }

// Адаптер для тестов
class InMemoryStorageAdapter implements IStoragePort { /* ... */ }
```

## Плохо

```typescript
// Прямая зависимость от реализации — невозможно подменить
import { Claude } from '@scottwalker/kraube-konnektor';

class ChatService {
  private claude = new Claude({ model: 'sonnet' });
  // ChatService намертво привязан к kraube-konnektor
  // Тестировать можно только с реальным Claude CLI
}
```

```typescript
// Бизнес-логика в компоненте — нарушение слоёв
function ChatView() {
  const handleSend = async (text: string) => {
    const result = await window.claude.send(text);  // прямой вызов IPC
    setMessages(prev => [...prev, result]);           // прямая мутация
    await db.messages.insert(result);                 // прямая запись в БД
  };
}
```

## Ограничения

- **Запрещено** импортировать конкретные реализации в сервисном слое. Только интерфейсы
- **Запрещено** вызывать IPC/БД/внешние API напрямую из UI-компонентов
- **Запрещено** создавать God-объекты. Каждый порт/сервис — одна ответственность
- **Обязательно** каждый порт должен быть тестируемым через mock/stub
- **Обязательно** DI (dependency injection) — зависимости передаются, не создаются внутри
