# Product Studio Run Manifest: Wave50 Question First

- **Run ID:** `ohtaawa-wave50-question-first-20260814`
- **Timestamp:** `2026-08-14 MSK`
- **Evidence refresh:** `2026-08-15 MSK`, including the 33-visit Wave45 exact cohort and Wave48 two-click/one-processed-visit distinction
- **Task type:** evidence-led CRO audit and controlled paid-landing derivative
- **Surface:** OHTAAWA campaign landings; implementation target is full transparent body protection
- **Mode:** audit-first; current continuation is evidence-only with no UI or production implementation

## Context and truth

- Source of truth: owner brief, parent `LIVE_MARKETING_CHECKPOINT_RU.md`, the 25-row Wave45 search-query report, delegated exact Wave45 UTM/Webvisor slice for 8–14 August, Wave48 first-click query capture plus the delegated two-click/one-processed-session distinction, current production HTML, `origin/main` at `f6d19c6`, Wave49 PR #21 as a candidate reference, campaign/ad copy pack, current OHTAAWA assets and provenance. The latest aggregate is delegation-authoritative; no matching raw 33-row export is stored in this landing repo.
- Delivery: 45 clicks, spend 1,494.42 RUB, calculated average CPC 33.21 RUB. The fresh slice does not provide current impressions, so no updated CTR is claimed here.
- Observed funnel: 33 exact paid visits; price 33, proof 25, offer terms 8, scroll 50% 8, scroll 90% 1, Telegram/WhatsApp/MAX/phone 0.
- Fresh clean-session thresholds: 18/33 at least 30 seconds and 11/33 at least 60 seconds. The earlier 30-visit subset had median 33 seconds, mean 87 seconds (right-skewed), 6/30 at least 120 seconds and 5/30 below 15 seconds; price-only median 9 seconds, proof median 58 seconds, offer-terms and scroll50 medians 80 seconds. Those detailed subset values are not imputed to the three new visits.
- Cross-offer Wave48 observation: two strictly relevant paid clicks, but only one processed non-QA behavioral visit. That visit lasted 50 seconds, reached terms/price/proof/process/warranty/scroll50, and produced no scroll90/contact/hard outcome. It is directional behavioral N=1 evidence only and is never pooled with Wave45/Wave50.
- Fresh queries are dominated by price/cost, full-film, protective-film and Saint Petersburg service intent; the agreed `>30%` irrelevant-spend stop signal is not observed.
- Funnel localization after price/proof/terms and before contact is **likely true**. The narrower claim that UX, offer wording or trust is the cause remains **plausible but unproven**; session segments are observational/self-selected, duration may include idle time, and long-cycle comparison or external handoff remain alternatives.
- Wave48 two-click delivery / behavioral N=1 preserves the chosen experiment but does not increase its causal status: the color-film CTA is already softer than root while still leading to consultation/date commitment.
- “Get an estimate” remains outside the selected variable: with a fixed 180,000 RUB offer, its deliverable is undefined and would add an unverified promise. The smallest diagnostic intervention remains “ask a question about the vehicle.”
- Existing Wave49 screenshots and docs are `reused-reference`, not fresh proof for this run.
- All recent 14 August organic/no-ad visits across the owner's devices and the owner's Mango test call are QA, not demand or hard-lead evidence.
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
