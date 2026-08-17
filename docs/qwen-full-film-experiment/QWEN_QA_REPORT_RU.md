# Authoritative QA report — Qwen Full Film v2.4 + Sol hardening

Срез: 2026-08-17. Статус: `OWNER_GRADE_TECHNICAL_CANDIDATE / NOT FOR DEPLOY / MEDIA_OWNER_GATE`.

Этот отчёт относится к финальной source-линии Qwen v2.4 с bounded Sol hardening/material integration, включая asymmetric compositing. Названия папок `sol-qa-v2-3` и `sol-motion-v2-3` сохранены исторически; machine-readable reports содержат hashes проверенного final source. Предыдущий v2.2 остаётся только historical baseline и не используется как текущий verdict.

## Source lineage

| Run | Результат | Evidence meaning |
|---|---|---|
| `20260817-025031-189-8bce3396` | Qwen v2.3, `COMPLETED`, `exit 0` | Завершённый specialist pass; сам по себе не доказывает browser/visual/media readiness. |
| `20260817-032324-052-83245090` | v2.4 UTF-8 runtime failure, `exit 1` | Исполнение не началось, stdout 0, source effect 0. |
| `20260817-032408-893-3a8887ee` | corrected Qwen v2.4, `COMPLETED`, `exit 0` | Финальный Qwen correction pass перед bounded Sol hardening/material integration. |

QA report после asymmetric compositing фиксирует exact audited source hashes: `index.html` — `b9ea16bc9f414022e10e69f9bcf6e1a26610e2828829ca10089f37798dda3387`; `assets/qwen-full-film.css` — `5be775f92a63167d8feccbb74131349bb5c31947d6a0fd1d558df1a0ea8c47e3`; `assets/qwen-full-film.js` — `16050b84ba3daee26b0ad10322915deb00d76977e4768ca6d570d5414bde914d`.

## Gate results

| Область | Evidence | Результат | Ограничение |
|---|---|---|---|
| Technical source/runtime | `node --check` и bounded v2.4 static/source checks | PASS | Это локальная проверка, не production smoke. |
| Browser functional | `artifacts/sol-qa-v2-3/sol-qa-v2-3-report.json` | `90/90 PASS`; 0 failed checks. | Локальный Chromium/Playwright, не live traffic. |
| Responsive | `artifacts/sol-qa-v2-3/` | 1440×1000, 430×932, 390×844, 360×800; hero + full; overflow 0; broken images 0; runtime errors 0. | Независимый aesthetic score отдельно. |
| Progressive enhancement | тот же QA pack | no-JS desktop/mobile, reduced-motion и real Navigator Save-Data PASS; контент и CTA доступны. | Не является field accessibility audit. |
| Accessibility/privacy | тот же QA report | Responsive accessible names, ≥44 px targets, dialog focus/Escape/return, `ym-disable-*` и отсутствие car text в analytics payload — PASS. | Полный ручной screen-reader audit не проводился. |
| Tracking/message match | тот же QA report | 13 canonical events, payload fields и default/newcar/price-install variants совпадают; QA Metrika requests 0. | Live Metrika settings/goals не менялись и не проверялись через production mutation. |
| Proof gallery | QA + performance reports | Три retained assets; secondary proof early 0, missing after traversal 0; manual-only controls PASS. | Все три real assets — `UNKNOWN_DO_NOT_PUBLISH`. |
| Performance | `artifacts/sol-performance-v2-4/performance-report.json` | `70/70 PASS`. | TBT proxy не равен Lighthouse TBT; field INP/CrUX отсутствуют. |
| Motion | `artifacts/sol-motion-v2-3/report.json` | `99/99 PASS`; 13 screenshots, 2 WebM, 4 scenarios. | Machine/interaction PASS не заменяет visual taste score. |
| Independent visual owner-grade score | fresh screenshots + accepted targets | `GO_OWNER_GRADE / VISUAL GO`: overall 8,8; signature 8,9; premium 8,6; translation 0,84. | Taste-only notes не являются launch blockers. |
| Media/public-use | media ledger + provenance | `MEDIA_OWNER_GATE` | Generated layer owner-gated; retained real proof blocked from publication. |

## Canonical event map

- Exposure/engagement: price_view_polish_film_v9, proof_view_polish_film_v9, offer_terms_view_polish_film_v8, landing_scroll_50_polish_film_v8, landing_scroll_90_polish_film_v8.
- Contacts: lead_phone_polish_film_v8, lead_telegram_polish_film_v8, lead_whatsapp_polish_film_v8, lead_max_direct_polish_film_v8.
- Routes: route_main_site_v8, route_telegram_channel_v8, route_yandex_maps_v8, route_yandex_reviews_v8.

QA обязан триггерить события локально, сохранять payload и не отправлять тестовые цели во внешнюю Метрику.

## Final performance evidence

- Mobile, 5 cold runs после asymmetric compositing: FCP/LCP samples `1352/1340/1332/1344/1352 мс`, median `1344 мс`, CLS `0`, TBT proxy `0`, initial `315,0 КиБ`, full after proof traversal `534,6 КиБ`.
- Desktop, 1 cold run: FCP `1448 мс`, LCP `1492 мс`, CLS `0`, TBT proxy `0`, initial `331,7 КиБ`, full after proof traversal `551,4 КиБ`.
- Proof loading gate: secondary proof before scroll `0`; retained proof missing after deliberate traversal `0`.
- Budget result: `70/70 PASS` при initial ≤350 КиБ mobile / ≤450 КиБ desktop и full ≤1 МиБ.
- Нельзя заявлять field INP, CrUX или production Web Vitals по этому локальному lab-run.

## Media classification

- Generated hero material derivatives: `generated-illustrative`, `proof:false`, owner-gated; не real work, не client result и не factual proof.
- `finished-porsche-wide.webp`, `film-sheet-wide.webp`, `gloss-front-wide.webp`: `UNKNOWN_DO_NOT_PUBLISH` до file-level rights/consent/factual-use evidence и explicit owner approval.
- Технический PASS галереи не меняет publishability.

## Итог

Технические и visual gates финального source закрыты: independent verdict — `GO_OWNER_GRADE / VISUAL GO`. Итоговый release-статус остаётся `OWNER_GRADE_TECHNICAL_CANDIDATE / NOT FOR DEPLOY / MEDIA_OWNER_GATE`, потому что public media approval, experiment pre-registration и отдельное owner решение на merge/deploy не получены. Production, ads, budgets, Metrika settings/goals и Mango не менялись.
