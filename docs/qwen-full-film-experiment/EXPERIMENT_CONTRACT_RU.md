# Experiment contract — Qwen Tension holistic challenger

Статус: `OWNER_GRADE_TECHNICAL_CANDIDATE / NOT FOR DEPLOY / MEDIA_OWNER_GATE`. Никакой live assignment, рекламы или production change в этой ветке не выполняется.

## Вопрос эксперимента

Повышает ли целостный Qwen-v2.4 + bounded Sol hardening challenger долю первых содержательных контактов среди релевантного paid search по полной прозрачной оклейке за 180 000 ₽ по сравнению с неизменённой production-посадочной?

## Факты до эксперимента

- Exact paid cohort Wave45: 33 визита; price 33, proof 25, offer terms/scroll50 8, scroll90 1, phone/TG/WA/MAX 0.
- 18/33 визитов длились не менее 30 секунд, 11/33 — не менее 60 секунд.
- Поисковые запросы преимущественно коммерческие и релевантные цене полной защитной оклейки в Санкт-Петербурге; признака более 30% явно нерелевантного расхода не обнаружено.
- Production smoke прошёл: HTTPS 200, broken images 0, horizontal overflow 0, hero и контакты присутствуют.
- Owner organic/no-ad проверки и тестовый звонок входят в known QA exclusions и не считаются спросом или лидами.
- Cross-route context мал и не смешивается с основной когортой: Wave46 имела 2 обработанных exact visits по 18 и 23 секунды с price 2 / proof 0 / CTA 0; Wave48 — 1 обработанный exact visit 50 секунд с price/proof/process/warranty/scroll50 и CTA 0. Фактические запросы Wave46/48 были коммерческими и релевантными, но N слишком мало для причинного вывода.

Эти факты показывают gap между ознакомлением и контактом. Они не доказывают, что причина — дизайн, доверие, текст или психологическая стоимость CTA.

Технический candidate прошёл локальные gates: browser QA `90/90`, performance `70/70`, motion `99/99`, source checks `PASS`. Это доказывает проверенное поведение candidate в test environment, но не site-cause, business uplift, publishability media или launch readiness.

## Гипотеза

Holistic challenger с конкретным question-first шагом, более сильной материальной визуализацией, сохранённой ценой/proof и честной механикой каналов может снизить психологическую стоимость первого действия.

Классификация: `PLAUSIBLE_BUT_UNPROVEN`. Альтернативы не исключены: состав трафика, доверие к бренду/proof, цена, сезонность, канал контакта или малый объём выборки. Поэтому 33 paid exact / 0 CTA — baseline, а не доказательство дефекта сайта.

Ожидаемое наблюдаемое изменение: больше exact paid visits с одним из канонических contact events; затем — больше подтверждённых meaningful inquiries. Это прогноз, не обещание результата.

## Один контролируемый фактор

Единственный экспериментальный фактор — вариант page experience:

- Control: неизменённая production-посадочная полной оклейки.
- Challenger: после independent visual recheck, media owner gate и owner approval — замороженный exact hash Qwen v2.4 + bounded Sol hardening целиком.

Постоянны: услуга, цена 180 000 ₽, срок 3–5 дней, гарантия 5 лет, контакты, география, рекламные кампании/запросы/бюджеты, counter 110584673, attribution schema и правила QA-exclusion.

Challenger одновременно меняет композицию, визуальный язык, Tension Field, microcopy и first-contact presentation. Поэтому тест диагностирует эффект всего пакета и не позволяет причинно выделить отдельную анимацию, текст или компонент. Для component attribution потребуется следующий отдельный тест.

Текущий candidate ещё не зарегистрирован как live challenger: independent visual verdict `GO_OWNER_GRADE / VISUAL GO`, но generated hero layer остаётся owner-gated, а три retained real proof assets имеют статус `UNKNOWN_DO_NOT_PUBLISH`.

## Когорта и исключения

- Включать только exact paid UTM traffic основной услуги full film.
- Не смешивать Wave46 risk-zones, Wave48 color-film, organic/no-ad, owner QA, bot/internal preview или тестовые звонки.
- Дедупликация и human/QA rules должны быть зафиксированы до старта и одинаковы для обоих arm.
- Любые изменения рекламы, бюджета, поисковых фраз или live goal mapping во время теста делают период несопоставимым и требуют нового окна.

## Метрики

Primary proxy:

- доля уникальных валидных paid visits с хотя бы одним событием lead_phone_polish_film_v8, lead_telegram_polish_film_v8, lead_whatsapp_polish_film_v8 или lead_max_direct_polish_film_v8.

Business outcome:

- доля уникальных валидных paid visits с подтверждённым содержательным обращением/hard lead после read-only reconciliation с фактическими каналами. CTA click и hard lead отчётны раздельно.

Secondary diagnostics:

- price_view, proof_view, offer_terms_view, scroll50, scroll90;
- channel mix и contact_location;
- UTM message_variant;
- technical guardrails: runtime errors, broken media, overflow, event duplication, QA-isolation.

Текст модели автомобиля не записывается в analytics и не используется как метрика.

## Instrumentation

- Go-only counter: 110584673.
- Attribution fields: scenario, experiment_id, message_variant и текущие UTM/query fields.
- Все 13 canonical events перечислены в QWEN_QA_REPORT_RU.md.
- Final experiment_id и assignment method должны быть заморожены в launch manifest после owner approval. Текущий candidate value нельзя считать live registration.
- QA создаёт локальный event proof и 0 внешних запросов Метрики.

## Решение и stopping rules

Baseline 0/33 не даёт устойчивой оценки conversion rate и достаточной основы для честного power calculation. Поэтому до launch обязателен отдельный pre-registration:

1. traffic allocation и стабильный assignment;
2. observation window;
3. минимальный practically meaningful effect;
4. confidence/power rule;
5. minimum sample и no-peeking rule;
6. порядок reconciliation CTA с meaningful leads.

Нельзя объявлять победителя по первому CTA или одному hard lead. Если CTA proxy растёт, а meaningful inquiries не растут или ухудшаются по качеству, challenger не считается доказанным победителем.

Немедленный stop/rollback требует: неправильной цены/условий, сломанных contact routes, event duplication/loss, QA traffic в Метрике, privacy incident, media-rights breach, критического mobile defect или performance regression за утверждённый бюджет.

## Approval boundary

Отдельное решение владельца требуется на:

- merge/deploy challenger;
- способ и долю live assignment;
- pre-registered sample/decision rule;
- любые изменения рекламы, Метрики/goals, Mango или budget;
- public-use approval retained proof media.

Production, реклама, бюджеты, Metrika settings/goals, Mango, телефония и live UTM не менялись. Любой merge/deploy, публикация media или включение assignment требуют отдельного явного решения владельца после закрытия visual/media gates.
