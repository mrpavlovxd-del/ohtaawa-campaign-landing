# Wave53 — контракт посадочной и измерения

Статус: `PRELAUNCH / NEW COHORT / NOT FOR DEPLOY / NO SPEND`.

## Факт и гипотеза

Факт: услуга имеет подтверждённую запись из Яндекс Карт и два qualified Avito contacts. Это доказывает наличие релевантного спроса, но не эффективность будущей платной кампании.

Гипотеза: конкретный fixed-price оффер и первый шаг «Узнать ближайшее время» снизят психологическую стоимость обращения по сравнению с абстрактной консультацией. Причинный эффект нельзя считать доказанным без чистой контрольной/вариантной когорты.

## Контролируемый фактор

Единственный поведенческий фактор первой версии — framing первого контакта:

- основной CTA: `Узнать ближайшее время`;
- сообщение уже содержит услугу и цену;
- от клиента требуется только марка/модель и, при желании, короткий вопрос о состоянии кожи.

Не меняются в рамках будущего теста: услуга, цена `3 500 ₽`, состав, география, каналы контакта, бренд, политика допработ и метод квалификации лида.

Поскольку production route ещё не существует, этот кандидат является измеримым baseline v1, а не причинным A/B-результатом. Любое сравнение с другими услугами — описательное, не экспериментальное.

## Message match

- Hero: `Чистка кожи и кондиционер Koch — 3 500 ₽`.
- Scope: деликатная очистка кожи, кондиционер Koch, ручная проверка поверхности.
- Не обещается: полная химчистка, реставрация/покраска, устранение любых повреждений, состояние «как новое».
- Дополнительные работы — только отдельно после осмотра и согласования.

## Изоляция

- `utm_campaign=wave53_ya_search_leather_care_3500`
- `scenario=leather_care_fixed_3500`
- `experiment_id=wave53`
- `service_route=leather_care`
- `offer_id=leather_care_koch_fixed_3500`
- counter: только `110584673`

Owner/QA исключаются по `qa`, `codex`, `smoke`, `_ym_debug`, localhost/127.0.0.1 и QA-маркерам в attribution.

## События

| Слой | Goal/event |
|---|---|
| Page | `landing_view_leather_care_w53` |
| Price | `price_view_leather_care_w53` |
| Scope | `offer_terms_view_leather_care_w53` |
| Trust | `trust_view_leather_care_w53` |
| Process | `process_view_leather_care_w53` |
| CTA intent | `contact_sheet_open_leather_care_w53` |
| Phone | `lead_phone_leather_care_w53` |
| Telegram | `lead_telegram_leather_care_w53` |
| WhatsApp | `lead_whatsapp_leather_care_w53` |
| MAX | `lead_max_leather_care_w53` |
| Scroll | `landing_scroll_50_leather_care_w53`, `landing_scroll_90_leather_care_w53` |
| Routes | `route_yandex_reviews_leather_care_w53`, `route_yandex_maps_leather_care_w53`, `route_main_site_leather_care_w53` |

`contact_sheet_open` — только намерение, не lead. Hard lead — содержательный двусторонний диалог с согласованным следующим шагом; booking — отдельный подтверждённый результат.

## Критерий проверки после отдельного launch gate

Минимальный диагностический срез: чистые exact-UTM visits, доли price/scope/trust/process, CTA intent, channel clicks, meaningful contacts и bookings. Порог решения и бюджет должны быть отдельно утверждены владельцем до любых paid-действий; этот PR их не задаёт и не запускает.
