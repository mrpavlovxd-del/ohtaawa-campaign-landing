# Wave50: контракт эксперимента question-first

## Гипотеза

Релевантный посетитель понимает услугу, цену и proof, но не переходит к контакту, потому что формулировка «записаться на консультацию» воспринимается как обязательство до завершения сравнения.

Свежая опора: Wave45 `400` показов / `45` кликов / `1 494,42 ₽`, расчетный CPC `33,21 ₽`. В отдельном точном срезе по-прежнему `33` чистых рекламных визита: price 33, proof 25, conditions/scroll50 8, scroll90 1 и channel clicks 0; после 14.08 новых exact visits нет. Query mix преимущественно коммерческий, а доля сомнительных запросов заметно ниже стоп-сигнала `>30%` нерелевантного расхода. `18/33` визитов длились не менее 30 с, `11/33` — не менее 60 с. Это сохраняет локализацию разрыва, но не доказывает причинность CTA wording.

Предыдущая более детальная 30-визитная сегментация: общая медиана `33 с`; price-only `8` — медиана `9 с`; proof `22` — `58 с`; offer terms `8` и scroll50 `8` — `80 с`; при этом CTA `0`. Эти значения не переносятся автоматически на три новых визита. Сегменты наблюдательные и не доказывают причинность, поэтому экспериментальная переменная не расширяется.

Cross-offer: Wave48 получил два клика по строго релевантным price-intent запросам о полной цветной оклейке/смене цвета в СПб, но Метрика пока обработала только один clean visit. Он провел `50 с`, достиг offerTerms/price/proof/process/warranty/scroll50 и не достиг scroll90 или contact CTA; hard обращения нет. Это направленно поддерживает локализацию до контакта на втором оффере, но не доказывает question-first: behavioral `N=1`, другая цена/услуга, а CTA Wave48 уже мягче root, хотя всё еще ведет к консультации и выбору времени.

Wave46 получил `3` клика, но exact UTM обработал только `2` коротких визита (`18/23 с`): price `2`, proof/contact CTA `0`. Это descriptive `N=2`, не post-proof когорта; она не объединяется с Wave45 и не изменяет экспериментальную переменную. Mango 15.08 не дал новых звонков после исключения owner QA, что подтверждает отсутствие hard outcome, но не его причину.

Технический контрфакт 15.08: все три live route прошли desktop/mobile `390×844` smoke с HTTPS 200, загруженными hero, `0` broken images/layout issues, семью contact links на route и route-specific event smoke без missing targets/events/UTM. Поэтому Wave50 не является recovery-патчем: техническая надежность страницы остается неизменяемым условием, а тест изолирует только психологическую обязательность первого шага. Один smoke не проверяет внешний handoff или intermittent/client-specific failures.

## Единственная изменяемая переменная

Смысл первого шага меняется с записи на возможность задать вопрос по конкретному автомобилю.

В рамках одной переменной меняются согласованные CTA/dialog/prefilled-message формулировки и одна поясняющая строка рядом с hero CTA: вопрос является первым шагом, а консультация с бесплатной мойкой — последующим условным этапом, только если посетитель решит приехать. Не меняются: оффер `180 000 ₽`, состав, срок, гарантия, сама бесплатная мойка и ее длительность, такси, proof, адрес, hero-изображения, layout, каналы, реклама, аудитория, ключи, минус-слова и география.

Формулировка «получить расчёт» не входит в этот контракт. При уже фиксированной цене `180 000 ₽` она создает отдельное, пока не определенное обещание результата и смешивает question-first с estimate-first. Такой вариант возможен только отдельным тестом после явного определения объекта расчета, необходимых входных данных и ожидаемого ответа.

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
- Не принимать в этой ветке stop/continue/edit решения по Wave45/46/48: их мониторинг принадлежит родительской маркетинговой задаче.
- Не вмешиваться в текущие live Wave45/46/48; их пороги, системные stop-signals и продолжение определяются только родительской маркетинговой задачей.
- После отдельного owner gate и запуска Wave50: диагностический review после `30` сопоставимых чистых кликов или `1 500 ₽`; коммерческое решение — только по hard outcomes, диагностическое — по ступеням intent/channel.
- До `10` чистых визитов любой route-срез остается sanity/описательным; `30` чистых визитов на cell — диагностический, а не причинный или коммерческий порог.
- Известные `0/33` control относятся к channel CTA, не к intent-open. Сначала нужно получить exact `contact_sheet_open` baseline. Только при подтвержденных равных сопоставимых когортах `contact_sheet_open=0/33` control против `≥5/33` candidate intent-open номинальный one-sided Fisher составит `p≈0,0266`; это всё равно soft evidence и требует проверки трафика/периода/QA. Hard winner заранее не объявляется по open/click.
- Early stop: broken contact path, QA pollution, uncontrolled spend or >30% irrelevant spend.
- Если intent-open не растет: тестировать value/trust/decision copy, не direct channels.
- Если intent-open растет, channel click остается низким: Wave49/contact-first становится приоритетным следующим тестом.
- Если channel click есть без реальных диалогов: проверять channel handoff и sales handling, не переделывать hero вслепую.

## Launch boundary

Локальная реализация, QA, commit, push и PR автономны. Candidate может быть implementation-complete, но остается `NOT FOR DEPLOY`. Production publication/merge, Metrika goal creation, paid campaign preparation/edit/launch and Mango changes require a separate owner decision.
