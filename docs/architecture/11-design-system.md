# 11 — Дизайн-система и стили

> Все стили через CSS-переменные. Возможность менять и создавать темы. Чистый Tailwind Way. Никаких inline-стилей. Никакого дублирования. Всё в единой точке.

## Почему

Inline-стили — это антипаттерн, который убивает поддерживаемость. Когда цвет `#6c5ce7` захардкожен в 40 компонентах, смена accent-цвета — это Find & Replace с молитвой. Когда `padding: '8px 12px'` повторяется в каждом блоке — это не стили, это copy-paste.

CSS-переменные + utility-классы = единый источник истины для визуала. Тема меняется в одном месте — весь UI обновляется. Новая тема — это новый набор переменных, не переписывание компонентов.

## Правила

1. **Ни одного inline-стиля**. Все стили — через CSS-классы и переменные
2. **Design tokens** — единая точка определения: цвета, размеры, шрифты, тени, радиусы, spacing
3. **Темы = наборы переменных**. Переключение темы — смена CSS-переменных на `:root`
4. **Utility-first** подход (Tailwind Way). Композиция маленьких классов, не кастомные мега-классы
5. **Компонентные стили co-located**. `.tool-call-block` определяется рядом с `ToolCallBlock.tsx`

## Структура дизайн-системы

```
src/design/
├── tokens.css           # Design tokens (CSS custom properties)
├── base.css             # Reset, typography, globals
├── utilities.css        # Utility classes (flex, spacing, text)
├── components.css       # Shared component patterns
└── themes/
    ├── dark.css         # --bg-primary: #0f0f17; ...
    ├── light.css        # --bg-primary: #ffffff; ...
    └── index.css        # Theme switching logic
```

## Design Tokens

```css
/* tokens.css — единственное место, где определяются значения */
:root {
  /* Spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Typography */
  --font-sans: 'DM Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --text-xs: 10px;
  --text-sm: 12px;
  --text-base: 14px;
  --text-lg: 16px;
  --text-xl: 18px;

  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
  --transition-slow: 0.4s ease;
}
```

## Темы

```css
/* themes/dark.css */
[data-theme="dark"] {
  --bg-primary: #0f0f17;
  --bg-secondary: #16161e;
  --bg-elevated: #1e1e2e;
  --fg-primary: #e2e2e8;
  --fg-secondary: #a0a0b0;
  --fg-tertiary: #606070;
  --accent: #6c5ce7;
  --accent-dim: rgba(108, 92, 231, 0.12);
  --success: #2ecc71;
  --warning: #f39c12;
  --error: #e74c3c;
  --border: #2a2a3a;
}

/* themes/light.css */
[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f7;
  --bg-elevated: #eeeef0;
  --fg-primary: #1a1a2e;
  /* ... */
}
```

## Хорошо

```css
/* Utility-класс — переиспользуемый, композируемый */
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-mono-sm {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.surface-elevated {
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
}
```

```tsx
// Компонент использует классы
function ToolCallBlock({ name, status }: Props) {
  return (
    <div className="tool-call-block surface-elevated">
      <StatusIcon status={status} />
      <span className="text-mono-sm font-medium">{name}</span>
    </div>
  );
}
```

## Плохо

```tsx
// Inline-стили — хардкод, дублирование, не-тематизируемо
<div style={{
  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
  background: 'var(--bg-elevated)', borderRadius: 8,
  fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
}}>
```

```css
/* Магические числа, не привязанные к токенам */
.my-component {
  padding: 13px 17px;     /* откуда 13 и 17? */
  font-size: 12.5px;      /* почему не 12 или 13? */
  border-radius: 7px;     /* не из системы */
  color: #a0a0b0;         /* хардкод вместо переменной */
}
```

## Ограничения

- **Запрещено** `style={{}}` в JSX. Без исключений
- **Запрещено** хардкод цветов, размеров, шрифтов. Только через CSS-переменные и токены
- **Запрещено** дублирование стилей. Повторяется 2+ раза → utility-класс
- **Запрещено** `!important`. Если нужен — архитектура стилей сломана
- **Обязательно** каждый новый цвет/размер/шрифт → сначала в tokens, потом в использование
- **Обязательно** темы переключаются через `data-theme` атрибут, не через JS-объекты
