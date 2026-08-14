# Wave50: контракт эксперимента question-first

## Гипотеза

Релевантный посетитель понимает услугу, цену и proof, но не переходит к контакту, потому что формулировка «записаться на консультацию» воспринимается как обязательство до завершения сравнения.

Свежая опора: 361 показ / 42 клика / 1 430,15 ₽, CTR 11,63%, CPC 34,05 ₽; подтвержденных hard leads из paid-трафика 0. В отдельном точном срезе из 30 чистых рекламных визитов price 30, proof 22 и channel clicks 0. Query mix преимущественно коммерческий, а доля сомнительных запросов заметно ниже стоп-сигнала `>30%` нерелевантного расхода. Это усиливает локализацию разрыва, но не доказывает причинность CTA wording.

Clean-session опора: общая медиана `33 с`; price-only `8` — медиана `9 с`; proof `22` — `58 с`; offer terms `8` и scroll50 `8` — `80 с`; при этом CTA `0`. Сегменты наблюдательные и не доказывают причинность, поэтому экспериментальная переменная не расширяется.

Cross-offer N=1: первый чистый Wave48-визит пришел по явному price-intent запросу о полной цветной оклейке, провел `50 с`, достиг offerTerms/price/proof/process/warranty/scroll50 и не достиг scroll90 или contact CTA; hard обращения нет. Это направленно поддерживает локализацию до контакта на втором оффере, но не доказывает question-first: Wave48 имеет другую цену/услугу, `N=1`, а его CTA уже мягче root, хотя всё еще ведет к консультации и выбору времени.

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

1. `primary_contact_cta_view` with location — proposed exposure diagnostic; documentation only until a separate owner-approved instrumentation change.
2. Control proxy `contact_sheet_open` and candidate `contact_intent_open_question_first_v1` + `contact_sheet_open` — soft intent diagnostics.
3. `contact_channel_click` with channel/location payload — soft diagnostic event.
4. Existing canonical Telegram/WhatsApp/MAX/phone goals — soft CTA.
5. Содержательный диалог/звонок, запись, предоплата, выполнение — hard outcomes outside browser analytics.

Ни одно открытие/click не считается лидом без содержания диалога или звонка.

## Решение

- Сравнивать только чистые UTM-когорты с исключением QA.
- Не смешивать Wave45, Wave49 и Wave50.
- Не вмешиваться в текущий live Wave45 до родительского контрольного порога `60` сопоставимых кликов, `3 000 ₽` или `14 дней`, если раньше не возникнет системная поломка/стоп-сигнал.
- После отдельного owner gate и запуска Wave50: диагностический review после `30` сопоставимых чистых кликов или `1 500 ₽`; коммерческое решение — только по hard outcomes, диагностическое — по ступеням intent/channel.
- До `10` чистых визитов любой route-срез остается sanity/описательным; `30` чистых визитов на cell — диагностический, а не причинный или коммерческий порог.
- Известные `0/30` control относятся к channel CTA, не к intent-open. Сначала нужно получить exact `contact_sheet_open` baseline. Только при подтвержденных равных сопоставимых когортах `contact_sheet_open=0/30` control против `≥5/30` candidate intent-open номинальный one-sided Fisher составит `p≈0,026`; это всё равно soft evidence и требует проверки трафика/периода/QA. Hard winner заранее не объявляется по open/click.
- Early stop: broken contact path, QA pollution, uncontrolled spend or >30% irrelevant spend.
- Если intent-open не растет: тестировать value/trust/decision copy, не direct channels.
- Если intent-open растет, channel click остается низким: Wave49/contact-first становится приоритетным следующим тестом.
- Если channel click есть без реальных диалогов: проверять channel handoff и sales handling, не переделывать hero вслепую.

## Launch boundary

Локальная реализация, QA, commit, push и PR автономны. Production publication, Metrika goal creation, paid campaign preparation/edit/launch and Mango changes require a separate owner decision.
