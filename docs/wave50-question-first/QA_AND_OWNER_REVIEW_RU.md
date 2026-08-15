# Wave50: QA и owner review

Дата QA: 14.08.2026. Evidence refresh: 15.08.2026. Readiness: `PRODUCTION_CANDIDATE_READY / NOT FOR DEPLOY / NEEDS_OWNER_APPROVAL`.

Здесь `PRODUCTION_CANDIDATE_READY` означает: изолированная реализация, mobile-first QA, tracking contract, proof pack и rollback готовы к owner review. Это не `LAUNCH_READY`: production merge/deploy, live goal mapping и paid cohort не разрешены и не выполнены.

## Что проверено

- Контракт изменения: структура DOM и последовательность локальных assets совпадают с Wave45; допустимы только согласованные question-first CTA/dialog/prefilled-message формулировки, поясняющая hero-строка, route/config и диагностическое intent-событие.
- Оффер сохранен: полная прозрачная оклейка, `180 000 ₽`, `3–5 дней`, `5 лет`, мойка, такси, адрес и proof не изменены.
- Fresh browser QA: `1440×900`, `430×932`, `390×844`, `360×800`.
- На всех четырех размерах: CTA в первом окне, horizontal overflow отсутствует, изображения загружаются, интерактивы имеют имена, tap-target smoke пройден, диалог удерживает фокус, carousel/gallery/FAQ работают.
- Console/page errors: `0`; same-origin network errors/failures: `0`.
- QA isolation: собственные запросы landing к Метрике `0`; сторонний iframe Яндекс Карт учитывается отдельно и не является запросом страницы.
- Tracking: `contact_intent_open_question_first_v1`, `contact_sheet_open`, `contact_channel_click` и четыре существующих canonical channel events наблюдаются в QA.
- Регрессия: Wave45 message-match/tracking и Wave46 risk-zones message-match/tracking проходят при штатных QA attribution-параметрах; визуальные smoke всех трех production routes проходят.
- Fresh production counterfact 15.08: full-film/risk-zones/color-film прошли HTTPS 200 и desktop/mobile `390×844`; hero загружены, 0 broken images, 0 layout/overflow issues, 7 contact links/route и 0 missing route events/targets/UTM. QA-маркеры не отправляли тестовые цели в Метрику; mobile hero risk-zones визуально присутствует.

## Производительность кандидата

| Viewport | Initial transfer | Full-page transfer | FCP | LCP | CLS |
|---|---:|---:|---:|---:|---:|
| 1440×900 | 875 KB | 1 367 KB | 516 ms | 516 ms | 0 |
| 430×932 | 805 KB | 1 297 KB | 256 ms | 256 ms | 0 |
| 390×844 | 805 KB | 1 297 KB | 220 ms | 220 ms | 0 |
| 360×800 | 805 KB | 1 297 KB | 228 ms | 228 ms | 0 |

Это локальный Chromium smoke, а не полевые Core Web Vitals. Существенного весового регресса к Wave45 нет: route использует те же CSS, JS substrate и media; меняется только HTML-копирайтинг и config.

## Product Excellence / red-team

| Критерий | Оценка / 10 | Вывод |
|---|---:|---|
| Product truth | 9.4 | Цена, состав, сроки, гарантия и реальные proof сохранены |
| CRO-диагностичность | 9.3 | Добавлена недостающая ступень intent → channel без смешивания variables |
| Mobile ergonomics | 9.1 | Один ясный CTA; нет 2×2 панели, закрывающей hero |
| Copy / anxiety reduction | 9.0 | Первый шаг — вопрос по автомобилю, без обещания мгновенного ответа или доступности |
| Visual craft | 8.9 | Сохранен одобренный брендовый Wave45 target; все fresh widths проверены |
| Accessibility basics | 9.0 | Landmark, skip link, labels, focus, contrast, reduced-motion smoke пройдены |
| Launch readiness | 6.0 | Намеренно заблокировано: нет owner approval, deployment и live goal mapping |

Самокритика: это не доказанный победитель и не визуальный редизайн. Это лучший первый контролируемый диагностический вариант. Он не доказывает, что UX был причиной нулевых обращений, пока нет чистой live-когорты и hard outcomes.

Финальный red-team уточнил микрокопирайт без расширения экспериментальной переменной: вместо неестественного «по ближайшему времени» теперь указано «сроки работ и ближайшие даты», а соседняя hero-строка больше не превращает короткий вопрос в обязательный полуторачасовой визит. Бесплатная мойка и длительность консультации сохранены как условный следующий шаг после ответа. QA-сценарий сбрасывает transient focus и дополнительно сохраняет proof viewport ниже sticky header; свежий rerun на финальном HTML не содержит служебного skip-link или перекрытия заголовка. Один ранний desktop-прогон зарегистрировал отмену загрузки невыбранного mobile responsive asset; последующие чистые прогоны проблему не воспроизвели, строгий network gate сохранен.

