## Результат

Добавлен изолированный CRO-кандидат `/question-first/` для полной прозрачной оклейки за 180 000 ₽.

Свежая доказательная база: Wave45 — 45 кликов / 1 494,42 ₽, расчетный CPC 33,21 ₽; отдельный exact paid funnel — 33 чистых визита, price 33, proof 25, conditions/scroll50 8, scroll90 1, channel clicks 0. `18/33` визитов длились не менее 30 с, `11/33` — не менее 60 с. Query mix преимущественно коммерческий; доля сомнительных запросов заметно ниже stop-сигнала `>30%` нерелевантного расхода. Это делает локализацию разрыва перед первым контактом вероятной, но не доказывает конкретную UX-причину.

Детальная duration-сегментация (медиана 33 с; price-only 9 с; proof 58 с; terms/scroll50 80 с) относится к предыдущему 30-визитному подмножеству и не приписывается трем новым визитам. Свежие пороги `18/33` ≥30 с и `11/33` ≥60 с всё равно подтверждают, что поведение не сводится к мгновенным отказам.

Cross-offer: Wave48 получил два клика по строго релевантным запросам, но обработан пока один clean visit. Он провел 50 с, достиг terms/price/proof/process/warranty/scroll50 и не дал scroll90, contact CTA или hard lead. Это behavioral `N=1`: направленно поддерживает локализацию перед контактом, но не доказывает question-first и не объединяется с Wave45.

Единственная экспериментальная переменная — семантика первого шага: вместо «записаться на консультацию» посетитель может «задать вопрос по автомобилю». Оффер, цена, proof, layout, media и каналы сохранены. Добавлено диагностическое событие `contact_intent_open_question_first_v1`; canonical channel goals сохранены.

Owner-grade red-team уточнил результат первого шага без расширения переменной: администратор «уточнит сроки работ и ближайшие даты». Это же сформулировано в подготовленном сообщении для TG/WA/MAX.

Формулировка «получить расчёт» намеренно не добавлена: цена уже фиксирована, а объект и результат расчёта не определены. Estimate-first остается отдельной будущей гипотезой, чтобы текущий тест сохранял однофакторность и не обещал непроверенное.

## Почему не Wave49

Wave49 одновременно меняет CTA wording, modal step и видимость четырех каналов. Wave50 сначала локализует точку отрыва: `landing → intent open → channel click → hard lead`. Wave49 остается следующим отдельным тестом, если intent появляется, но выбор канала — нет.

## Проверки

- static DOM/asset/copy contract: PASS;
- browser QA 1440/430/390/360: PASS;
- no overflow/broken images/console errors/same-origin network errors: PASS;
- dialog/focus/carousel/gallery/FAQ/tracking: PASS;
- QA isolation: PASS, собственных запросов Метрики 0;
- Wave45/Wave46 message-match + tracking regression: PASS;
- route performance smoke: PASS;
- fresh owner red-team proof `proof/wave50-owner-red-team-20260814-final/`: PASS;
- security/privacy value scan: PASS перед commit.
- текущий evidence-only update не меняет HTML/JS/CSS и не требует нового visual QA; committed owner-grade proof остается действующим.

## Launch boundary

Статус: `PRODUCTION_CANDIDATE_READY / NOT FOR DEPLOY`. Это означает готовые implementation, mobile-first proof, event contract и rollback, но не разрешение на launch.

PR не предназначен для автоматического merge/deploy. Эта ветка не принимает monitoring/stop/continue/edit решения по активным Wave45/46/48 — они остаются в родительской маркетинговой задаче. Все organic/no-ad визиты владельца 14.08 и его тестовый Mango-звонок исключены. Публикация route, live goal mapping, рекламная когорта, бюджеты и Mango требуют отдельного решения владельца. Root production page этим PR не заменяется.

Подробности: `docs/wave50-question-first/QA_AND_OWNER_REVIEW_RU.md`.
