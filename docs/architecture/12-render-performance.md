# 12 — Производительность рендеринга

> Минимальное количество ре-рендеров. Избегать сложных перерисовок. Максимально отзывчивый интерфейс.

## Почему

Чат с Claude Code — это поток событий в реальном времени. Каждый `text` chunk — потенциальный ре-рендер. Каждый `tool_use` — обновление блока. При плохой оптимизации 100 text-чанков за секунду = 100 полных перерисовок дерева = лаг, зависание, dropped frames.

Electron уже тяжелее нативного приложения. Наша задача — компенсировать это хирургической точностью рендеринга: обновлять только то, что реально изменилось.

## Правила

1. **Гранулярные подписки**. Компонент подписан на минимальный срез состояния. Не на весь стор
2. **React.memo для чистых компонентов**. Компонент с одинаковыми props не перерисовывается
3. **useMemo / useCallback** для дорогих вычислений и коллбэков, передаваемых в дочерние компоненты
4. **Виртуализация списков**. Сообщения за пределами viewport не рендерятся
5. **Батчинг обновлений**. Несколько state-изменений за один тик → один ре-рендер

## Критические пути

### Стриминг текста

```typescript
// ПЛОХО: каждый чанк → полный ре-рендер всех сообщений
onEvent((event) => {
  setMessages(prev => {
    const updated = [...prev];  // копия ВСЕГО массива
    // ...
    return updated;
  });
});

// ХОРОШО: обновляется только последний блок стримящегося сообщения
// StateManager хранит сообщения нормализованно
// Компонент подписан на конкретное сообщение по ID
// Текстовый блок подписан на конкретный блок по index
// При обновлении текста перерисовывается только TextBlock, не весь ChatView
```

### Список сессий

```typescript
// ПЛОХО: весь список перерисовывается при изменении одной сессии
function SessionList({ sessions }: { sessions: Session[] }) {
  return sessions.map(s => <SessionItem key={s.id} session={s} />);
}

// ХОРОШО: виртуализация + memo
const SessionItem = React.memo(({ session }: { session: Session }) => (
  <div className="session-item">...</div>
));

function SessionList() {
  const sessionIds = useSelector(selectSessionIds); // только ID
  return (
    <VirtualList items={sessionIds} renderItem={(id) =>
      <SessionItemConnected key={id} sessionId={id} />
    } />
  );
}
```

## Паттерны оптимизации

### Нормализация + гранулярные селекторы

```typescript
// Нормализованный стор
state = {
  messages: {
    byId: { 'msg-1': { ... }, 'msg-2': { ... } },
    ids: ['msg-1', 'msg-2'],
  }
};

// Каждый MessageBubble подписан на свой ID
function MessageBubble({ messageId }: { messageId: string }) {
  const message = useSelector(state => state.messages.byId[messageId]);
  // Перерисуется только когда ЕГО сообщение изменится
}
```

### Ref для мутабельных данных стрима

```typescript
// Стриминговые блоки накапливаются в ref (без ре-рендера)
// Ре-рендер по таймеру/requestAnimationFrame — максимум 60fps
const blocksRef = useRef<Block[]>([]);
const [renderTick, setRenderTick] = useState(0);

useEffect(() => {
  let rafId: number;
  const flush = () => {
    setRenderTick(t => t + 1); // один ре-рендер
    rafId = requestAnimationFrame(flush);
  };
  rafId = requestAnimationFrame(flush);
  return () => cancelAnimationFrame(rafId);
}, []);
```

## Хорошо

```typescript
// Memo — чистый компонент не перерисовывается при неизменных props
const ToolCallBlock = React.memo(function ToolCallBlock({ name, status }: Props) {
  return <div className="tool-call-block">...</div>;
});

// useCallback — стабильная ссылка, дочерний memo-компонент не ре-рендерится
const handleSend = useCallback((text: string) => {
  dispatch(sendMessage(text));
}, [dispatch]);
```

## Плохо

```typescript
// Новый объект на каждый рендер → memo бесполезен
<ToolCallBlock style={{ padding: 8 }} />  // style = новый объект каждый раз
<SessionList onSelect={(id) => setActive(id)} />  // новая функция каждый раз
```

```typescript
// Весь массив пересоздаётся при каждом чанке стрима
setMessages(prev => [...prev.slice(0, -1), { ...prev[prev.length-1], content: newContent }]);
// 100 чанков/сек = 100 полных копий массива
```

## Ограничения

- **Запрещено** передавать inline-объекты/функции в props memo-компонентов
- **Запрещено** подписываться на весь стор. Только гранулярные селекторы
- **Запрещено** пересоздавать массивы/объекты в рендер-фазе. `useMemo` для вычислений
- **Обязательно** `React.memo` для всех компонентов, получающих props от родителя
- **Обязательно** виртуализация для списков > 50 элементов
- **Обязательно** профилирование React DevTools при любых изменениях в чат/стриминг компонентах
- **Целевые метрики**: < 16ms на frame (60fps), < 3 ре-рендера на один stream event
