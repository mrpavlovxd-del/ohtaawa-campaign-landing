# Wave50: attribution correction 15.08.2026, 08:41 МСК

Источники истины в родительском workspace:

- `docs/ohtaawa-retargeting/analytics-known-qa-batches.json`;
- `docs/ohtaawa-retargeting/agent-work/2026-08-15/LIVE_MARKETING_CHECKPOINT_RU.md`.

## Подтвержденный факт

Владелец подтвердил, что недавний Mango-звонок был технической проверкой, а весь неразмеченный organic/no-ad агрегат с нескольких его устройств за предшествующие пару часов — ручными просмотрами посадочных.

Точное число визитов неизвестно и не восстанавливается предположением. Batch исключается целиком из:

- оценки спроса;
- lead/hard-outcome reconciliation;
- конверсии;
- выводов о качестве, надежности или UX сайта.

После исключения дополнительных целевых строк Mango нет. Paid exact-UTM Wave45/46/48 остаются валидными отдельно и не смешиваются с owner-QA batch.

## CRO-интерпретация

Эта поправка не усиливает и не ослабляет Question First гипотезу: она удаляет недопустимый источник атрибуционного шума. Состояние доказательств определяется только paid exact-UTM когортами, hard outcomes после QA exclusion и техническим production smoke.

Классификация owner-QA aggregate: `KNOWN_QA_EXCLUSION`, не спрос и не доказательство поведения реального посетителя.

## Решение

Wave50 source, UI, copy, events, screenshots и однофакторный контракт не меняются. Live Wave45/46/48, budgets, Mango и production остаются read-only/unchanged. PR #22 сохраняет статус `NOT FOR DEPLOY`.
