# Wave50: QA и owner review

Дата: 14.08.2026. Readiness: `IMPLEMENTATION_READY / NEEDS_OWNER_APPROVAL`.

## Что проверено

- Контракт изменения: структура DOM и последовательность локальных assets совпадают с Wave45; допустимы только CTA/dialog/prefilled-message формулировки, route/config и диагностическое intent-событие.
- Оффер сохранен: полная прозрачная оклейка, `180 000 ₽`, `3–5 дней`, `5 лет`, мойка, такси, адрес и proof не изменены.
- Fresh browser QA: `1440×900`, `430×932`, `390×844`, `360×800`.
- На всех четырех размерах: CTA в первом окне, horizontal overflow отсутствует, изображения загружаются, интерактивы имеют имена, tap-target smoke пройден, диалог удерживает фокус, carousel/gallery/FAQ работают.
- Console/page errors: `0`; same-origin network errors/failures: `0`.
- QA isolation: собственные запросы landing к Метрике `0`; сторонний iframe Яндекс Карт учитывается отдельно и не является запросом страницы.
- Tracking: `contact_intent_open_question_first_v1`, `contact_sheet_open`, `contact_channel_click` и четыре существующих canonical channel events наблюдаются в QA.
- Регрессия: Wave45 message-match/tracking и Wave46 risk-zones message-match/tracking проходят при штатных QA attribution-параметрах; визуальные smoke всех трех production routes проходят.

## Производительность кандидата

| Viewport | Initial transfer | Full-page transfer | FCP | LCP | CLS |
|---|---:|---:|---:|---:|---:|
| 1440×900 | 875 KB | 1 367 KB | 412 ms | 412 ms | 0 |
| 430×932 | 805 KB | 1 297 KB | 256 ms | 256 ms | 0 |
| 390×844 | 805 KB | 1 297 KB | 236 ms | 236 ms | 0 |
| 360×800 | 805 KB | 1 297 KB | 628 ms | 628 ms | 0 |

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

## Proof pack

- `proof/wave50-cro-audit-20260814/candidate/qa.json` — полный browser QA.
- `proof/wave50-cro-audit-20260814/route-performance.json` — сравнимый route performance smoke.
- `proof/wave50-cro-audit-20260814/candidate/*-hero.png` — первое окно 1440/430/390/360.
- `proof/wave50-cro-audit-20260814/candidate/*-contact.png` — contact sheet.
- `proof/wave50-cro-audit-20260814/candidate/*-proof.png` — реальный proof.
- `proof/wave50-cro-audit-20260814/candidate/*-scope-price.png` — цена/состав.

## Что не проверено и граница запуска

- Не проверено: реальная конверсия, содержательность диалогов, качество handoff в мессенджерах/телефоне, полевые Web Vitals, live goal mapping в Метрике.
- Не выполнялись: merge/deploy, публикация route, изменение Метрики, рекламы, бюджета, Mango или production-конфигурации.
- До отдельного owner gate live Wave45 остается неизменным до родительского контрольного порога `60` сопоставимых кликов, `3 000 ₽` или `14 дней`. Для запуска Wave50 требуется принять экспериментальный контракт, выбрать чистую когорту, утвердить goal mapping и deployment. После запуска Wave50 review — через `30` сопоставимых чистых кликов или `1 500 ₽`, без смешивания Wave45/Wave49/Wave50.
- Rollback: снять Wave50-когорту с нового route и вернуть трафик на прежний неизмененный URL; root Wave45 не заменяется этим PR.

## Рекомендация

После завершения/решения по контрольному порогу Wave45 сначала проверить Wave50 question-first. Свежий коммерческий query mix усиливает этот приоритет, но не является разрешением на публикацию. Если intent-open появляется, но channel click остается низким — следующим отдельным тестом становится Wave49 contact-first. Если intent-open не растет — переходить к proof/value-at-decision, а не добавлять каналы вслепую. Если channel click есть без содержательных обращений — проверять внешний handoff и обработку, не hero.
