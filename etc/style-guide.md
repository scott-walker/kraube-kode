# Kraube Kode — Style Guide

## Font

**Alegreya Sans SC** (Small Caps) — единственный фирменный шрифт.
Используется во всех брендовых надписях: логотип, слоган, подписи.

- Начертание: Regular, Bold
- Регистр: small caps (особенность шрифта)
- Источник: Google Fonts — https://fonts.google.com/specimen/Alegreya+Sans+SC

## Colors

### Brand palette

| Token | Hex | Назначение |
|-------|-----|------------|
| Primary Dark | `#2D3342` | Основной тёмный цвет. Текст «KRAUBE», подзаголовки, мелкий текст в light-теме |
| Accent | `#8798C3` | Акцентный лавандовый. Текст «KODE», используется в обеих темах |
| Surface Dark | `#25282F` | Тёмная подложка / фон в dark-теме |

### UI accent variants

| Тема | Hex | Причина |
|------|-----|---------|
| Dark theme | `#8798C3` | Brand accent — отличный контраст на тёмном фоне |
| Light theme | `#6B7DB0` | Углублённый вариант — обеспечивает WCAG AA контраст на светлом фоне |

### Light theme

- Фон: `#F5F6F9` (холодный белый с голубым подтоном)
- Текст: Primary Dark `#2D3342`
- Акцент: `#6B7DB0`
- Тени: `rgba(45, 51, 66, ...)` (brand navy на низкой прозрачности)

### Dark theme

- Фон: Surface Dark `#25282F`
- Текст: `#E8EBF0` (мягкий белый с голубым подтоном)
- Акцент: `#8798C3`
- Тени: `rgba(0, 0, 0, ...)`

## Brand assets

Все ассеты находятся в `etc/`:

| Директория | Содержимое |
|------------|------------|
| `brand-light-png/` | Логотипы для светлой темы, PNG |
| `brand-light-svg/` | Логотипы для светлой темы, SVG |
| `brand-dark-png/` | Логотипы для тёмной темы, PNG |
| `brand-dark-svg/` | Логотипы для тёмной темы, SVG |
| `Kraube Kode.pdf` | Брендбук (light) |
| `Kraube Kode Dark.pdf` | Брендбук (dark) |
