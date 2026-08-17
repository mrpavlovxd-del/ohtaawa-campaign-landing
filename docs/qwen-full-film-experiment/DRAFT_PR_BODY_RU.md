# NOT FOR DEPLOY — Qwen full-film landing reinvention

## Что это

Owner-grade кандидат новой основной посадочной OHTAAWA для полной прозрачной оклейки за подтверждённые 180 000 ₽. Qwen 3.7 Max выступил design/architecture/implementation lead; Sol провёл независимый red-team, hardening и финальную верификацию.

Scope ограничен маршрутом `/`. Production, другие routes, рекламные кампании, бюджеты, Mango и настройки Метрики не менялись.

## Экспериментальная логика

- Факт baseline: 33 exact paid-UTM визита Wave45, цена 33/33, proof 25/33, contact CTA 0; owner QA исключён.
- Гипотеза: психологическая стоимость первого обращения после ознакомления с ценой и доказательствами остаётся барьером. Это правдоподобно, но не доказано.
- Кандидат снижает стоимость первого шага через конкретный вопрос о модели автомобиля и выбор канала, сохраняя цену, условия и доказательства.
- Это holistic challenger, а не компонентный A/B-тест; uplift до полевого запуска не заявляется.

## Проверено

- Visual owner-grade gate: `8,8/10`, signature `8,9`, premium craft `8,6`, target translation `0,84` — PASS.
- Browser/interaction QA: `90/90 PASS` на 1440, 430, 390 и 360 px, включая no-JS, reduced motion, реальный Save-Data, keyboard/focus/dialog, overflow, images, runtime/network и CTA tracking.
- Motion proof: `99/99 PASS`; галерея только ручная, бесконечного autoplay нет.
- Performance lab: `70/70 PASS`; mobile median FCP/LCP 1344 мс, initial 315,0 КиБ; desktop FCP/LCP 1448/1492 мс, initial 331,7 КиБ; CLS 0, TBT proxy 0.
- QA isolation: `qa=1`, 0 запросов в Метрику; counter 110584673 сохранён.

## Media boundary

- Новая hero-материя — `generated-illustrative`, `proof:false`; она не выдаётся за клиентскую работу.
- Сохранившиеся реальные proof-assets имеют неполный rights/consent chain и остаются `UNKNOWN_DO_NOT_PUBLISH` для live/public marketing до owner/media gate.
- Слайды с лицом и два неаттестованных derivative-файла исключены из кандидата.

## Запуск

Этот Draft PR не даёт разрешения на merge или deploy. До запуска отдельно нужны:

1. решение владельца по публичному использованию media;
2. решение владельца о merge/deploy;
3. пререгистрация полевого эксперимента и live goal mapping;
4. отдельная оценка рекламного трафика в родительской задаче.

## Локальные проверки

```powershell
npm run qa:qwen
npm run qa:qwen:motion
npm run qa:qwen:performance
```

Полные decision/proof/launch материалы находятся в `docs/qwen-full-film-experiment/`.
