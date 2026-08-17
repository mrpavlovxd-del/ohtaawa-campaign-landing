# Qwen 3.7 Max task: independently build a new OHTAAWA website

## Required outcome

Act as the independent design director, information architect and implementation lead. Do not stop at analysis, recommendations, a wireframe or a style guide. Fully build a new working `/` landing page in this workspace for OHTAAWA full transparent protective film at 180,000 RUB. Create your own IA, visual system, typography, responsive layout, code-native custom icons/graphics, purposeful motion and a strong narrative. The owner explicitly wants Qwen's own site, not an adaptation of the current design.

The worktree is isolated and NOT FOR DEPLOY. Do not commit, push, open a PR or touch any live system.

## Read first

Read completely:

- `docs/qwen-full-film-experiment/PRODUCT_STUDIO_RUN_MANIFEST_RU.md`
- `docs/qwen-full-film-experiment/SOURCE_OF_TRUTH_ASCII.md`
- `assets/provenance-wave45.json`

Inspect the logo and media inventory. The current `index.html` and `assets/styles.css` may be inspected only to recover canonical contact URLs, analytics/QA behavior and factual consistency. Do not inherit their layout skeleton, section order, cards, copy rhythm, palette, typography or visual language.

Before implementation:

1. Create four materially different directions. Compare Product, UX/CRO, Technical, Risk, Speed/Cost and Maintainability. Select one yourself and record the board in `docs/qwen-full-film-experiment/QWEN_DESIGN_DECISION_RU.md`.
2. Run a Library Selection Board before adding a dependency. Prefer a minimal local stack. WebGL, GSAP, Rive or Three are allowed only if the signature experience cannot be implemented robustly with a lighter route. Do not use production CDNs.
3. Create a motion purpose map plus reduced-motion/state/interruption contract in `docs/qwen-full-film-experiment/QWEN_MOTION_CONTRACT_RU.md`.

## Creative freedom and ambition

- Make a radical departure from the typical OHTAAWA/Codex architecture. Do not build the standard `hero -> KPI rail -> cards -> process grid -> FAQ -> footer` sequence.
- Bold typography, unusual spatial rhythm, layered composition, scrollytelling without scroll hijacking, kinetic type, responsive masks, video/canvas/procedural backgrounds and a custom icon system are allowed.
- Motion must explain the product: transparent skin, film tension, edge fixation, light inspection and complete protection contour. Do not animate everything just to demonstrate effects.
- Service, 180,000 RUB, 3-5 days and a concrete first action must be visible immediately and must never wait for a loader, video or animation.
- The first step must feel lighter than an abstract consultation: let the visitor ask one short question about their car or request the nearest suitable time, with a prepared truthful message and no invented response SLA.
- The result must feel specifically OHTAAWA, never a generic neon/carbon supercar template.

## Video and media

- There is no verified real background video. Never simulate customer footage or present a generated loop as proof.
- If you create a local loop, it must be abstract or clearly illustrative, with a local poster plus mobile, Save-Data and reduced-motion fallback. Add provenance and mark it `candidate_not_published`.
- If an honest owner-grade video cannot be made with available tools, implement a strong procedural/code-native motion scene instead of weak fake video and record the exact video asset gap.
- Real images in `assets/proof/real/**` may be used as proof with accurate captions. Generated atmosphere assets may be used only as illustration.
- No weak placeholders, fake reviews, fake logo walls or random stock.

## Implement the real source

- Replace `index.html` with your own architecture.
- Create isolated CSS and JS such as `assets/qwen-full-film.css` and `assets/qwen-full-film.js`. Do not edit files inside `/risk-zones/` or `/color-film/`.
- Preserve favicons and OHTAAWA logos.
- Build meaningful code-native custom icons/illustrations with accessible text alternatives. Do not paste a generic line-icon set.
- Preserve canonical public contact links, event names, counter and QA isolation from the verified source.
- Preserve query/UTM parameters on outbound links where the existing analytics implementation does.
- Do not create a fake form or CRM endpoint. Contact actions must lead to real canonical phone/TG/WA/MAX paths through a clear chooser or direct actions.

## Required proof

1. Run a local preview and inspect at least 1440, 430, 390 and 360 widths.
2. Create fresh screenshots under `artifacts/qwen-full-film-qa/`. Old screenshots are not fresh proof.
3. Test horizontal overflow, broken image/video/poster, console errors, failed network, keyboard/focus, skip link, dialog semantics, reduced motion, Save-Data/mobile fallback, CTA URLs, event mapping and QA isolation.
4. Measure initial transfer and media weight plus available Web Vitals/Lighthouse. Targets: LCP <= 2.5 s on a realistic mobile profile, CLS < 0.1 and INP < 200 ms. Do not claim PASS if not measured.
5. Update `docs/qwen-full-film-experiment/FOUND_ISSUES_LEDGER_RU.md` and create `QWEN_QA_REPORT_RU.md` with facts, hypotheses, closed/deferred issues and the launch boundary.
6. Self-red-team. If the result is a generic AI luxury landing, the old page with new CSS, or a motion showreel with weak conversion, reject it and perform one internal revision.

## Hard boundaries

- No commit, push, PR, merge, deploy, DNS or production change.
- Do not open or change ads, budgets, campaigns, Mango, Metrika goals or live UTM.
- No global dependency installation and no Codex/Qwen config changes.
- Never read or print secret values and do not place private URLs/tokens in reports.
- Do not invent anything outside the verified source of truth.
- Do not claim conversion improvement without a clean future experiment.

## Final response

Only after actually building the site, report: selected vision; changed files; executed checks and proof paths; risks/unverified items; why the architecture is genuinely new; owner approvals still required. If the working site was not built, return `INCOMPLETE`, not a conceptual PASS.
