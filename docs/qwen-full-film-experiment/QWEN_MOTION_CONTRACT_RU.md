# Motion contract — Qwen Full Film v2.4 + Sol hardening

Статус: `OWNER_GRADE_TECHNICAL_CANDIDATE / NOT FOR DEPLOY / MEDIA_OWNER_GATE`.

Motion объясняет натяжение прозрачной плёнки и проверку направленным светом. Он не является proof, не скрывает контент и не может задерживать цену или контакт.

## Purpose map

| Элемент | Цель | Разрешённое поведение | Запрет |
|---|---|---|---|
| Tension Field | Показать прозрачную мембрану на абстрактном кузовном контуре. | Один bounded entrance/inspection sweep; небольшая пассивная pointer/scroll response. | Infinite pulse/dash/sweep, fake video, scroll-jacking. |
| Continuation line | Связать hero со следующей главой. | Статичная линия или короткое одноразовое появление. | Декоративный loop и layout shift. |
| CTA/focus/hover | Подтвердить действие. | Короткий color/outline state. | Движение CTA, которое меняет hit area или мешает keyboard focus. |
| Proof gallery | Ручное изучение реальных кадров. | Buttons, tabs, keyboard и swipe; смена по действию пользователя. | Autoplay, таймер, скрытый pause-control, aria-live churn. |
| Content chapters | Сохранить спокойный ритм. | Контент виден по умолчанию; необязательный transform enhancement. | opacity:0 как gate, reveal dependency от JS/IntersectionObserver. |

## State matrix

| State | Требуемый результат |
|---|---|
| Normal | Не более одного bounded sweep и малой response signature; управление и текст доступны сразу. |
| prefers-reduced-motion | Полноценный статичный Tension Field; running animations 0. |
| Save-Data / slow connection | То же статичное состояние; вторичные proof images не загружаются до приближения/user action. |
| No JS | Весь фактический текст, цена, первый контакт и первый proof frame доступны; signature статична. |
| document.hidden | Нет продолжающихся timers/RAF. |
| Interruption | Scroll, pointer leave, blur и navigation не оставляют промежуточное скрытое состояние. |

## Technical limits

- Только local HTML/CSS/SVG/JS; без CDN и нового runtime.
- Motion основан на transform, opacity или CSS custom properties и не меняет layout.
- Все listeners passive там, где это применимо; RAF выполняется только при необходимости.
- Нет autoplay video/audio, custom cursor, loader или обязательного canvas/WebGL.

## Acceptance evidence

1. Static/source checks: `PASS`; infinite animation declarations и gallery timers не обнаружены.
2. Browser motion proof: `artifacts/sol-motion-v2-3/report.json`, `99/99 PASS`, 13 screenshots, 2 WebM, normal desktop/mobile + reduced-motion desktop + real Save-Data mobile.
3. Runtime: в reduced-motion и Save-Data animation count `0`; broken images, overflow, console/page/network failures и QA Metrika requests — `0`.
4. General browser QA: `artifacts/sol-qa-v2-3/sol-qa-v2-3-report.json`, `90/90 PASS`; no-JS desktop/mobile и fallback states проверены.
5. Generated material derivatives используются только как `generated-illustrative`, `proof:false` hero layer; они не заменяют code-native controls, live text или real proof.

## Итог gate

Motion contract технически выполнен; independent visual gate подтвердил overall `8,8`, signature `8,9`, premium `8,6` и target translation `0,84`. Machine evidence и aesthetic score отчётны раздельно. Generated layer требует owner approval для public use, а retained real proof media остаются `UNKNOWN_DO_NOT_PUBLISH`. Merge/deploy и production changes не разрешены.
