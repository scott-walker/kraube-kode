# 07 — Максимальная декомпозиция

> Не должно быть больших файлов. Пусть их будет миллиард, но маленьких. Система должна быть легко поддерживаемой и тестируемой.

## Почему

Большой файл — это чёрный ящик. Его трудно читать, трудно тестировать, трудно мерджить. Два разработчика, работающие в одном файле из 500 строк, гарантированно получат конфликты. Один файл из 500 строк — это 500 причин его открыть и 500 причин в нём ошибиться.

Маленький файл — одна ответственность — одна причина измениться. Его можно прочитать за 30 секунд, протестировать одним тестом, заменить без страха.

## Правила

1. **Один файл — одна ответственность**. Один компонент, один хук, один сервис, один адаптер
2. **Лимит: ~100 строк на файл**. Превышение — сигнал к декомпозиции. Жёсткий потолок — 200 строк
3. **Именование файла = содержимое**. `useStreamProcessor.ts` содержит хук `useStreamProcessor`. Не сюрпризов
4. **Директории = домены**. Не по техническому типу (`hooks/`, `utils/`), а по домену (`chat/`, `settings/`, `session/`)
5. **Index файлы только для re-export**. Никакой логики в index.ts

## Структура директорий

```
src/
├── core/                    # Порты, интерфейсы, базовые типы
│   ├── ports/
│   │   ├── claude.port.ts
│   │   ├── storage.port.ts
│   │   └── settings.port.ts
│   ├── types/
│   │   ├── stream-event.ts
│   │   ├── message.ts
│   │   ├── session.ts
│   │   └── settings.ts
│   └── index.ts
├── adapters/                # Реализации портов
│   ├── claude-connector.adapter.ts
│   ├── sqlite-storage.adapter.ts
│   └── electron-ipc.adapter.ts
├── services/                # Бизнес-логика
│   ├── chat.service.ts
│   ├── session.service.ts
│   └── settings.service.ts
├── state/                   # StateManager
│   ├── store.ts
│   ├── actions/
│   │   ├── chat.actions.ts
│   │   ├── session.actions.ts
│   │   └── settings.actions.ts
│   ├── selectors/
│   │   ├── chat.selectors.ts
│   │   └── session.selectors.ts
│   └── middleware/
│       ├── persistence.middleware.ts
│       └── ipc.middleware.ts
├── ui/                      # React компоненты
│   ├── chat/
│   │   ├── ChatView.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── UserMessage.tsx
│   │   └── AssistantMessage.tsx
│   ├── blocks/
│   │   ├── TextBlock.tsx
│   │   ├── ToolCallBlock.tsx
│   │   ├── CodeBlock.tsx
│   │   └── ThinkingBlock.tsx
│   ├── sidebar/
│   ├── settings/
│   └── shared/
├── design/                  # Дизайн-система
│   ├── tokens.css
│   ├── themes/
│   └── components.css
└── main/                    # Electron main process
    ├── main.ts
    ├── preload.ts
    ├── ipc-handlers/
    │   ├── claude.handler.ts
    │   ├── settings.handler.ts
    │   └── window.handler.ts
    └── services/
```

## Хорошо

```
// Каждый файл — одна ясная ответственность
src/ui/blocks/ToolCallBlock.tsx     — 45 строк, один компонент
src/ui/blocks/ToolCallBlock.css     — 20 строк, стили для него
src/state/selectors/chat.selectors.ts — 30 строк, селекторы чата
src/core/ports/claude.port.ts       — 25 строк, интерфейс
```

## Плохо

```
// God-файлы
src/App.tsx                  — 400 строк: стейт, обработчики, рендеринг
src/types.ts                 — 200 строк: все типы проекта в одном файле
src/main.ts                  — 300 строк: IPC, Claude, окна, настройки
src/utils.ts                 — 150 строк: 10 несвязанных функций
```

## Ограничения

- **Запрещено** файлы > 200 строк без исключительного обоснования
- **Запрещено** `utils.ts`, `helpers.ts`, `misc.ts` — это свалка, не модуль
- **Запрещено** логику в index.ts — только re-export
- **Обязательно** каждый новый файл должен пройти тест: "могу ли я описать его назначение одним предложением?"
- **Обязательно** при декомпозиции сохранять co-location: компонент и его стили/тесты — рядом
