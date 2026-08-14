# Product Studio Run Manifest: Wave50 Question First

- **Run ID:** `ohtaawa-wave50-question-first-20260814`
- **Timestamp:** `2026-08-14 MSK`
- **Evidence refresh:** `2026-08-14`, parent marketing checkpoint and search-query report captured at `2026-08-14T07:56:36Z`
- **Task type:** evidence-led CRO audit and controlled paid-landing derivative
- **Surface:** OHTAAWA campaign landings; implementation target is full transparent body protection
- **Mode:** audit-first, implementation-alpha from the current production benchmark

## Context and truth

- Source of truth: owner brief, parent `LIVE_MARKETING_CHECKPOINT_RU.md`, the fresh 25-row Wave45 search-query report, exact Wave45 UTM/Webvisor slice and clean-session duration segmentation for 8–14 August, current production HTML, `origin/main` at `f6d19c6`, Wave49 PR #21 as a candidate reference, campaign/ad copy pack, current OHTAAWA assets and provenance.
- Delivery: 361 impressions, 42 clicks, CTR 11.63%, spend 1,430.15 RUB, average CPC 34.05 RUB; no confirmed paid hard leads.
- Observed funnel: 30 exact paid visits; price 30, proof 22, offer terms 8, scroll 50% 8, scroll 90% 1, Telegram/WhatsApp/MAX/phone 0.
- Clean-session distribution: median 33 seconds, mean 87 seconds (right-skewed); 16/30 at least 30 seconds, 11/30 at least 60 seconds, 6/30 at least 120 seconds, 5/30 below 15 seconds. Price-only median is 9 seconds; proof median 58 seconds; offer-terms and scroll50 medians 80 seconds.
- Fresh queries are dominated by price/cost, full-film, protective-film and Saint Petersburg service intent; the agreed `>30%` irrelevant-spend stop signal is not observed.
- Funnel localization after price/proof/terms and before contact is **likely true**. The narrower claim that UX, offer wording or trust is the cause remains **plausible but unproven**; session segments are observational/self-selected, duration may include idle time, and long-cycle comparison or external handoff remain alternatives.
- Existing Wave49 screenshots and docs are `reused-reference`, not fresh proof for this run.

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
