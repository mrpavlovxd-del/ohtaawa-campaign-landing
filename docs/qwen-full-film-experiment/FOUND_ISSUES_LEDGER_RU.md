# Found Issues Ledger — Qwen Full Film Reinvention

Срез: 2026-08-17. Статус кандидата: `OWNER_GRADE_TECHNICAL_CANDIDATE / NOT FOR DEPLOY / MEDIA_OWNER_GATE`.

## Статусы

- `CLOSED_*` — дефект закрыт fresh evidence на exact final source.
- `BLOCKED_PUBLIC_USE` — локальный/Draft-кандидат допустим, live/public marketing use запрещён до owner/media gate.
- `DEFERRED_EXPERIMENT` — причинный вывод возможен только после отдельного чистого эксперимента.
- `LOCAL_CLEANUP_DEBT` — не входит в commit/PR, но локально сохранён из-за safety gate удаления.

| ID | Источник | Severity | Проверенный факт | Решение / действие | Статус | Verification |
|---|---|---:|---|---|---|---|
| QF-001 | Independent visual red-team | High | v2.2 был 7,8/10; финальный asymmetric material integration независимо оценён на overall 8,8, signature 8,9, premium 8,6, translation 0,84. | Заморозить направление; не делать новый concept pass. | CLOSED_VISUAL | Fresh 1440/430/390/360 hero/full + fallbacks; `GO_OWNER_GRADE / VISUAL GO`. |
| QF-002 | Accessibility red-team | High | v2.2 терял accessible names на 390/360. | Явные aria-label, computed-name и 44 px assertions. | CLOSED_A11Y | Final browser QA 90/90; 430/390/360 names и controls PASS. |
| QF-003 | Performance audit | High | v2.2 initial был 844,7 КиБ. | Lazy secondary proof; компактные generated derivatives. | CLOSED_PERFORMANCE | Final 70/70: mobile initial 315,0 КиБ/full 534,6; desktop 331,7/551,4. |
| QF-004 | Real-media provenance | Blocker | Три retained proof crop имеют output IDs/hashes, но права, consent, factual-use и полная parent chain не доказаны. | Получить file-level evidence и owner approval либо убрать кадры. | BLOCKED_PUBLIC_USE | MEDIA_RIGHTS_LEDGER + DERIVATIVE_MANIFEST; все три `UNKNOWN_DO_NOT_PUBLISH`. |
| QF-005 | Media privacy | Blocker | film-edge содержит лицо без consent; ещё два crop не проходят derivative/publishability gate. | Исключить три blocked файла из DOM, fallback, thumbnail и network. | CLOSED_RUNTIME_SCOPE / BLOCKED_PUBLIC_USE | Final QA/source inventory: blocked filenames absent; retained set 3/3. |
| QF-006 | Metrika/Webvisor privacy | High | Поле модели авто и WhatsApp links требовали opt-out. | `ym-disable-keys`; `ym-disable-tracklink` + `ym-disable-clickmap`; не отправлять car text. | CLOSED_PRIVACY | Static/browser payload checks PASS; QA Metrika requests 0. |
| QF-007 | Truth/copy audit | Medium | В раннем source были неподтверждённые claims. | Нейтральные формулировки; цена/срок/гарантия сохранены. | CLOSED_COPY | Source review; unsupported claim set absent. |
| QF-008 | Browser regression gate | Critical | Старый 77/77 не доказывал финальный source. | Полный fresh runner normal/full/no-JS/reduced/Save-Data. | CLOSED_QA | Final 90/90, 0 overflow/broken/runtime/network failures. |
| QF-009 | Tracking QA | High | Требовались canonical events, attribution и QA isolation на final source. | End-to-end trigger map без изменения counter/goals. | CLOSED_TRACKING | 13 canonical events, contact_location, message variants; counter 110584673; external QA requests 0. |
| QF-010 | Progressive enhancement | Critical | Контент не должен зависеть от reveal JS. | Контент видим по умолчанию; motion transform-only. | CLOSED_QA | no-JS desktop/mobile и fallback screenshots PASS. |
| QF-011 | Runtime TDZ | Critical | Ранний JS обращался к const до объявления. | Инициализация primitives до первого use. | CLOSED_RUNTIME | `node --check` + pageerror/console hard fail + UTM smokes PASS. |
| QF-012 | Motion/gallery | Medium | Ранний Tension Field имел loops; gallery не должна autoplay. | Один bounded sweep; manual-only gallery; static fallbacks. | CLOSED_MOTION | Motion 99/99, 2 WebM/13 screenshots; reduced/Save-Data animation 0. |
| QF-013 | Generated target governance | Blocker if misused | Target PNG — generated UI references, не proof и не real work. | Хранить как internal art-direction evidence; live controls остаются code-native. | ACCEPTED_INTERNAL_ONLY | GENERATED_ASSET_MANIFEST hashes/status; target PNG не загружаются runtime. |
| QF-014 | CRO evidence | High if overclaimed | Exact baseline 33 visits/0 CTA локализует gap, но не доказывает site-cause. | Тестировать целостный challenger; не приписывать причинность одному компоненту. | DEFERRED_EXPERIMENT | Отдельный pre-registered experiment после owner launch gate. |
| QF-015 | Production smoke | Info | Текущий production технически стабилен. | Не объяснять gap «сломавшимся сайтом». | ACCEPTED_FACT | Канонический smoke pack; live не менялся. |
| QF-016 | Workspace hygiene | Medium | Temp text writers удалены patch-методом; node_modules и superseded evidence не войдут в Git. Recursive local cleanup отклонён execution safety gate. | Explicit staging; `.gitignore`; удалить локальный debt позже разрешённым безопасным способом. | LOCAL_CLEANUP_DEBT / PR_SCOPE_CLOSED | Final staged-file review и ignored-file check. |
| QF-017 | Documentation hygiene | Medium | Старые pending/verdict/path противоречия могли попасть в review pack. | Синхронизировать final scores, repo-relative paths и launch boundaries. | CLOSED_DOCS | UTF-8/BOM/zero-width, absolute-path и stale-status scans. |
| QF-018 | Generated material provenance | Blocker if misused | Source + desktop/mobile derivatives имеют stable IDs, SHA256 и source-output chain; люди/логотипы/текст/identifiers не обнаружены; `proof:false`. | Сохранять generated-illustrative label; source не грузить runtime; live/public marketing use только после owner approval. | DOCS_COMPLETE / RENDER_QA_PASS / BLOCKED_PUBLIC_USE | Hash-chain 3/3; final 1440/430/390/360 crop/contrast QA PASS; owner approval pending. |
| QF-019 | Git/release | Boundary | Локальные gates не равны release. | Explicit commit/push/Draft PR `NOT FOR DEPLOY`; остановиться до merge/deploy. | PENDING_GIT_THEN_OWNER_GATE | Commit, public Draft PR, checks; no merge/deploy. |

## Открытые hard boundaries

1. File-level public-use approval retained real proof media не получен.
2. Explicit owner approval generated decorative derivatives для live/public marketing use не получен.
3. Merge/deploy и production experiment activation не разрешены.
4. Assignment, sample/decision rule и meaningful-lead reconciliation не preregistered.

Visual, browser, accessibility, tracking, privacy, performance и motion gates exact final source закрыты. Production, реклама, бюджеты, Metrika settings/goals и Mango не менялись.
