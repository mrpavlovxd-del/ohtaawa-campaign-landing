# Product Studio Run Manifest: Wave27

- Run ID: `ohtaawa-wave27-after-price-cta-2026-07-23`
- Surface: paid-search landing page `go.detailingspb.ru`
- Source: `origin/main` at `f4802858`, isolated branch
  `codex/wave27-after-price-cta`
- Mode: conversion architecture refinement in the approved v9 visual system
- Production status: local candidate only; no deploy and no live campaign edit

## Evidence And Hypothesis

Clean go-only Metrika data for the current Wave22 search experiment shows:

- 6 candidate-human visits;
- 5 price views;
- 4 offer-term views;
- 1 clean proof view;
- 0 contact CTA events;
- 0 qualified leads.

The working hypothesis is plausible but not yet proven: people understand the
price range, but the page does not offer a sufficiently immediate and
low-commitment next step at that decision point. The existing photo-estimate
section remains useful and uses real owner-provided before/after proof, but it
appears before the price section and its CTA is no longer visible once the
visitor reaches the price.

## Project Design DNA

- premium auto care without theatrical luxury language;
- calm expert assessment before promising a result;
- real OHTAAWA proof for factual claims;
- clear service economics before contact;
- one low-friction next action;
- restrained dark/ivory/green visual language already approved for v9.

Anti-DNA:

- generic lead form;
- fake urgency or discount countdown;
- generated imagery presented as completed work;
- a large card grid;
- more messenger choices than the visitor needs;
- service or tracking jargon in customer-facing copy.

## Decision Board

| Option | Conversion value | UX | Risk | Speed | Decision |
|---|---:|---:|---:|---:|---|
| Keep the page unchanged | Low | Stable | Misses current signal | Fast | Reject |
| Compact after-price photo-estimate CTA | High | Clear | Low | Fast | **Selected** |
| Add an inline phone form | Medium | More friction | Privacy and form-processing work | Medium | Defer |
| Add modal/chat overlay | Unclear | Intrusive | Premium-brand and mobile risk | Medium | Reject |

## Implementation Arsenal

The current static HTML/CSS/JS stack is sufficient. No library or dependency is
required. Reuse:

- existing Telegram and phone lead goal IDs;
- existing `data-ohtaawa-location` attribution with new value `after_price`;
- owner-provided real image `assets/polish-real-before-after-v9.webp`;
- existing message-copy helper and Metrika event bridge.

## Planned Change

Directly after the price section, add a compact decision bridge:

- question: what is appropriate for this particular body;
- promise: preliminary recommendation and price orientation from 2-3 photos;
- primary action: send photos in Telegram;
- secondary action: call a specialist;
- no repeated image: the real before/after proof remains in the preceding
  photo-estimate section;
- no new offer, discount, form, counter, or analytics goal.

## Hard Gates

- no production deploy or `main` merge in this run;
- no edits to active ad URLs or campaigns;
- no generated asset may be presented as real proof;
- all contact links must retain the established phone/chat destinations;
- desktop and mobile must have no horizontal overflow or clipped copy;
- CTA events must retain existing goal IDs and expose location `after_price`;
- the existing Wave22 experiment must remain activatable only through its
  explicit `experiment_id`.

## Proof Pack

- static contract test;
- Playwright desktop at 1440 x 1000;
- Playwright mobile at 390 x 844;
- screenshots of the price-to-contact transition;
- click-event and destination verification;
- image-load, console, page-error and overflow checks;
- privacy guard before any remote handoff.

## Self-Reject Conditions

Reject the candidate if:

- it repeats the full hero contact panel;
- it repeats the same real proof image a second time;
- it makes the page feel cheaper or more promotional;
- Telegram is not clearly the primary low-friction action;
- the real proof thumbnail is cropped beyond recognition;
- the module pushes the next section away with excessive vertical space;
- event attribution cannot distinguish `after_price`;
- the mobile layout requires horizontal scrolling.
