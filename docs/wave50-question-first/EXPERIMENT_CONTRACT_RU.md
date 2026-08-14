# Wave50: контракт эксперимента question-first

## Гипотеза

Релевантный посетитель понимает услугу, цену и proof, но не переходит к контакту, потому что формулировка «записаться на консультацию» воспринимается как обязательство до завершения сравнения.

Свежая опора: 340 показов / 38 кликов / 1 331,83 ₽, CTR 11,18%, CPC 35,05 ₽; в 30 точных рекламных визитах price 30, proof 22 и channel clicks 0. Query mix преимущественно коммерческий, а стоп-сигнал `>30%` нерелевантного расхода не обнаружен. Это усиливает локализацию разрыва, но не доказывает причинность CTA wording.

## Единственная изменяемая переменная

Смысл первого шага меняется с записи на возможность задать вопрос по конкретному автомобилю.

В рамках одной переменной меняются только согласованные CTA/dialog/prefilled-message формулировки. Не меняются: оффер `180 000 ₽`, состав, срок, гарантия, мойка, такси, proof, адрес, hero, изображения, layout, каналы, реклама, аудитория, ключи, минус-слова и география.

## Route и атрибуция

- Route: `/question-first/`.
- Proposed campaign: `wave50_ya_search_fullfilm_180k_question_first`.
- `scenario=full-film`.
- `experiment_id=wave50_question_first`.
- Counter: `110584673`.
- QA markers: `utm_source=codex`, `utm_medium=qa`, campaign/scenario/experiment containing `qa`, `codex` or `smoke`; such traffic must not load/send Metrika.

## Измерительная лестница

1. `contact_intent_open_question_first_v1` — soft diagnostic event.
2. `contact_channel_click` with channel/location payload — soft diagnostic event.
3. Existing canonical Telegram/WhatsApp/MAX/phone goals — soft CTA.
4. Содержательный диалог/звонок, запись, предоплата, выполнение — hard outcomes outside browser analytics.

Ни одно открытие/click не считается лидом без содержания диалога или звонка.

## Решение

- Сравнивать только чистые UTM-когорты с исключением QA.
- Не смешивать Wave45, Wave49 и Wave50.
- Не вмешиваться в текущий live Wave45 до родительского контрольного порога `60` сопоставимых кликов, `3 000 ₽` или `14 дней`, если раньше не возникнет системная поломка/стоп-сигнал.
- После отдельного owner gate и запуска Wave50: диагностический review после `30` сопоставимых чистых кликов или `1 500 ₽`; коммерческое решение — только по hard outcomes, диагностическое — по ступеням intent/channel.
- Early stop: broken contact path, QA pollution, uncontrolled spend or >30% irrelevant spend.
- Если intent-open не растет: тестировать value/trust/decision copy, не direct channels.
- Если intent-open растет, channel click остается низким: Wave49/contact-first становится приоритетным следующим тестом.
- Если channel click есть без реальных диалогов: проверять channel handoff и sales handling, не переделывать hero вслепую.

## Launch boundary

Локальная реализация, QA, commit, push и PR автономны. Production publication, Metrika goal creation, paid campaign preparation/edit/launch and Mango changes require a separate owner decision.
