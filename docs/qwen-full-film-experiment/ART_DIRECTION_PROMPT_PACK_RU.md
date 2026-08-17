# Product Art Direction Prompt Pack — Qwen «Натяжение», refinement target

## Роль target

Внутренний `CONCEPT_TARGET`, не production screenshot, не реальная работа OHTAAWA и не доказательство результата. Target нужен Qwen как визуальная планка для второй реализации.

## Контекст

- Premium detailing landing для полной прозрачной защитной оклейки окрашенных элементов кузова.
- Факты, которые код восстановит точно: 180 000 ₽, 3–5 дней, 5 лет гарантии, короткий вопрос о марке/модели.
- Выбранная Qwen-метафора: натяжение прозрачной плёнки и направленный контрольный свет.
- Текущий pass: тёплый off-white editorial, amber accent, но справа пусто и signature sweep практически невидим.
- Signature component: крупное интерактивное `Tension Field` — абстрактный контур кузовной поверхности и полупрозрачная мембрана, которая визуально натягивается через края и отвечает на свет/курсор/scroll. Это объяснение материала, не CGI-автомобиль и не proof.

## Desktop prompt

Use case: ui-mockup
Asset type: internal desktop landing-page concept target, 1440 x 1000
Primary request: refine Qwen's warm editorial OHTAAWA "Tension" landing into an owner-grade premium automotive protection experience with a radically visible product-specific signature component.
Scene/backdrop: warm mineral off-white page, graphite typography, restrained amber directed-light accent, precise editorial grid.
Subject: left side contains a concise Russian-style offer hierarchy with service, fixed price and a short car-model contact step; right side is dominated by a bespoke abstract Tension Field showing a transparent protective membrane stretched over a sculpted body-panel contour, with edge anchors and a moving inspection-light band.
Style/medium: high-fidelity website art-direction mockup; premium material laboratory meets automotive atelier; understated, spatial, tactile, not a dark luxury template.
Composition/framing: first viewport only; bold asymmetry; immediate price and action; signature field occupies roughly 45 percent of desktop and visually connects into the next chapter; no empty dead half.
Lighting/mood: quiet directed studio light, pearl refraction, exact surface tension, confident and calm.
Materials/textures: translucent polyurethane membrane, satin mineral paper, graphite ink, subtle metal edge anchors.
Text: keep labels minimal and short; exact production Russian text will be rebuilt in code. Show only OHTAAWA, "180 000", "3-5", "5", and a short car field as legible anchors.
Constraints: controls remain code-native in production; do not render a real customer, employee, workshop, plate, testimonial, certificate, logo wall or before/after. The membrane is explanatory illustration, never real proof. No external brand marks except OHTAAWA.
Avoid: generic supercar hero, neon, carbon fiber, HUD scanner, glassmorphism cards, conventional KPI rail, numbered process-card grid, huge blank area, tiny low-contrast text, fake video frame, UI illegibility, watermark.

## Mobile prompt

Use case: ui-mockup
Asset type: internal mobile landing-page concept target, 390 x 844
Primary request: translate the same Qwen "Tension" concept to mobile without squeezing desktop.
Composition/framing: service, 180 000 price and one short car/contact action fit before the first scroll; a compact static Tension Field arcs behind/below the action and points into the next chapter; no horizontal drag required.
Constraints: 44 px controls, strong focus-safe hierarchy, readable Russian-style typography, static/reduced-motion equivalent, no video dependency, no proof claim.
Avoid: clipped title, header crowding, tiny channel buttons, carousel peeking, sticky bar covering content, decorative field obscuring price/action.

## Execution record — generated material layer v1

- Prompt record ID: `qwen-tension-material-prompt-v1`.
- Route: built-in `image_gen`; внешний API key и paid API route не использовались.
- Art-direction parents: `qwen-tension-desktop-v2`, `qwen-tension-mobile-v2` из `GENERATED_ASSET_MANIFEST.json`.
- Raw prompt: `UNKNOWN_NOT_RECORDED_VERBATIM`. Следующий текст — безопасная нормализованная запись intent, а не выдуманная дословная копия вызова.
- Sanitized prompt intent: создать самостоятельный material-only hero layer на тёплом mineral фоне — прозрачная защитная мембрана над абстрактной геометрией кузовной панели, один направленный inspection-light band, спокойная светлая композиция с полезным negative space для code-native offer. Без реального автомобиля или клиента, людей, помещения, логотипа, текста, номера, сертификата, before/after, UI controls и утверждения о результате.
- Source asset ID: `qwen-tension-material-source-v1`.
- Source file: `artifacts/qwen-full-film-generated-assets/qwen-tension-material-source.png`.
- Source SHA256: `84707A492F4A6C9546B52A20498371DE915BE05877C52BF3EE959A0F393438D1`.
- Classification: `generated-illustrative`, `proof:false`, material/decorative hero layer only.
- Local review: в source и двух derivatives не обнаружены реальные люди, логотипы, читаемый текст, private identifiers или client/result claim; EXIF/XMP/ICC/text/GPS metadata не обнаружены.
- Publishability: `candidate_not_published_owner_gate`; public use остаётся `BLOCK_PUBLIC_USE_PENDING_OWNER_APPROVAL`.
- Production boundary: исходный PNG не подключается к runtime; разрешённые candidate references — только детерминированные desktop/mobile WebP внутри декоративного `aria-hidden` hero container. Интерактивный текст, CTA и semantics остаются code-native.
