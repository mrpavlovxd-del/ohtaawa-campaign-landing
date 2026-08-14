# Wave50 Question First: owner-grade red-team

Дата: 14.08.2026. Статус: `IMPLEMENTATION_READY / NOT FOR DEPLOY / OWNER GATE REQUIRED`.

## Вывод

Wave50 остается лучшим первым контролируемым CRO-тестом. Он не пытается доказать заранее, что причина нулевых обращений — UX: кандидат меняет только обязательность первого шага и добавляет наблюдаемую ступень `landing → intent open → channel click → hard lead`.

## Проверенные факты

- Wave45: 361 показ, 42 клика, 1 430,15 ₽, CTR 11,63%, CPC 34,05 ₽; подтвержденных hard leads из paid-трафика 0.
- Поисковые запросы преимущественно коммерческие; доля сомнительных заметно ниже раннего stop-порога `>30%`.
- Отдельный exact-срез остается 30 чистыми визитами: price 30, proof 22, conditions 8, scroll50 8, scroll90 1, TG/WA/MAX/phone 0. Рост delivery до 42 кликов не смешивается с этим знаменателем.
- Wave48 добавляет только cross-offer N=1: явный price-intent запрос, 50 с, terms/price/proof/process/warranty/scroll50 и ни одного contact CTA/hard lead. Он не добавляется к Wave45 `30`.
- Локализация разрыва после цены/proof и перед контактом — `LIKELY_TRUE`; конкретная причина CTA/UX/trust — `PLAUSIBLE_BUT_UNPROVEN`; плохой трафик как главное объяснение — `LIKELY_FALSE` по текущим данным.

## Что меняется

- Один согласованный question-first смысл во всех пяти CTA: «Задать вопрос по автомобилю».
- Dialog и подготовленное сообщение просят марку/модель и ясно сообщают результат: администратор уточнит сроки работ и ближайшие даты.
- Добавлено отдельное диагностическое событие `contact_intent_open_question_first_v1`; сохранены `contact_sheet_open`, `contact_channel_click` и четыре canonical channel events.

Не меняются цена 180 000 ₽, состав, срок 3–5 дней, гарантия 5 лет, мойка, такси, hero, proof, layout, изображения, каналы, рекламная аудитория и production routes.

## Red-team результата

| Область | Проверка | Итог |
|---|---|---|
| Message match | Полная защитная оклейка и 180 000 ₽ совпадают с коммерческим интентом и Wave45 | PASS |
| Первое действие | Один CTA виден в первом окне; смысл вопроса, данные и следующий ответ ясны | PASS |
| Доверие | Реальная студия, proof, гарантия, отзывы, адрес и условия сохранены; новые неподтвержденные claims не добавлены | PASS |
| Mobile-first | 430/390/360: без overflow, clipping и мелких tap targets; CTA, цена и trust rail читаемы | PASS |
| Accessibility | Landmark, skip link, labels, focus containment, contrast и reduced motion smoke | PASS |
| Event mapping | Intent open → sheet open → channel click/canonical goal; QA traffic изолирован | PASS |
| Скорость/вес | 805–875 KB initial, 1 297–1 367 KB full; локальные FCP/LCP 196–404/196–404 ms, CLS 0 | PASS, не field CWV |

Финальный прогон: `proof/wave50-owner-red-team-20260814-final/qa.json`. Свежие кадры hero/contact/proof/scope-price лежат рядом для 1440, 430, 390 и 360 px. Console errors, same-origin network errors, broken images, overflow и собственные запросы Метрики: 0.

## Что отклонено

- Менять Wave48 или переносить на него question-first после одного визита: `N=1` не является причинным сравнением.
- Wave49/direct-channel panel сейчас: меняет одновременно wording, modal step и channel exposure.
- Новый hero, дополнительный proof, скидка или urgency: добавят вторую переменную без доказанного causal gap.
- Считать intent-open или channel click лидом: это soft diagnostics; победа определяется содержательным диалогом/звонком.

## Риски и граница запуска

- Кандидат может увеличить открытия dialog без роста содержательных обращений.
- Дорогая услуга допускает длинный цикл сравнения, который один landing не устранит.
- Browser QA не заменяет полевые Web Vitals и live reconciliation с hard leads.
- Без CTA-view и отдельного intent/contact-sheet baseline нельзя отличить «CTA видел, не открыл» от последующего channel friction. Эти события требуют отдельного owner-gated instrumentation решения, а не тихого live изменения.
- PR #22 остается Draft и `NOT FOR DEPLOY`. Merge, deploy, публикация route, live goal mapping, новая paid-когорта, бюджет и Mango требуют отдельного решения владельца.

Рекомендация: не трогать live Wave45/Wave46/Wave48. Wave48 до 10 clean visits остается описательным сигналом; 30 clean visits дают отдельный route-diagnostic, но не объединяются с Wave45/Wave50. После отдельного owner gate тестировать Wave50 чистой когортой; диагностический review после 30 сопоставимых чистых кликов или 1 500 ₽, решение о победе — только по содержательным обращениям. Если intent-open появляется без channel click, следующим отдельным тестом становится Wave49; если intent-open не растет — proof/value-at-decision.
