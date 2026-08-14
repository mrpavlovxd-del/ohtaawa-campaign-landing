## Результат

Добавлен изолированный CRO-кандидат `/question-first/` для полной прозрачной оклейки за 180 000 ₽.

Свежая доказательная база: Wave45 — 340 показов / 38 кликов / 1 331,83 ₽, CTR 11,18%, CPC 35,05 ₽; exact paid funnel — 30 визитов, price 30, proof 22, channel clicks 0. 24-строчный query-report преимущественно коммерческий; стоп-сигнал `>30%` нерелевантного расхода не обнаружен. Это делает локализацию разрыва перед первым контактом вероятной, но не доказывает конкретную UX-причину.

Clean-session slice: общая медиана 33 с; price-only 8 — медиана 9 с; proof 22 — 58 с; offer terms и scroll50 по 8 — 80 с; CTA 0. Это усиливает post-proof/contact-barrier гипотезу, но сегменты self-selected и не доказывают причинность.

Единственная экспериментальная переменная — семантика первого шага: вместо «записаться на консультацию» посетитель может «задать вопрос по автомобилю». Оффер, цена, proof, layout, media и каналы сохранены. Добавлено диагностическое событие `contact_intent_open_question_first_v1`; canonical channel goals сохранены.

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
- security/privacy value scan: PASS перед commit.

## Launch boundary

PR не предназначен для автоматического merge/deploy. Live Wave45 не меняется до родительского контрольного порога `60` сопоставимых кликов, `3 000 ₽` или `14 дней`, если не возникнет системный stop condition. Публикация route, live goal mapping, рекламная когорта, бюджеты и Mango требуют отдельного решения владельца. Root production page этим PR не заменяется.

Подробности: `docs/wave50-question-first/QA_AND_OWNER_REVIEW_RU.md`.
