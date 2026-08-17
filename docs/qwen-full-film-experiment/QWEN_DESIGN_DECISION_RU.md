# Design decision — Qwen Full Film Reinvention

Дата исходного выбора: 2026-08-16. Автор направления: Qwen 3.7 Max. Текущий статус: «Натяжение» сохранено; v2.3 — bounded translation pass, не новый концепт.

## Decision Evaluation Board

| Направление | Архитектура / signature | Product | UX/CRO | Technical | Risk | Speed | Maintainability | Решение |
|---|---|---:|---:|---:|---:|---:|---:|---|
| A. Натяжение | Material membrane + directed inspection light + question-first action | 9 | 8 | 8 | 7 | 7 | 8 | SELECTED |
| B. Оболочка | Full-page SVG contour, покрывающийся по scroll | 7 | 6 | 6 | 5 | 5 | 6 | Reject: сложный mobile fallback. |
| C. Инспекция | Длинный technical inspection report | 6 | 5 | 8 | 6 | 8 | 7 | Reject: арт-документ вместо посадочной. |
| D. Материал | Fashion/editorial развороты с real media | 7 | 7 | 7 | 6 | 7 | 7 | Reject: риск потери product/action clarity. |

## Выбранная теза

Тёплая mineral editorial-среда, в которой прозрачная мембрана и направленный свет показывают материальность защиты, а цена и вопрос об автомобиле остаются главным действием.

Это taste/product hypothesis, а не доказательство конверсии.

## Library Selection Board

Рассматривались:

1. Native HTML/CSS/SVG/JS.
2. Motion runtime.
3. GSAP timeline.
4. WebGL/Three.

Выбран native stack: signature не требует external runtime, а performance/accessibility/maintenance риски ниже. CDN и новые production dependencies не нужны.

## Почему v2.2 не принят

Независимый review показал, что сама direction верна, но implementation недостаточно переводит accepted target: signature 5,8, premium 7,3, overall 7,8, translation около 0,55–0,60. Поэтому решение — не менять направление, а дать Qwen один узкий v2.3 pass.

## Заморожено в v2.3

- Product truth, 180 000 ₽, 3–5 дней, 5 лет.
- Question-first mechanics и canonical contact/event map.
- Warm mineral/graphite/amber identity.
- Manual-only proof gallery.
- No fake video, fake proof, customer claims или external runtime.

## Разрешено улучшить

- Масштаб/materiality Tension Field.
- Display typography и first-viewport composition.
- Continuation line между hero и следующей главой.
- Bounded motion purpose.
- Responsive accessible names, privacy attributes, truth copy.
- Proof selection и lazy loading.

## Acceptance

Fresh independent evidence должно показать overall ≥8,8, signature ≥8, premium ≥8,2, target translation ≥0,72 без потери message match, accessibility, performance и factual truth. Иначе направление остаётся concept-quality, но implementation не проходит owner-grade gate.
