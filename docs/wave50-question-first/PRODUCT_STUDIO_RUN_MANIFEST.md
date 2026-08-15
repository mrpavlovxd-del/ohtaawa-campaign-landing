# Product Studio Run Manifest: Wave50 Question First

- **Run ID:** `ohtaawa-wave50-question-first-20260814`
- **Timestamp:** `2026-08-14 MSK`
- **Evidence refresh:** `2026-08-15 MSK`, canonical parent checkpoint with Wave45 `400/45/1,494.42 RUB`, unchanged 33-visit exact cohort, Wave46 delivery `74/3` with behavioral `N=2`, Wave48 delivery `22/2` with behavioral `N=1`, Mango `0`, production desktop/mobile smoke, and the 08:41 owner-QA attribution correction
- **Task type:** evidence-led CRO audit and controlled paid-landing derivative
- **Surface:** OHTAAWA campaign landings; implementation target is full transparent body protection
- **Mode:** audit-first; isolated candidate implementation and fresh validation, with no production/public mutation

## Context and truth

- Source of truth: owner brief, canonical parent `docs/ohtaawa-retargeting/agent-work/2026-08-15/LIVE_MARKETING_CHECKPOINT_RU.md`, the 25-row Wave45 search-query report, delegated exact Wave45 UTM/Webvisor slice for 8–15 August, Wave46/48 exact-session summaries, current production HTML, `origin/main` at `f6d19c6`, Wave49 PR #21 as a candidate reference, campaign/ad copy pack, current OHTAAWA assets and provenance. The latest aggregate is delegation-authoritative; no matching raw 33-row export is stored in this landing repo.
- Delivery: 400 impressions, 45 clicks, spend 1,494.42 RUB, calculated average CPC 33.21 RUB. No new exact Wave45 visit appeared after 14 August; delivery clicks and the exact 33-visit denominator remain separate facts.
- Observed funnel: 33 exact paid visits; price 33, proof 25, offer terms 8, scroll 50% 8, scroll 90% 1, Telegram/WhatsApp/MAX/phone 0.
- Fresh clean-session thresholds: 18/33 at least 30 seconds and 11/33 at least 60 seconds. The earlier 30-visit subset had median 33 seconds, mean 87 seconds (right-skewed), 6/30 at least 120 seconds and 5/30 below 15 seconds; price-only median 9 seconds, proof median 58 seconds, offer-terms and scroll50 medians 80 seconds. Those detailed subset values are not imputed to the three new visits.
- Cross-offer Wave48 observation: two strictly relevant paid clicks, but only one processed non-QA behavioral visit. That visit lasted 50 seconds, reached terms/price/proof/process/warranty/scroll50, and produced no scroll90/contact/hard outcome. It is directional behavioral N=1 evidence only and is never pooled with Wave45/Wave50.
- Cross-offer Wave46 observation: 74 impressions, 3 clicks and 122.37 RUB; only two exact visits are processed, lasting 18 and 23 seconds. Both reached price, neither reached proof or a contact CTA. This is descriptive `N=2`, not evidence for the Wave45 post-proof barrier and not a reason to alter Wave50.
- Mango produced zero new calls on 15 August after owner QA exclusion. This preserves the no-hard-lead checkpoint but does not identify the failing landing stage.
- Production counterfact: parent proof at `docs/ohtaawa-retargeting/agent-work/2026-08-15/production-mobile-smoke/` shows 3/3 routes HTTPS 200, desktop and 390×844 screenshots, zero broken images/layout issues, visible heroes, seven contact links per route, and no missing route event/target/UTM. QA markers prevented test-goal pollution. Persistent page-level breakage is therefore unlikely as the primary explanation; external handoff and intermittent/client-specific failures remain untested.
- Fresh queries are dominated by price/cost, full-film, protective-film and Saint Petersburg service intent; the agreed `>30%` irrelevant-spend stop signal is not observed.
- Funnel localization after price/proof/terms and before contact is **likely true**. The narrower claim that UX, offer wording or trust is the cause remains **plausible but unproven**; session segments are observational/self-selected, duration may include idle time, and long-cycle comparison or external handoff remain alternatives.
- Wave48 two-click delivery / behavioral N=1 preserves the chosen experiment but does not increase its causal status: the color-film CTA is already softer than root while still leading to consultation/date commitment.
- “Get an estimate” remains outside the selected variable: with a fixed 180,000 RUB offer, its deliverable is undefined and would add an unverified promise. The smallest diagnostic intervention remains “ask a question about the vehicle.”
- Existing Wave49 screenshots and docs are `reused-reference`, not fresh proof for this run.
- Owner correction at 15 August 08:41 MSK: the entire untagged organic/no-ad aggregate from multiple owner devices in the preceding couple of hours and the technical Mango call are one known-QA exclusion. No visit count is guessed. This batch is excluded from demand, lead and site-quality conclusions; paid exact-UTM cohorts remain valid separately.
- Scope ownership: this run owns CRO diagnosis and the landing candidate only. Live Wave45/46/48 monitoring and campaign decisions remain in the parent marketing task.

