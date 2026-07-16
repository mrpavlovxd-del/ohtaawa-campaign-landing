# Product Studio Run Manifest: wave14 contextual CTA

- Run ID: `ohtaawa-wave14-contextual-cta-20260715`
- Surface: paid-traffic landing `go.detailingspb.ru`
- Mode: evidence-led CRO implementation, no visual redesign
- Branch: `codex/wave14-polish-photo-cta`

## Evidence and intent

Fresh go-only cohort for wave13: 12 clean visits, average time 1:56, two price-section views, one offer-terms view and no messenger/phone CTA. The sample is diagnostic, not conclusive, but it identifies a plausible gap: the price section has no immediate next action.

The change adds a compact contextual contact band directly after prices. Copy changes with the existing scenario engine:

- `used-car`: evaluation of polishing from 2-3 photos;
- `new-car`: protection plan by car model;
- `crm`: simple next step for a returning OHTAAWA client;
- `generic`: select the right detailing route.

## Pipeline and gates

- Product/CRO: message match and minimum-friction next step.
- Premium Russian copy: concrete language, no abstract luxury claims.
- UI arsenal: current static HTML/CSS/JS is sufficient; no new library or dependency.
- Analytics: reuse existing channel goals and add `location=price_context`; no duplicate conversion goal.
- Privacy: no new personal-data collection or storage.
- Visual QA: passed on desktop `1440x1000` and mobile `390x844`; targeted screenshots, overflow, scenario copy, prepared messages and console errors are recorded in `proof/wave14-contextual-cta/QA_REPORT_RU.md`.
- Release: branch/PR only; no live merge while proof is incomplete.

## Asset decision

No new visual asset is required. The change is a conversion control beside existing real prices and proof. Generating another image would add distraction and provenance work without solving the measured gap.

## Approval boundaries

- No production deployment from this run without owner-facing review and release smoke; screenshot QA and regression checks are complete on the branch.
- No advertising-cabinet changes.
- No budget change.
- Existing telephone and messenger destinations remain unchanged.

## Self-reject conditions

- CTA becomes a large promotional card or breaks the approved visual hierarchy.
- Scenario copy does not match the incoming campaign.
- Messenger link loses prepared message or native navigation.
- Mobile buttons overflow or cover content.
- Existing event contract or counter wiring changes unexpectedly.
