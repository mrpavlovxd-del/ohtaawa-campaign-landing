# Independent owner red-team — Qwen Full Film

Текущий статус: `OWNER_GRADE_TECHNICAL_CANDIDATE / NOT FOR DEPLOY / MEDIA_OWNER_GATE`. Финальный visual verdict: `GO_OWNER_GRADE / VISUAL GO`.

Ниже сохранён historical red-team v2.2, 2026-08-17: `FAIL_OWNER_GRADE / ITERATE`. Его оценки нельзя переносить на финальный v2.4 source.

## Scorecard v2.2

| Критерий | Оценка | Вердикт |
|---|---:|---|
| Дивергенция от старого house style | 8,2 | PASS |
| Product/workflow truth | 9,2 | PASS |
| Message match и первый шаг | 8,7 | PASS |
| Иерархия | 8,1 | Пограничный PASS |
| Photo crops / real proof presentation | 8,3 | Visual PASS; public rights отдельно BLOCKED |
| Static/no-JS/reduced/Save-Data | 9,0 | PASS v2.2 |
| Signature identity | 5,8 | FAIL |
| Typography | 7,4 | FAIL |
| Spacing/composition | 7,1 | FAIL |
| Mobile ergonomics/a11y | 7,4 | FAIL |
| Motion purpose | 6,6 | FAIL |
| Premium craft | 7,3 | FAIL |
| Anti-slop specificity | 7,4 | FAIL |
| Overall | 7,8/10 | FAIL; owner-grade threshold не достигнут |

Экспертная оценка target translation: около 0,55–0,60 при обязательном пороге 0,72.

## Что удалось

- Source основного маршрута реально заменён, это не standalone moodboard.
- Светлая mineral/graphite/amber система заметно отличается от текущего dark/green baseline.
- Цена 180 000 ₽, условия и question-first действие читаются сразу.
- v2.2 сохранил full content в normal/no-JS/reduced-motion/Save-Data.
- Generated targets не встроены как raster UI и не названы proof.

## Hard failures v2.2

1. SIGNATURE_COMPONENT_FAIL: target-мембрана сведена к бледному тонкому SVG; на 390/360 не читается в первом viewport и образует отдельную пустую полосу.
2. TARGET_TRANSLATION_LOSS: потеряны масштаб, материальность, texture, optical tension, выразительная типографика и соединение глав.
3. MOTION_PURPOSE_FAIL: три infinite CSS loops; нормальное движение преимущественно декоративно, pointer/scroll continuity отсутствует.
4. MOBILE_A11Y_FAIL: header phone на 390/360 и hero TG/WA/phone на 360 имеют пустое accessible name после CSS-скрытия текста.
5. Архитектура ниже hero всё ещё напоминает безопасную editorial sequence: timeline, gallery, package list, contact cards, review CTA, accordion.
6. Georgia-first typography и white form-card сохраняют часть generic residue; wordmark на narrow mobile теряет вес.

## Сопутствующие release blockers

- Performance v2.2: 844,7 КиБ initial, FAIL 350/450 КиБ budget.
- Proof media rights/derivative provenance не дают public-use readiness.
- Старый functional QA 77/77 не поймал responsive accessible-name defect.

## Corrective closure на финальном candidate

Source lineage: Qwen v2.3 run `20260817-025031-189-8bce3396` — `COMPLETED/exit 0`; UTF-8 runtime failure `20260817-032324-052-83245090` — source effect 0; corrected Qwen v2.4 run `20260817-032408-893-3a8887ee` — `COMPLETED/exit 0`; далее bounded Sol hardening/material integration с asymmetric compositing.

| v2.2 finding | Текущее evidence | Статус |
|---|---|---|
| Narrow mobile accessible names | Browser QA проверяет 430/390/360 computed names и controls. | `CLOSED_TECHNICAL`, 90/90 PASS. |
| Infinite/decorative motion и слабые fallbacks | Motion report: no infinite animation, reduced-motion/real Save-Data animation count 0; 2 WebM + 13 screenshots. | `CLOSED_TECHNICAL`, 99/99 PASS. |
| Initial transfer 844,7 КиБ | После asymmetric compositing: mobile initial 315,0 КиБ, desktop 331,7 КиБ; proof lazy gate early 0/missing 0. | `CLOSED_TECHNICAL`, 70/70 PASS. |
| Runtime/overflow/broken/privacy/message/event risks | Final browser report: 0 runtime/overflow/broken, event/QA/privacy/message match PASS. | `CLOSED_TECHNICAL`, 90/90 PASS. |
| Signature identity / target translation / premium craft | Fresh final screenshots и accepted targets проверены независимо. | `CLOSED_VISUAL`: overall 8,8; signature 8,9; premium 8,6; translation 0,84. |
| Public proof rights | Три retained real assets не имеют полного file-level rights/consent/factual-use approval. | `UNKNOWN_DO_NOT_PUBLISH / MEDIA_OWNER_GATE`. |

## Независимый visual gate

Exact final source независимо оценён по fresh `1440/430/390/360` hero/full screenshots, no-JS, reduced-motion, Save-Data и accepted targets. Результат: overall `8,8/10` при пороге 8,8; signature `8,9/10` при пороге 8,0; premium craft `8,6/10` при пороге 8,2; target translation `0,84` при пороге 0,72. Rectangle и closed oval-vignette устранены asymmetric compositing; verdict `GO_OWNER_GRADE / VISUAL GO`. Это не означает deploy-ready из-за media/release gates.

Generated hero layer маркирован `generated-illustrative`, `proof:false`, owner-gated. Он не является real client work или доказательством результата. Production, ads, budgets, Metrika settings/goals и Mango не менялись; merge/deploy требует отдельного owner approval после visual/media gates.
