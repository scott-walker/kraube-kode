# 10 — Чистый фронтенд

> Фронтенд должен быть максимально чистым и декомпозированным.

## Почему

Фронтенд-компонент, который содержит бизнес-логику, работу с данными и рендеринг — это монолит в миниатюре. Его невозможно тестировать без mount'а React-дерева, невозможно переиспользовать, невозможно понять без прочтения целиком.

Чистый компонент — это функция: props → JSX. Без side effects, без прямых вызовов API, без мутаций внешнего состояния. Всё остальное — в хуках, сервисах, StateManager.

## Правила

1. **Компонент = рендеринг**. Получает данные через props/селекторы, возвращает JSX. Точка
2. **Логика — в хуках**. `useChat()`, `useSettings()`, `useStream()` инкапсулируют поведение
3. **Нет бизнес-логики в компонентах**. Обработка событий, фильтрация данных, форматирование — за пределами JSX
4. **Нет вложенности > 3 уровней**. Если компонент содержит компонент, который содержит компонент — декомпозируй
5. **Нет условного рендеринга с логикой**. `{isReady && hasSession && !isError && <Chat />}` — вынести в computed

## Хорошо

```typescript
// Чистый компонент — только рендеринг
function ToolCallBlock({ name, status, detail, duration }: ToolCallBlockProps) {
  return (
    <div className="tool-call-block">
      <StatusIcon status={status} />
      <span className="tool-call-name">{name}</span>
      {detail && <span className="tool-call-detail">{detail}</span>}
      <Duration value={duration} />
    </div>
  );
}
```

```typescript
// Логика в хуке, компонент чистый
function ChatView() {
  const { messages, isStreaming } = useChat();

  return (
    <div className="chat-view">
      <MessageList messages={messages} />
      {isStreaming && <StreamingIndicator />}
    </div>
  );
}

// Хук инкапсулирует всю логику
function useChat() {
  const messages = useSelector(selectActiveMessages);
  const isStreaming = useSelector(selectIsStreaming);
  return { messages, isStreaming };
}
```

## Плохо

```typescript
// Грязный компонент — логика, API-вызовы, форматирование, рендеринг
function ChatView() {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    const cleanup = window.claude.onEvent((_, event) => {
      if (event.type === 'text') {
        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          // ...30 строк логики обработки событий
        });
      }
    });
    return cleanup;
  }, []);

  const handleSend = async (text: string) => {
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setStreaming(true);
    window.claude.send(text);
  };

  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i}>
          {msg.role === 'user' ? (
            <div>{msg.content}</div>
          ) : msg.blocks ? (
            msg.blocks.map((block, j) => {
              switch (block.type) {
                case 'text': return <div key={j}>{block.content}</div>;
                // ...ещё 10 case'ов прямо в JSX
              }
            })
          ) : null}
        </div>
      ))}
    </div>
  );
}
```

## Ограничения

- **Запрещено** `useEffect` с бизнес-логикой в компонентах. Вынести в кастомный хук
- **Запрещено** `switch/case` внутри JSX. Вынести в отдельный компонент или маппинг
- **Запрещено** `dangerouslySetInnerHTML` без санитизации
- **Запрещено** анонимные функции в props, создаваемые на каждый рендер (без `useCallback`)
- **Допускается** `useState` для локального UI-состояния (input value, tooltip visible)
- **Обязательно** каждый компонент < 100 строк. Больше — декомпозировать
