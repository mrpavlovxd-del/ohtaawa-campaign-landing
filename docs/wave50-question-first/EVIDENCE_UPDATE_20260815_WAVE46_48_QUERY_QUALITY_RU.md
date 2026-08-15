# Wave50: Wave46/48 query-quality signal, 15.08.2026

Read-only источники в parent workspace:

- `agent-work/2026-08-15/yandex-search-queries/wave46-20260815-0855-2026-08-15T05-54-42-910Z.json`;
- `agent-work/2026-08-15/yandex-search-queries/wave48-20260815-0855-2026-08-15T05-57-22-469Z.json`;
- `agent-work/2026-08-15/yandex-phrase-delivery/wave46-20260815-0815-2026-08-15T05-19-17-364Z.json`;
- `agent-work/2026-08-15/yandex-phrase-delivery/wave48-20260815-0815-2026-08-15T05-22-12-799Z.json`.

## Факты

| Campaign | Фактические запросы | Targeting |
|---|---|---|
| Wave46 | «оклейка защитной пленкой капота»; «оклейка пленкой передней части капота»; «бронирование авто пленкой в СПб цены» | 3/3 клика — автотаргетинг |
| Wave48 | «сколько стоит оклейка всего автомобиля цветной пленкой»; «смена цвета авто пленкой СПб цена» | 2/2 клика — автотаргетинг |

Phrase-delivery reconciliation: Wave46 содержит `17`, Wave48 `18` ручных операторных фраз; все `35` имеют `0` показов. Следовательно, ручная phrase-cell пока отсутствует, а observed traffic нельзя сравнивать с manual targeting.

## Интерпретация

- Для наблюдаемых `5` кликов очевидно мусорные запросы — `LIKELY_FALSE_FOR_OBSERVED_QUERIES`.
- Это не доказывает качество всего traffic stream: `N=5`, а manual phrases не получили delivery.
- Релевантный query не доказывает готовность обратиться, правильность оффера, trust или CTA-causality.
- Wave46 behavioral `N=2` и Wave48 behavioral `N=1` сохраняют descriptive status; query rows не заменяют exact-session denominator.

## Решение

Не менять live ads, autotargeting, manual phrases, budgets или production из этой задачи. Wave50 Question First остается неизмененным контролируемым кандидатом и не распространяется на Wave46/48 по пяти кликам. Нового visual QA не требуется: UI/source/events не изменены.