## Pipeline

- Product Studio Kernel bootloader, routing enforcer and run-manifest director.
- Conversion Landing Page Director and Paid Campaign Landing Director.
- Product Excellence Director, Russian Copy and Microcopy Polish, Mobile-First Polish Gate.
- Project Design DNA and layout/hypothesis tournament.
- Browser Visual QA Loop, accessibility/performance smoke and proof pack.
- Release/launch readiness stops before production merge, deploy, analytics-cabinet mutation or paid action.

## Design DNA binding

- Preserve the approved OHTAAWA campaign-object system: cinematic real-space hero, graphite/ivory/restrained green, editorial typography, fixed price, trust rail, real proof carousel and practical service facts.
- Signature component retained: full-film hero + trust rail + real proof sequence.
- Experimental component: one consistent question-first CTA semantic, not a new visual widget.
- Anti-DNA: generic card grid, messenger widget look, fake scarcity, added lifestyle CGI, generated-as-real proof, four equal primary actions in the first mobile viewport.

## Visual generation and media decision

`NOT_NEEDED_FOR_THIS_CONTROLLED_TEST`.

The current approved hero, brand system and real proof are sufficient. New generation or media selection would add a second experimental variable. No new media will be produced; existing generated atmosphere remains illustrative and existing real proof remains unchanged under its current provenance.

## UI Implementation Arsenal / Library Selection Gate

| Option | Product | UX | Technical | Risk | Speed/cost | Maintainability | Verdict |
|---|---:|---:|---:|---:|---:|---:|---|
| Existing semantic HTML/CSS/JS | 5 | 5 | 5 | 5 | 5 | 5 | **Selected** |
| Add a small component library | 2 | 3 | 2 | 2 | 2 | 2 | Reject: dependency and visual drift |
| React rebuild of the contact path | 2 | 3 | 2 | 1 | 1 | 3 | Reject: substrate migration is not the experiment |
| Third-party messenger widget | 2 | 2 | 2 | 1 | 2 | 1 | Reject: privacy, payload and attribution risk |

The current substrate supports the copy-only derivative, dialogs, keyboard/focus behavior, route isolation, event payloads and screenshot QA. No dependency installation is justified.

## Chosen experiment

- Add isolated route `/question-first/` from `origin/main`.
- Keep offer, price, hero, proof, package, timing, guarantee, address, media, layout and contact channels unchanged.
- Change only the meaning of the first step from booking a consultation to asking a question about the visitor's car.
- Keep that meaning consistent in the hero trust note: the question comes first; consultation and its unchanged free wash/duration are conditional later-stage facts.
- Add a dedicated intent-open event while retaining the existing contact-sheet and canonical channel events.
- Do not expose four direct channels in the first viewport; Wave49 remains the next distinct hypothesis, not mixed into Wave50.

## Required artifacts

- CRO audit and Decision Evaluation Board.
- Experiment contract and analytics event map.
- Separate found-issues ledger.
- Fresh screenshots: 1440, 430, 390 and 360 px.
- Interaction/tracking/QA-isolation smoke.
- Console/network, broken-image and horizontal-overflow checks.
- Accessibility and tap-target smoke.
- Web Vitals/resource-weight evidence.
- Security/privacy scan, diff review, rollback and owner approval pack.

Completion evidence is indexed in `PRODUCT_EXCELLENCE_PROOF_PACK_20260815_RU.md`; the final browser run is `proof/wave50-owner-validation-20260815-final/qa.json`.

## Self-reject conditions

- Any offer, price, proof, package, timing, guarantee or media change.
- Any direct-contact panel or sticky CTA added to the first viewport.
- Any new claim about response time, availability, vehicle eligibility or scarcity.
- The main CTA is not visible at all required mobile widths.
- Missing dedicated intent event, canonical contact goals or QA isolation.
- Horizontal overflow, clipped copy/action, broken images, console/page errors or material weight regression.
- Candidate cannot be distinguished cleanly from Wave45 by route/experiment ID.

## Approval boundaries

Autonomous: isolated worktree, branch, local implementation, tests, screenshots, commit, push and PR.

Blocked without owner approval: production merge/deploy, publication of the route, Metrika goal creation/editing, advertising-cabinet changes, budget/spend, Mango changes, campaign launch or mixing cohorts.

Readiness label: `PRODUCTION_CANDIDATE_READY / NOT FOR DEPLOY`. Candidate readiness means source, QA, proof and rollback are prepared; launch readiness additionally requires owner approval, production deployment choice, live goal mapping and a clean paid-cohort plan.
