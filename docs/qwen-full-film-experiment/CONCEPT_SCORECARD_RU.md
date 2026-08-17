# Concept and implementation scorecard — Qwen «Натяжение»

Статус: `OWNER_GRADE_TECHNICAL_CANDIDATE / NOT FOR DEPLOY / MEDIA_OWNER_GATE`. Финальный visual verdict: `GO_OWNER_GRADE / VISUAL GO`.

## Internal targets

| Target | Overall | Project specificity | Product architecture | Premium craft | Product truth | Responsive intent | Verdict |
|---|---:|---:|---:|---:|---:|---:|---|
| Desktop v1 | 8,3 | 8,8 | 8,7 | 8,8 | 7,6 | 8,2 | SELF_REJECT: ложная монтажная метафора. |
| Desktop v2 | 9,0 | 9,2 | 9,0 | 9,1 | 8,7 | 8,8 | ACCEPTED_INTERNAL_TARGET. |
| Mobile v1 | 8,2 | 8,7 | 8,3 | 8,8 | 8,6 | 7,5 | SELF_REJECT: signature ниже первого viewport. |
| Mobile v2 | 8,9 | 9,0 | 8,9 | 9,0 | 8,7 | 8,9 | ACCEPTED_INTERNAL_TARGET. |

Targets — generated illustrative UI references. Они не являются real proof, production screenshots или raster UI для публикации.

## Implementation v2.2

| Показатель | Оценка | Verdict |
|---|---:|---|
| Divergence from old house style | 8,2 | PASS |
| Product truth | 9,2 | PASS |
| Message match / first action | 8,7 | PASS |
| Signature identity | 5,8 | FAIL |
| Premium craft | 7,3 | FAIL |
| Overall | 7,8 | FAIL_OWNER_GRADE |
| Target translation | около 0,55–0,60 | FAIL порога 0,72 |

## Почему v1 не показывается как вариант

- V1 сохранён только для provenance и self-rejection.
- V2 target лучше выражает material tension и first-viewport action.
- Generated controls/text в target не переносятся буквально; live semantics должны быть code-native.

## Final candidate v2.4 + Sol hardening

| Evidence gate | Результат |
|---|---|
| Browser QA | `90/90 PASS`; 1440/430/390/360 hero/full, no-JS desktop/mobile, reduced-motion, real Save-Data, 0 overflow/broken/runtime. |
| Performance | `70/70 PASS`; mobile median FCP/LCP 1344 мс, initial 315,0 КиБ, full 534,6 КиБ; desktop FCP/LCP 1448/1492 мс, initial 331,7 КиБ, full 551,4 КиБ; CLS 0, TBT proxy 0. |
| Motion | `99/99 PASS`; 13 screenshots, 2 WebM. |
| Technical source checks | `PASS`. |

## Independent visual rescore

| Критерий | Финальная оценка | Gate |
|---|---:|---|
| Overall owner-grade | `8,8/10` | PASS порога ≥8,8. |
| Signature identity | `8,9/10` | PASS порога ≥8,0. |
| Premium craft | `8,6/10` | PASS порога ≥8,2. |
| Target translation | `0,84` | PASS порога ≥0,72. |

Числа v2.2 выше — historical failure evidence, а не оценка v2.4. Финальный visual gate закрыт, но это не deploy-ready: generated hero layer остаётся `generated-illustrative`, `proof:false`, owner-gated; три retained real proof assets — `UNKNOWN_DO_NOT_PUBLISH`. Production/live systems не менялись.
