# Wave53 Leather Care — QA и owner review

Статус: LOCAL QA PASS / DRAFT CANDIDATE / NOT FOR DEPLOY.

## Что меняется

Добавляется новый изолированный route /leather-care/ для одного оффера:

> Чистка кожи и кондиционер Koch — 3 500 ₽

Первый шаг сформулирован как «Узнать ближайшее время»; готовое сообщение уже содержит услугу и цену. Страница явно отделяет уход за кожей от полной химчистки, реставрации и ремонта повреждений.

## Почему это диагностично

Изменяемая поведенческая гипотеза — снижение стоимости первого контакта за счёт конкретного вопроса и готового сообщения. Route не доказывает эффект сам по себе: он создаёт чистый baseline wave53 с отдельными UTM/scenario/experiment и событиями.

## Fresh proof

| Viewport | Hero | Full page | Contact dialog |
|---|---|---|---|
| 1440×900 | proof/wave53-leather-care-20260816/desktop-1440-hero.png | desktop-1440-full.png | desktop-1440-contact.png |
| 430×932 | mobile-430-hero.png | mobile-430-full.png | mobile-430-contact.png |
| 390×844 | mobile-390-hero.png | mobile-390-full.png | mobile-390-contact.png |
| 360×800 | mobile-360-hero.png | mobile-360-full.png | mobile-360-contact.png |

All files are fresh captures from 2026-08-16. Raw result: proof/wave53-leather-care-20260816/qa.json.

## Automated evidence

- 4/4 viewports PASS.
- Hero CTA fully inside first viewport: 4/4.
- Horizontal overflow: 0.
- Broken images: 0.
- Console/page errors: 0.
- Same-origin HTTP failures/errors: 0.
- QA Metrika requests: 0.
- QA external requests: 0; map intentionally stays a local placeholder during QA.
- Required view/scroll/contact/channel events missing: 0.
- Non-QA mapping: PASS; intercepted queue contains only counter 110584673 and correct Wave53 attribution.
- FCP/LCP: 0.252–1.008 s in final local run; CLS 0.
- Initial transfer: 314,758 B mobile / 400,250 B desktop.

Accessibility checks: Russian document language, one H1, main/skip-link/dialog labelling, no heading-level skips, no unnamed visible interactive controls, all images have alt, CTA/channel targets meet the mobile 44 px gate, dialog receives focus and works from keyboard.

## Facts versus hypothesis

Facts: one Maps booking and two qualified Avito interior contacts support the service choice; the route is technically measured and mobile-ready.

Hypothesis: the concrete nearest-time first step will increase meaningful contacts. This remains unproven until a clean launched cohort is approved and observed.

## Risks and launch boundary

1. Current hero is a real public brand asset but not verified as Wave53/Koch/OHTAAWA client proof. It is Draft atmosphere only.
2. Asset rights/context owner confirmation is required before production.
3. No truthful exact Koch/process/after set exists; gallery/case proof remains blocked.
4. Local performance does not replace post-deploy production measurement.
5. No route publication, merge, Metrika goal mapping, ad campaign, budget or Mango change is included.

## Recommendation

Review this PR as the single Wave53 candidate. Approve production only after confirming the current hero asset rights/context or replacing it with the owner shot list, then run a separate launch gate for merge/deploy/event goals/paid test.
