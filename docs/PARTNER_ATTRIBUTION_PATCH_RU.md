# Непубличный патч партнерской атрибуции OHTAAWA

## Результат

- Worktree: `C:\Users\Никита\Documents\New project\artifacts\ohtaawa-partner-attribution`.
- Ветка: `codex/partner-attribution-scenario`, база: production `7dacf0a`.
- `scenario=partner_referral` разрешен только как analytics-only значение.
- Для `partner_referral` визуальный variant, hero-атрибуты, заголовок и CTA-тексты остаются `generic`.
- Visit/event payload сохраняют `scenario=partner_referral`, `experiment_id` и `utm_content`.
- Allowlist: `generic`, `crm`, `new-car`, `used-car`, `partner_referral`. Остальные значения, включая имена свойств прототипа, нормализуются в `generic`.
- Наличие `_ym_debug` или заранее выставленный `window.__ohtaawaQa=true` блокируют загрузку Метрики, `params`, `reachGoal` и запись в общий `dataLayer`. Локальные QA payload доступны в `window.ohtaawaVisitParams` и `window.ohtaawaQaEvents`.

## Измененные файлы

- `index.html` - разделение analytics scenario и visual variant, allowlist, QA network guard.
- `tests/partner-attribution.spec.mjs` - browser-контракты атрибуции, allowlist, CTA и QA.
- `tests/static-server.mjs` - локальный loopback-only static server для тестов.
- `playwright.config.mjs` - desktop/mobile проекты и локальный web server.
- `package.json`, `package-lock.json` - воспроизводимый Playwright test runner.
- `.gitignore` - исключение локальных test artifacts и dependencies.
- `docs/PARTNER_ATTRIBUTION_PATCH_RU.md` - этот отчет.

## Проверки

Команда: `$env:OHTAAWA_BROWSER_CHANNEL='chrome'; npm test`.

- Синтаксис test runner и static server: успешно.
- Playwright: 8/8 успешно в Chrome, `1440x1000` и `390x844`.
- Проверены production-like payload через локальный `ym` stub и перехват всех внешних запросов.
- Проверены `_ym_debug` и preseeded QA: внешних запросов нет, скрипты Метрики не добавлены, реальные analytics sinks не вызываются.
- Проверены Telegram, WhatsApp, MAX и `tel:` CTA: приложение не вызывает `preventDefault`, исходные native URL сохранены.
- Свежие screenshots: generic UI без горизонтального overflow на desktop/mobile; production UI и тексты не менялись.
- `git diff --check`: успешно.
- Поиск секретов: найден только синтетический `opaque-partner-token`; credentials и private artifacts не добавлены.

## Найденные вопросы и закрытие

| ID | Серьезность | Факт | Статус | Проверка |
| --- | --- | --- | --- | --- |
| PA-01 | High | Visual variant перезаписывал партнерский analytics scenario в `generic`. | Закрыт | Visit/event browser-контракты |
| PA-02 | Medium | `_ym_debug` не гарантировал отсутствие реальных событий Метрики. | Закрыт | Два QA network-контракта |

## Риски и границы

- Реальные endpoint Метрики намеренно не вызывались. Прием payload внешним сервисом не проверен; локальный контракт проверяет точную форму аргументов `params`/`reachGoal`.
- `_ym_debug` теперь означает network-silent QA. Это намеренное изменение по контракту патча.
- Патч не объединен с параллельными ветками; возможные будущие конфликты test infrastructure должны разрешаться при интеграции без отката чужих изменений.
- Deploy, merge в `main`, push, PR, paid calls и production-изменения не выполнялись.
- Rollback после интеграции: обычный `git revert` коммита патча; данные и миграции не затрагиваются.

## Gate-решение

Technical, QA, visual, security/privacy и cleanup gates пройдены локально. Launch gate остановлен на разрешенной границе: локальный commit без публикации.
