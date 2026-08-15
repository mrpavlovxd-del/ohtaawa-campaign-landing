# Wave50 Question First — owner-grade proof pack

Дата: 15.08.2026. Ветка: `codex/wave50-question-first`. Surface: изолированный `/question-first/`. Статус: `PRODUCTION_CANDIDATE_READY / NOT FOR DEPLOY / OWNER GATE REQUIRED`.

## Результат и граница утверждения

Собран один контролируемый кандидат: первый шаг меняется с записи на консультацию на вопрос по автомобилю. Та же семантика выдержана в CTA, dialog, подготовленном сообщении и поясняющей hero-строке: сначала ответ администратора, консультация — только если посетитель решит приехать. Цена `180 000 ₽`, состав, срок `3–5 дней`, гарантия `5 лет`, бесплатная мойка, такси, proof, media, layout и каналы не меняются.

Это production-ready по source/QA/rollback кандидат, но не доказанный CRO-победитель. Текущие факты локализуют наблюдаемый разрыв после цены/proof и до контакта; конкретная причина `CTA / trust / offer / UX` остается `PLAUSIBLE_BUT_UNPROVEN`. Production smoke трех live routes исключает воспроизводимую поломку hero, broken images, horizontal overflow или page-level CTA в проверенных состояниях, но не проверяет психологический порог, внешний messenger/phone handoff или работу менеджера.

## Product Studio и Decision Board

Пройдены Product Studio Kernel, Paid Campaign Landing, owner-hypothesis challenge, Russian copy, mobile-first, browser visual QA и Product Excellence proof gates. Library Selection Gate выбрал текущий semantic HTML/CSS/JS: новая библиотека, виджет или визуальный asset добавили бы лишнюю переменную.

Из четырех CRO-направлений выбран Question First. Contact First/Wave49 остается следующим тестом только при росте intent-open без channel click; Proof-at-decision — при отсутствии роста intent-open; Availability-first заблокирован без подтвержденных SLA/доступности. Новый media batch не нужен: бренд и реальные proof сохранены, generated media не добавлялись и не выдаются за клиентские работы.

## Доказательства

| Проверка | Evidence | Итог |
|---|---|---|
| Однофакторный source contract | `node scripts/verify_wave50_contract.cjs` | PASS; control SHA-256 `e97b73c8…30f`, candidate `47831e0f…6083` |
| Desktop/mobile browser QA | `proof/wave50-owner-validation-20260815-final/qa.json` | PASS: 1440×900, 430×932, 390×844, 360×800 |
| Hero/message match | `desktop-1440-hero.png`, `mobile-430-hero.png`, `mobile-390-hero.png`, `mobile-360-hero.png` | Цена/услуга/CTA/trust note видимы; clipping/overflow нет |
| Первый шаг контакта | `mobile-390-contact.png` и остальные `*-contact.png` | Вопрос, ожидаемые данные и четыре канала ясны; focus containment PASS |
| Реальный proof | `*-proof-viewport.png` | Заголовок и реальная работа видимы; sticky header/skip-link не загрязняют кадр |
| Tracking | `qa.json` | `contact_intent_open_question_first_v1`, `contact_sheet_open`, `contact_channel_click` и 4 canonical events наблюдаются |
| QA isolation | `qa.json` | Собственных запросов страницы в Метрику `0`; тестовые live goals не отправлялись |
| Runtime reliability | `qa.json` | Broken images `0`, overflow `0`, console/page errors `0`, same-origin network errors `0` |
| Скорость/вес | `qa.json` | Initial `805–875 KB`, full `1 297–1 367 KB`, local FCP/LCP `220–516 ms`, CLS `0` |

Fresh screenshots: `proof/wave50-owner-validation-20260815-final/`. Полные страницы сохранены для 1440 и 390; hero/contact/proof/proof-viewport/scope-price — для каждого обязательного viewport. Метрики скорости являются локальным Chromium smoke, не field Core Web Vitals.

## Event map и критерий проверки

Диагностическая цепочка: `landing → contact_intent_open_question_first_v1 / contact_sheet_open → contact_channel_click + canonical channel event → содержательный диалог/звонок`.

Intent-open и channel click — только soft diagnostics, не лиды. Победитель определяется содержательным обращением. После отдельного owner-approved launch: sanity до `10` clean visits, диагностический review после `30` сопоставимых clean clicks или `1 500 ₽`; Wave45/Wave49/Wave50 и QA не смешиваются. Exact control baseline `contact_sheet_open` должен быть подтвержден отдельно: известные `0/33` относятся к channel CTA, а не к intent-open.

## Security, privacy и provenance

- Новых зависимостей, внешних виджетов, API, секретов и production credentials нет.
- QA использует маркированные UTM/experiment параметры и не отправляет цели в счетчик.
- Новых/generated visual assets нет; текущий hero и proof наследуют существующий provenance.
- Перед commit требуется повторный secret/private-value scan только по намеренно изменяемым файлам и proof metadata.

## Риски и непроверенное

- Кандидат может увеличить открытие sheet без роста содержательных обращений.
- Не проверены live conversion, field Web Vitals, внешний messenger/phone handoff, скорость/качество ответа менеджера и редкие device/network failures.
- Длинный цикл сравнения для дорогой услуги может не устраняться одним landing.
- CTA-view и exact control intent baseline требуют отдельного instrumentation/analytics owner gate; тихо менять live mapping нельзя.

## Rollback и owner gate

До публикации rollback — revert этого изолированного commit/PR; production не затронут. После отдельно разрешенного запуска — снять только Wave50-когорту с нового route и вернуть ее на прежний неизмененный URL; root Wave45 этим PR не заменяется.

Требуют отдельного решения владельца: merge/deploy, публикация route, live Metrika goal mapping, назначение paid cohort, любые изменения рекламы/бюджета/Mango и дальнейший launch/stop decision. Активные Wave45/46/48 остаются read-only для этой задачи.
