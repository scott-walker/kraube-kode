# Kraube Kode — Architecture Specification

Electron-приложение: GUI для Claude Code. React frontend, Node.js backend, `@scottwalker/kraube-konnektor` SDK.

## Философия проекта

Дизайн — **ключевая причина существования** Kraube Kode. Это не просто обёртка над CLI, а полноценный продукт, где визуальная составляющая и UX играют первостепенную роль. Именно поэтому мы делаем собственное решение вместо использования стандартного терминала.

### Запрет нативных UI-элементов

**Абсолютный запрет** на любые нативные элементы Electron/OS:
- `dialog.showMessageBox()` — заменять кастомными модалками
- `Menu.popup()` / `Menu.buildFromTemplate()` — заменять кастомными контекстными меню
- Нативные alert/confirm/prompt — только кастомные компоненты
- Нативный title bar — уже убран (`frame: false`)

Каждый элемент интерфейса стилизуется через дизайн-систему проекта (токены, темы, CSS-переменные). Исключение: `dialog.showOpenDialog()` для выбора директорий (нет смысла делать кастомный file picker).

### Generous Hit Targets (обязательно)

Все интерактивные элементы должны иметь **щедрую зону клика/hover** — пользователь не должен целиться, чтобы попасть в элемент. Реализация:
- **Маленькие кнопки** (иконки, close, window controls): `padding` увеличивает hit area, `margin` с отрицательным значением компенсирует layout-сдвиг, `background-clip: content-box` сохраняет визуальный размер
- **Минимальный interactive target**: 32×32px (даже если визуально элемент 14px)
- **Hover-фидбек обязателен**: каждый кликабельный элемент должен визуально реагировать на hover (смена цвета, фона, opacity)
- Fitts's Law: чем дальше и мельче цель — тем больше должна быть её кликабельная область

## Архитектурные принципы

Перед любым изменением кода — прочитай соответствующий документ. Нарушение принципов запрещено без явного обоснования.

| # | Принцип | Документ | Суть |
|---|---------|----------|------|
| 01 | Персистентность | [01-persistence](docs/architecture/01-persistence.md) | Всё состояние в БД. In-memory = кэш |
| 02 | Реактивность | [02-reactivity](docs/architecture/02-reactivity.md) | Изменение → БД → событие → UI. Без перезагрузок |
| 03 | StateManager | [03-state-management](docs/architecture/03-state-management.md) | Единый стор. Computed > stored. Мутации через actions |
| 04 | Контракты | [04-contracts-and-abstractions](docs/architecture/04-contracts-and-abstractions.md) | Порты, адаптеры, DI. Код зависит от интерфейсов |
| 05 | Расширяемость | [05-extensibility](docs/architecture/05-extensibility.md) | Registry pattern, plugin API, Open/Closed |
| 06 | Семантика | [06-semantics](docs/architecture/06-semantics.md) | Единый язык во всём стеке. Глоссарий обязателен |
| 07 | Декомпозиция | [07-decomposition](docs/architecture/07-decomposition.md) | Файл < 100 строк. Один файл — одна ответственность |
| 08 | Безопасность бэкенда | [08-backend-safety](docs/architecture/08-backend-safety.md) | Нет утечек, гонок, zombie-процессов. Cleanup обязателен |
| 09 | SSOT | [09-ssot](docs/architecture/09-ssot.md) | Один факт — одно место. Нет дублирования |
| 10 | Чистый фронтенд | [10-clean-frontend](docs/architecture/10-clean-frontend.md) | Компонент = рендеринг. Логика в хуках/сервисах |
| 11 | Дизайн-система | [11-design-system](docs/architecture/11-design-system.md) | CSS-переменные, токены, темы. Ноль inline-стилей |
| 12 | Перформанс | [12-render-performance](docs/architecture/12-render-performance.md) | Гранулярные подписки, memo, виртуализация, < 16ms/frame |

## Абсолютные запреты

- Inline-стили (`style={{}}`)
- `useState` для shared state (только StateManager)
- Прямой импорт реализаций в сервисный слой
- Файлы > 200 строк
- Хардкод цветов/размеров вне design tokens
- Дублирование данных, типов, логики
- Event listeners без cleanup
- Параллельные стримы
- `utils.ts`, `helpers.ts` — файлы-свалки
- Нативные UI-элементы (`dialog.showMessageBox`, `Menu.popup`, нативные alert/confirm)
- In-memory-only настройки — всё пользовательское состояние персистится в SQLite

## Стек

- **Runtime**: Electron (main + renderer)
- **Frontend**: React, CSS custom properties
- **Backend**: Node.js, `@scottwalker/kraube-konnektor` (SDK mode)
- **Storage**: SQLite (через порт/адаптер)
- **State**: Централизованный StateManager с computed properties
