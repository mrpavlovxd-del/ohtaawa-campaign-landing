# Wave50: clean-data checkpoint 15.08.2026

Source of truth: `docs/ohtaawa-retargeting/agent-work/2026-08-15/LIVE_MARKETING_CHECKPOINT_RU.md` в родительской marketing-задаче. Production, advertising, budgets, Mango и landing routes не изменялись.

## Факты

| Cohort | Delivery | Exact behavior | Hard outcome |
|---|---|---|---|
| Wave45 / 180 000 ₽ | 400 показов / 45 кликов / 1 494,42 ₽ | 33 визита; price 33, proof 25, terms/scroll50 8, scroll90 1, channel CTA 0; после 14.08 новых exact visits нет | 0 подтвержденных paid leads |
| Wave46 / 60 000 ₽ | 74 / 3 / 122,37 ₽ | 2 визита по 18/23 с; price 2, proof/contact CTA 0 | 0 |
| Wave48 / 230 000 ₽ | 22 / 2 / 54,26 ₽ | обработан 1 визит: 50 с, price/proof/process/warranty/scroll50, CTA 0; второй клик не появился в exact-сегменте | 0 |
| Mango 15.08 | — | технический owner-QA звонок исключен | 0 новых целевых звонков после исключения |

Production smoke всех трех routes остается PASS и является контрфактом против постоянной page-level поломки.

## Интерпретация

- Наблюдаемый gap `interest → first contact` сохраняется.
- Wave45 exact funnel не изменился; новый checkpoint не повышает причинную уверенность в CTA/trust гипотезе.
- Wave46 — descriptive behavioral `N=2`: оба визита price-only, поэтому это не повторение Wave45 post-proof паттерна.
- Wave48 — directional behavioral `N=1`; второй delivery click пока нельзя считать behavioral visit.
- Все `5` фактических поисковых запросов Wave46/48 релевантны офферам, и все `3+2` клика пришли через автотаргетинг. `35` manual operator phrases дали `0` показов: наблюдаемой manual-когорты нет.
- Для этих пяти кликов «очевидно мусорные запросы» не объясняют CTA `0`, но `N=5` не доказывает общий traffic quality или CTA-causality.
- Mango `0` подтверждает отсутствие hard outcome, но не объясняет, на каком этапе возникает барьер.
- Весь неразмеченный organic/no-ad агрегат owner-QA интервала перед 08:41 МСК исключен без численного предположения; он не участвует в оценке спроса, конверсии или качества сайта. Paid exact-UTM когорты остаются отдельными.

Классификация: локализация разрыва до первого контакта — `LIKELY_TRUE`; конкретная причина `CTA / trust / offer / UX` — `PLAUSIBLE_BUT_UNPROVEN`; постоянная техническая поломка в проверенных desktop/mobile состояниях — `LIKELY_FALSE`.

## Решение

Wave50 Question First остается неизмененным первым контролируемым кандидатом. Scope, event map, offer, copy, UI и proof не расширяются. Нового visual QA не требуется, потому что source UI не менялся; действующий fresh 1440/430/390/360 proof остается валиден.

PR #22 сохраняет статус `PRODUCTION_CANDIDATE_READY / NOT FOR DEPLOY`. Merge/deploy, route publication, live goal mapping, paid cohort и любые изменения Wave45/46/48/Mango требуют отдельного owner gate.
