# Owner Review Pack — Qwen Full Film v2.4

Статус: `OWNER_GRADE_TECHNICAL_CANDIDATE / NOT FOR DEPLOY / MEDIA_OWNER_GATE`.

## Короткий вывод

Owner-grade кандидат собран и проверен: browser QA `90/90 PASS`, performance `70/70 PASS`, motion `99/99 PASS`, source checks `PASS`, independent visual `GO_OWNER_GRADE` с overall `8,8/10`. Выпускать сейчас нельзя: generated hero derivatives остаются owner-gated, а все три retained real proof assets — `UNKNOWN_DO_NOT_PUBLISH` до отдельного owner/media решения. Visual/technical PASS не равен deploy approval и не доказывает рост конверсии.

## Что меняется в challenger

- Основной оффер остаётся: полная прозрачная защитная оклейка окрашенных элементов кузова за 180 000 ₽, 3–5 дней, 5 лет гарантии.
- Question-first mechanics сохраняется: посетитель указывает автомобиль и выбирает реальный канал; Telegram/MAX честно требуют вставить скопированный текст, WhatsApp получает подготовленное сообщение.
- Tension Field реализован как code-native мембрана с bounded motion и generated material layer; independent visual gate подтвердил signature `8,9/10`, premium craft `8,6/10` и target translation `0,84`.
- Gallery остаётся manual-only; initial должен загружать только первый proof frame.
- В retained proof остаются только finished-porsche-wide, film-sheet-wide и gloss-front-wide; все три `UNKNOWN_DO_NOT_PUBLISH`.
- Не меняются production, live ads, budgets, Mango, Metrika settings или другие routes.

## Source lineage

- `20260817-025031-189-8bce3396`: Qwen v2.3, `COMPLETED`, `exit 0`.
- `20260817-032324-052-83245090`: v2.4 capsule/runtime failure на UTF-8 decode, `exit 1`, source effect `0`.
- `20260817-032408-893-3a8887ee`: corrected Qwen v2.4, `COMPLETED`, `exit 0`.
- Финальное состояние: Qwen v2.4 + bounded Sol hardening/material integration с asymmetric compositing; candidate commit `8022efa7b66f7c2af01f9d4fa999147bb783148b`, Draft PR #24. Production/live systems не затрагивались.

## Факты и гипотезы

| Тип | Утверждение |
|---|---|
| Факт | 33 exact paid visits увидели цену; 25 дошли до proof; contact CTA 0. |
| Факт | Production технический smoke PASS; постоянная поломка не подтверждена. |
| Факт | v2.2 functional QA 77/77, но visual owner gate FAIL 7,8/10 и performance initial-transfer FAIL 844,7 КиБ. |
| Факт | v2.2 accessibility runner пропустил пустые accessible names на 390/360. |
| Факт | Финальный browser QA: 90/90 PASS; 1440/430/390/360 hero/full, no-JS desktop/mobile, reduced-motion и реальный Save-Data; 0 overflow/broken/runtime и 0 QA Metrika requests. |
| Факт | Финальный performance после asymmetric compositing: 70/70 PASS; mobile median FCP/LCP 1344 мс, initial 315,0 КиБ, full 534,6 КиБ; desktop FCP/LCP 1448/1492 мс, initial 331,7 КиБ, full 551,4 КиБ; CLS 0, TBT proxy 0. |
| Факт | Финальный motion proof: 99/99 PASS, 13 screenshots, 2 WebM. |
| Гипотеза | Более ясный question-first шаг и сильнее выраженная материальная visual identity снизят contact barrier. |
| Неизвестно | Какая именно причина удерживает посетителей от контакта; даст ли holistic challenger больше meaningful leads. Site-cause остаётся plausible, но unproven. |

## Evidence

| Evidence | Текущий статус | Путь |
|---|---|---|
| Accepted internal targets | PRESENT; generated-illustrative, не proof | artifacts/qwen-full-film-concept-targets/*-v2.png |
| Target manifest/hashes | PRESENT | docs/qwen-full-film-experiment/GENERATED_ASSET_MANIFEST.json |
| v2.2 functional screenshots/report | BASELINE ONLY | artifacts/sol-qa-v2-1/ |
| v2.2 performance | FAIL initial transfer | artifacts/sol-performance-v2-2/ |
| v2.2 visual owner red-team | FAIL 7,8/10 | docs/qwen-full-film-experiment/SOL_RED_TEAM_FINDINGS_RU.md |
| Final browser screenshots/report | 90/90 PASS | artifacts/sol-qa-v2-3/; folder label historical, report source hashes bind the audited final source. |
| Final performance | 70/70 PASS | artifacts/sol-performance-v2-4/ |
| Final motion proof | 99/99 PASS | artifacts/sol-motion-v2-3/; 13 screenshots, 2 WebM. |
| Final independent visual score | GO_OWNER_GRADE / VISUAL GO | Overall 8,8/10; signature 8,9/10; premium 8,6/10; target translation 0,84. |
| Git review boundary | DRAFT / NOT FOR DEPLOY | PR #24, base `main`, merge state `CLEAN`; repository checks не настроены. |
| Generated hero layer | OWNER_GATED | generated-illustrative, proof:false; не real work/proof. |
| Retained real proof media | UNKNOWN_DO_NOT_PUBLISH | File-level rights/consent/factual-use evidence и owner approval отсутствуют. |

Точная asset-by-asset матрица: docs/qwen-full-film-experiment/MEDIA_PUBLISHABILITY_DECISION_RU.md.

## Owner decisions — после закрытого visual gate

1. Visual direction: independent gate рекомендует заморозить v2.4 candidate; owner может принять направление либо отклонить его как taste decision.
2. Media: дать явное public-use approval по каждому retained proof asset после rights/derivative evidence либо потребовать их удаления.
3. Release: разрешить или запретить merge/deploy. Draft PR сам по себе ничего не публикует.
4. Experiment: утвердить holistic A/B contract, assignment и pre-registered decision rule.

## Риски

- Даже owner-grade дизайн может не повысить конверсию; причинная проверка возможна только после чистого теста.
- CTA click — proxy, не равен meaningful inquiry.
- Без media-rights ledger page нельзя публично выпускать даже при полном техническом PASS.
- Слишком смелая signature scene может ухудшить performance или first-viewport clarity; эти guardrails обязательны.

## Рекомендуемая формулировка будущего approval

Эту формулировку нельзя использовать до закрытия media/release gates. Она должна ссылаться на точный commit/hash финального Qwen v2.4 + Sol candidate, отдельно перечислять одобренные media assets и явно фиксировать experiment assignment. Реклама, бюджеты, Mango и live goal mapping остаются неизменными, если отдельно не согласовано.
