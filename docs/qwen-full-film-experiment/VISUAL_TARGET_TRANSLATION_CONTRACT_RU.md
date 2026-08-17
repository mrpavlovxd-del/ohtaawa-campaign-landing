# Visual Target Translation Contract — Qwen «Натяжение» v2

Статус: v2.2 FAIL (около 0,55–0,60); v2.3 independent revalidation pending.

## Targets

- Desktop: `artifacts/qwen-full-film-concept-targets/desktop-tension-target-v2.png`.
- Mobile: `artifacts/qwen-full-film-concept-targets/mobile-tension-target-v2.png`.
- Classification: internal generated illustrative concept; never proof or production raster UI.

## Что переводится в продукт

- Асимметричная first-screen композиция: содержательная левая колонка + крупное signature поле справа.
- Тёплый mineral background, graphite hierarchy, restrained amber inspection light.
- Price as a primary editorial fact, not a KPI card.
- Короткий car-model first step с честным объяснением результата по каждому каналу.
- `Tension Field`: тонкий прозрачный слой повторяет абстрактный контур кузовной панели; свет показывает поверхность и кромку.
- Визуальная линия поля продолжает страницу и заменяет ощущение набора независимых секций.

## Что не переводится буквально

- Английский/generated текст, raster controls, неточные шрифтовые формы и любые image-model артефакты.
- Изображение target не подключается к странице и не становится proof.
- Нет металлических крепежей, имитации реального способа монтажа, fake car/workshop/video.

## Production format

- HTML/CSS/SVG/canvas, доступные controls и текст — code-native.
- Static fallback — code-native SVG/CSS state.
- Motion: CSS/WAAPI или requestAnimationFrame только для одного Tension Field; interruptible, visibility-aware, Save-Data/reduced-motion safe.
- Реальные proof images остаются отдельными и явно подписанными.

## Responsive map

- `>= 1100`: поле занимает примерно 42–48% hero и видно без взаимодействия.
- `768–1099`: поле становится спокойным side layer, не перекрывает цену/CTA.
- `<= 430`: компактная дуга/контур присутствует в первом viewport; service, price и action приоритетнее; никакого horizontal drag.
- `prefers-reduced-motion` / Save-Data / no-JS: статичное полноценное состояние.

## Motion purpose

- Pointer/scroll управляет только направленным светом и небольшой деформацией слоя, чтобы объяснить поверхность.
- CTA не двигается и не ждёт animation.
- Никакого scroll-jacking, loader, custom cursor и reveal-everything.

## Acceptance

- Target translation score `>= 0.72`; substrate fit `>= 0.75`; similarity с baseline `<= 0.55`.
- Overall owner-grade `>= 8.8`; signature identity `>= 8`; premium craft `>= 8.2`.
- Signature component отчётливо виден в 1440 и 390 hero screenshots.
- Ни один fact/control не зависит от движения.
- Normal, reduced-motion, Save-Data и no-JS states доказаны fresh screenshots/tests.
- В первом mobile viewport читаются услуга, `180 000 ₽` и реальное действие.
