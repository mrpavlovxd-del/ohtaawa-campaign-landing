## Wave53 Leather Care — NOT FOR DEPLOY

Новый изолированный route /leather-care/ для оффера «Чистка кожи и кондиционер Koch — 3 500 ₽».

### Что внутри

- отдельные HTML/CSS/JS без film-specific shared logic;
- CTA «Узнать ближайшее время» и готовое сообщение с услугой/ценой;
- явные границы: не полная химчистка, не реставрация, допработы отдельно;
- go-only counter 110584673, Wave53 UTM/scenario/experiment и route-specific goals;
- реальные deterministic hero crops; generated interior исключён;
- screenshots/QA на 1440/430/390/360.

### QA

- 4/4 viewports PASS;
- overflow/broken images/console/page/network errors: 0;
- CTA in first viewport: 4/4;
- QA Metrika requests: 0;
- non-QA intercepted mapping: only counter 110584673, correct Wave53 events/attribution;
- FCP/LCP 0.252–1.008 s, CLS 0, initial transfer 315–400 KB.

### Hard boundary

Draft PR only. No merge/deploy, production route, ads/budgets, Metrika goal mapping or Mango changes.

Production is blocked until the owner confirms rights/context for the current real brand hero or supplies the shot-list replacement. No exact Koch/after proof gallery is included.
