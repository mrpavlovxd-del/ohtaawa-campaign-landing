# Wave26: совместимость CRM-РСЯ с after-price CTA

Дата: `24.07.2026`

Ветка: `codex/wave27-after-price-cta`

Статус: `READY_FOR_OWNER_DEPLOY_APPROVAL / NOT LIVE`

## Исправленная несостыковка

Контракт Wave26 использует `scenario=crm-premium-recent`, тогда как
опубликованный лендинг распознает только `crm`, `new-car` и `used-car`.
Без исправления тёплая аудитория могла получить общий оффер вместо CRM-версии.

Локальный кандидат теперь:

- сопоставляет `crm-premium-recent` с CRM-сценарием;
- активирует отдельный эксперимент только при `experiment_id=wave26`;
- показывает после цены компактный CTA оценки кузова по 2–3 фото;
- сохраняет relationship-first первый экран `OHTAAWA теперь не только мойка`;
- передает в события `experiment_id=wave26`, `scenario=crm`,
  `location=after_price`;
- не изменяет контрольную версию и эксперимент Wave22.

## Текст CTA

- Кикер: `Быстрая оценка по фото`.
- Заголовок: `Что действительно стоит сделать с кузовом?`
- Пояснение: мастер подскажет, где достаточно полировки, а где имеет смысл
  защитная пленка.
- Действия: `Отправить 2–3 фото` и `Позвонить мастеру`.

## QA

- Статические тесты: `6/6 PASS`.
- Wave26 browser QA: `PASS` на `1440×1000`, `390×844`, `320×568`.
- Wave27/Wave22 browser QA: `PASS`.
- Исходный полный Wave22 regression: `PASS`.
- Горизонтальное переполнение: `0`.
- Ошибки страницы: `0`.
- Мобильный sticky CTA скрывается, пока виден локальный after-price CTA.
- Telegram event smoke: `PASS`.

## Доказательства

- `proof/2026-07-24-wave26-landing-bridge/wave26-landing-qa.json`
- `proof/2026-07-24-wave26-landing-bridge/desktop-1440x1000-wave26-after-price-viewport.png`
- `proof/2026-07-24-wave26-landing-bridge/mobile-390x844-wave26-after-price-viewport.png`
- `proof/2026-07-24-wave26-landing-bridge/mobile-320x568-wave26-after-price-viewport.png`

## Граница запуска

Продакшен не изменен. Публикация ветки, merge в `main` и обновление
`go.detailingspb.ru` требуют явного подтверждения владельца. После публикации
обязательны HTTPS-smoke, проверка обоих experiment ID и проверка целей
Метрики до загрузки CRM-сегмента.
