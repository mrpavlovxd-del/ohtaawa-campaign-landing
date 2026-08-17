# Launch boundary — Qwen Full Film v2.4

Текущий verdict: NOT FOR DEPLOY. Этот worktree и Draft PR #24 не дают разрешения на production change.

## Разрешено автономно в этой задаче

- Изменять изолированные source/docs/tests кандидата в ветке codex/qwen-full-film-reinvention.
- Запускать local preview, QA, performance и security/privacy scans.
- Делать commit, push и Draft PR с явной меткой NOT FOR DEPLOY после прохождения локальных gates.

## Запрещено без отдельного owner approval

- merge в main, deploy, DNS/hosting/public route changes;
- изменение/остановка Wave45/46/48, budget, queries, audiences или кабинетов;
- изменение Metrika counter/goals/live mapping, Mango, телефонии или UTM;
- публичное использование generated, unknown-rights или candidate_not_published media;
- платные API/assets/libraries;
- объявление conversion uplift до чистого эксперимента.

## Mandatory release gates

| Gate | Pass condition | Сейчас |
|---|---|---|
| Qwen source | Corrected v2.4 run COMPLETED; exact source syntax/runtime clean. | PASS |
| Browser functional | Fresh 1440/430/390/360, normal/full/no-JS/reduced/Save-Data; overflow/broken/runtime failures 0. | PASS 90/90 |
| Accessibility | Все responsive contact names непустые; controls ≥44 px; skip/dialog/focus model PASS. | PASS |
| Motion | No infinite loop; static fallbacks; bounded motion proof. | PASS 99/99 |
| Visual | Overall ≥8,8, signature ≥8, premium ≥8,2, target translation ≥0,72; independent owner-grade verdict. | PASS: 8,8 / 8,9 / 8,6 / 0,84 |
| Performance | FCP ≤1800, LCP ≤2500, CLS target ≤0,05/max ≤0,1, TBT proxy ≤200; initial ≤350/450 КиБ; full ≤1 МиБ. | PASS 70/70 |
| Tracking | Counter 110584673, 13 events, attribution/message variants, exact contact_location, QA Metrika requests 0. | PASS |
| Privacy | ym-disable-keys input; WhatsApp ym-disable-tracklink/ym-disable-clickmap; no car text in analytics. | PASS |
| Media | Blocked slides absent; retained three real proof assets получают rights/consent/parent chain и owner approval; generated derivatives остаются proof=false и получают owner public-use approval. | BLOCKED_PUBLIC_USE |
| Truth/copy | Цена/условия точны; unsupported claims отсутствуют. | PASS |
| Security/hygiene | Secret scan PASS; no absolute private paths/BOM; node_modules/temp artifacts excluded; exact staged file list. | PASS |
| Git/CI | Explicit staging, commit hash, push, Draft PR, configured checks green или явно отсутствуют; base main; NOT FOR DEPLOY label/body. | PASS_FOR_DRAFT: commit `8022efa7b66f7c2af01f9d4fa999147bb783148b`, PR #24 Draft, base `main`, merge state `CLEAN`; repository checks не настроены. |

## Staged boundary

1. Local candidate: source + fresh proof.
2. Draft PR: публично видимый review diff, но без production effect; generated/real media не получают marketing-use approval автоматически.
3. Owner media/release decision; visual gate уже PASS, но owner taste authority сохраняется.
4. Separate production merge/deploy approval.
5. Separate experiment activation with pre-registered assignment/decision rule.

Переход на следующий этап не подразумевается автоматически.

## Rollback

- До deploy rollback равен отсутствию merge: текущий production не затронут.
- Перед разрешённым deploy требуется зафиксировать production baseline commit, candidate commit, точную route/file scope и reversible revert plan.
- При ошибке цены/контакта/tracking/privacy/media rights или критической mobile/performance регрессии — остановить experiment и вернуть baseline через утверждённый release workflow.

## Owner approval still required

Даже если все технические строки станут PASS, отдельно требуются: public media approval, merge/deploy approval и experiment activation approval.
