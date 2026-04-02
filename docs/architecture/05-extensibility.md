# 05 — Расширяемость и плагины

> Приложение должно быть максимально приспособлено к масштабированию, установке плагинов и пакетов в будущем.

## Почему

Приложение, которое нельзя расширить без переписывания ядра — это приложение с ограниченным сроком жизни. Каждая новая фича потребует всё больше хирургических вмешательств в core, пока система не станет неподдерживаемой.

Open/Closed Principle: система открыта для расширения, закрыта для модификации. Добавление новой темы, нового MCP-сервера, нового типа блока в чате — не должно требовать изменения ядра.

## Правила

1. **Plugin API** — документированный контракт для расширений. Плагин регистрирует свои возможности, ядро их подхватывает
2. **Registry pattern** — центральные реестры для расширяемых сущностей (блоки сообщений, типы инструментов, темы, команды)
3. **Event bus** — плагины подписываются на события, не хуками в ядро
4. **Изолированность** — плагин не может сломать ядро. Ошибка в плагине ловится и логируется
5. **Lazy loading** — плагины загружаются по требованию, не при старте

## Точки расширения

| Точка | Что расширяет | Пример |
|-------|--------------|--------|
| `BlockRenderer` | Новые типы блоков в чате | Mermaid-диаграммы, LaTeX |
| `ThemeProvider` | Кастомные темы | Monokai, Solarized |
| `CommandRegistry` | Slash-команды | /deploy, /test |
| `ToolRenderer` | Визуализация tool_use | Кастомный рендер для Bash output |
| `SettingsSection` | Секции настроек | Настройки плагина |

## Хорошо

```typescript
// Реестр блоков — расширяем без изменения ядра
interface BlockRendererEntry {
  type: string;
  component: React.ComponentType<{ data: unknown }>;
  priority?: number;
}

class BlockRegistry {
  private renderers = new Map<string, BlockRendererEntry>();

  register(entry: BlockRendererEntry): void {
    this.renderers.set(entry.type, entry);
  }

  getRenderer(type: string): BlockRendererEntry | undefined {
    return this.renderers.get(type);
  }
}

// Плагин добавляет новый тип блока
blockRegistry.register({
  type: 'mermaid',
  component: MermaidBlock,
});
```

## Плохо

```typescript
// Хардкод типов — каждый новый блок = изменение switch
function renderBlock(block: MessageBlock) {
  switch (block.type) {
    case 'text': return <TextBlock />;
    case 'code': return <CodeBlock />;
    case 'mermaid': return <MermaidBlock />;  // пришлось лезть в ядро
    // ...ещё 20 case'ов
  }
}
```

## Ограничения

- **Запрещено** хардкодить списки поддерживаемых типов/тем/команд. Только реестры
- **Запрещено** плагину иметь прямой доступ к internal state. Только через публичный API
- **Обязательно** каждая точка расширения документирована с примером плагина
- **Обязательно** graceful degradation — если плагин падает, приложение работает без него