Exact-когорта по checkpoint 15.08 остается на `33` визитах: price `33`, proof `25`, offer terms/scroll50 `8`, scroll90 `1`, channel CTA `0`; `18/33` длились ≥30 с, `11/33` — ≥60 с. Детальные медианы (`33 с` overall, `9 с` price-only, `58 с` proof, `80 с` terms/scroll50) относятся к предыдущему 30-визитному подмножеству и не экстраполируются на три более поздних визита. Вывод ограничен: часть посетителей быстро сверяет цену, другая часть изучает страницу без контакта; сегменты self-selected, а время может включать idle.

Clean-data checkpoint 15.08 не меняет QA кандидата: Wave45 exact cohort осталась `33`, Wave46 имеет только два коротких price-only визита, Wave48 — один обработанный визит, Mango — `0` новых звонков. Это evidence-only refresh; HTML/CSS/JS, event map и screenshots не изменены, повторный visual QA не требуется.

Attribution correction 08:41 МСК: технический Mango-звонок и весь неразмеченный organic/no-ad агрегат owner-устройств за предшествующие пару часов исключены целиком как known QA. Точное число не восстанавливается предположением. Paid exact-UTM Wave45/46/48 не исключаются и не смешиваются с этим batch.

## Proof pack

- `proof/wave50-owner-validation-20260815-final/qa.json` — финальный строгий browser QA после copy/visual red-team.
- `proof/wave50-owner-validation-20260815-final/desktop-1440-*.png` — fresh desktop hero/contact/proof/proof-viewport/scope-price/full-page.
- `proof/wave50-owner-validation-20260815-final/mobile-430-*.png` — fresh mobile 430.
- `proof/wave50-owner-validation-20260815-final/mobile-390-*.png` — fresh mobile 390 и full-page.
- `proof/wave50-owner-validation-20260815-final/mobile-360-*.png` — fresh mobile 360.
- `docs/wave50-question-first/PRODUCT_EXCELLENCE_PROOF_PACK_20260815_RU.md` — индекс доказательств, рисков, rollback и owner gate.
- `proof/wave50-cro-audit-20260814/candidate/qa.json` — полный browser QA.
- `proof/wave50-cro-audit-20260814/route-performance.json` — сравнимый route performance smoke.
- `proof/wave50-cro-audit-20260814/candidate/*-hero.png` — первое окно 1440/430/390/360.
- `proof/wave50-cro-audit-20260814/candidate/*-contact.png` — contact sheet.
- `proof/wave50-cro-audit-20260814/candidate/*-proof.png` — реальный proof.
- `proof/wave50-cro-audit-20260814/candidate/*-scope-price.png` — цена/состав.

## Что не проверено и граница запуска

- Не проверено: реальная конверсия, содержательность диалогов, качество handoff в мессенджерах/телефоне, полевые Web Vitals, live goal mapping в Метрике. Подтвержденных hard leads по paid-трафику сейчас `0`.
- Не выполнялись: merge/deploy, публикация route, изменение Метрики, рекламы, бюджета, Mango или production-конфигурации.
- Не выполнялись monitoring/stop/continue решения по Wave45/46/48: они остаются в родительской маркетинговой задаче.
- Owner-confirmed неразмеченный organic/no-ad агрегат указанного интервала и технический Mango-звонок исключены без численного домысла; подтвержденных paid hard leads они не создают и ничего не доказывают о качестве сайта.
- Для запуска Wave50 требуется отдельный owner gate, принятый экспериментальный контракт, чистая когорта, goal mapping и deployment choice. После разрешенного запуска Wave50 review — через `30` сопоставимых чистых кликов или `1 500 ₽`, без смешивания Wave45/Wave49/Wave50. Monitoring и пороги live Wave45/46/48 принадлежат родительской задаче.
- Rollback: снять Wave50-когорту с нового route и вернуть трафик на прежний неизмененный URL; root Wave45 не заменяется этим PR.

## Рекомендация

После завершения/решения по контрольному порогу Wave45 сначала проверить Wave50 question-first. Коммерческий query mix и длинные proof/terms-сессии усиливают этот приоритет, но не являются разрешением на публикацию и не доказывают CTA-причину. Если intent-open появляется, но channel click остается низким — следующим отдельным тестом становится Wave49 contact-first. Если intent-open не растет — переходить к proof/value-at-decision, а не добавлять каналы вслепую. Если channel click есть без содержательных обращений — проверять внешний handoff и обработку, не hero.
