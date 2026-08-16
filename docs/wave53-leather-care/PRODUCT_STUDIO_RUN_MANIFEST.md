# Product Studio Run Manifest — Wave53 Leather Care

- Run ID: `ohtaawa-wave53-leather-care-2026-08-16`
- Статус: `IMPLEMENTED / LOCAL QA PASS / NOT FOR DEPLOY`
- Worktree: `artifacts/ohtaawa-wave53-leather-care`
- Ветка: `codex/wave53-leather-care`
- Baseline: `origin/main@f6d19c622471db74dca1b95c74d1764b6037f6b4`
- Поверхность: новый статический route `/leather-care/`; существующие `/`, `/risk-zones/`, `/color-film/` не меняются.

## Goal contract

Подготовить один owner-grade, измеримый и технически готовый кандидат посадочной для услуги «Чистка кожи и кондиционер Koch — 3 500 ₽», который переводит релевантного посетителя к конкретному первому шагу «Узнать ближайшее время», не смешивает услугу с полной химчисткой и не пересекает live-рекламу или production.

Остановка возможна только если:

1. source, QA, proof pack и Draft PR готовы, а следующий шаг требует owner gate; или
2. отсутствующий publishable real-media asset не позволяет честно закрыть conversion-critical placement — тогда placement и deploy блокируются точным shot list.

## Source of truth

- `NEXT_SERVICE_DECISION_RU.md`: выбор услуги поддержан подтверждённой записью из Яндекс Карт и двумя qualified Avito contacts.
- `WAVE53_LEATHER_CARE_PRELAUNCH_CONTRACT_RU.md`: оффер, границы, атрибуция и prelaunch gates.
- go-only counter: `110584673`.
- Fresh Product Studio/Conversion/Mobile/Real Media/Product Excellence skills доступны в текущей сессии; docs fallback не используется.

## Owner hypothesis challenge

- «Уход за кожей — лучший следующий сервис» — `LIKELY_TRUE`: есть одна подтверждённая запись и два qualified обращения; альтернативы сейчас имеют более слабый или отрицательный сигнал.
- «Отдельная платная Search-кампания будет эффективна» — `PLAUSIBLE BUT UNPROVEN`: ни route, ни чистая paid-когорта Wave53 ещё не существовали.
- «Сильная посадочная сама докажет спрос» — `PARTLY TRUE / HIGH-RISK-IF-WRONG`: она может убрать UX-барьеры, но повторяемость спроса доказывают только чистые контакты и записи.

## Owner-work firewall

Разрешено автономно: отдельные branch/worktree, route source, локальный preview, QA, screenshots, документация, commit, push, Draft PR.

Запрещено без отдельного решения владельца: merge в `main`, deploy/publication, production route, реклама/бюджеты, Метрика/цели, Mango, DNS, billing, public claims, использование owner media с неподтверждёнными правами.

## Project Design DNA binding

- Inherited DNA: graphite/ivory/forest palette, restrained editorial rhythm, factual price, one clear next step, OHTAAWA wordmark and Ohta Park location.
- Wave53 signature: tactile leather seam rhythm + care protocol `очистить → кондиционировать → проверить`, expressed as live accessible HTML, not a decorative diagram.
- Anti-DNA: film-page clone, generic black-luxury automotive, fake before/after, full dry-cleaning language, restoration promises, “как новый”, generated-as-proof, card-grid overload.

## Decision Evaluation Board — architecture

| Direction | Product | UX | Technical | Risk | Speed/cost | Maintainability | Decision |
|---|---:|---:|---:|---:|---:|---:|---|
| A. Tactile care ritual: offer → composition → when useful → 3-step protocol → price/contact | 9 | 9 | 9 | 8 | 9 | 9 | **Selected** |
| B. Proof-first before/after gallery | 8 | 8 | 7 | 3 | 5 | 7 | Blocked: no truthful matched pair |
| C. Concierge appointment-first minimal page | 7 | 9 | 9 | 7 | 10 | 9 | Fallback; trust too thin for a new service |
| D. Interior-condition quiz/calculator | 7 | 7 | 5 | 5 | 4 | 5 | Reject: adds variables and implies diagnosis |

Selected direction keeps the fixed offer visible immediately, answers scope anxieties before contact and makes the first action concrete without adding a form, quiz or unsupported claim.

## Library Selection Preflight

| Option | Fit | Cost/risk | Decision |
|---|---|---|---|
| Route-local semantic HTML + dedicated CSS + dedicated vanilla JS | Exact fit for a static campaign route; zero runtime dependency | Lowest | **Selected** |
| Reuse shared `assets/app.js` and full `assets/styles.css` | Fast, but carries film-specific message match, urgency, goals and carousel | Hidden coupling | Reject |
| React/Vite island | Can model state, but no state-heavy UI exists | Build/router/dependency bloat | Reject |
| Tailwind/component library | Useful at system scale, not for one isolated route | Adds tooling and generic surface risk | Reject |

Substrate fit target: `>=0.85`; native stack can reproduce the selected editorial layout, dialog, tracking and responsive states without new libraries.

## Visual asset decision

Generation is `NOT_NEEDED` for the public candidate: the conversion-critical requirement is a real interior image, and generated media cannot close that factual slot. The current real public brand asset can support an internal/Draft hero after crop QA, but its rights/context still require owner confirmation before production. A generated internal target would not resolve that gate and is therefore skipped.

## Active directors (simulated, no subagents requested)

| Director | Fact | Main risk | Gate / verification |
|---|---|---|---|
| Master Project CEO | New route only | Scope creep into launch | Firewall + Draft PR |
| Preflight & Access | Fresh origin/main worktree | Dirty neighbouring worktrees | Isolated status checks |
| Conversion / Paid Landing | One fixed service and price | Mixing with dry cleaning | Message-match assertions |
| UX/UI Visual | Existing OHTAAWA DNA is reusable | Mechanical film-page clone | Fresh screenshots and red-team |
| Real Media & Provenance | One real brand interior image found | Rights/context pending; no exact Koch proof | Manifest, SHA256, owner gate |
| QA Real Scenario | Local QA can be fully isolated | Accidental Metrika request | `qa=1` + network assertions |
| Security & Privacy | Static public code only | Secrets/private artifacts | staged diff + secret-name scan |
| Launch Director | Candidate can reach Draft PR | Any public/live mutation | Stop at owner gate |

## Proof requirements

Fresh captures at `1440`, `430`, `390`, `360`; image/broken-link and overflow checks; console/page/network failures; accessibility landmarks, names, focus and tap targets; route/message match; CTA event mapping; go-only counter; QA isolation; asset weight and basic Web Vitals; production routes unchanged in git diff.

## Readiness labels

- Current: `OWNER-GRADE DRAFT CANDIDATE / LOCAL QA PASS / MEDIA_RIGHTS_GATE OPEN / NOT FOR DEPLOY`.
- Owner-facing candidate threshold: all local QA green, no weak visual placement, proof pack present, explicit remaining owner gate.
