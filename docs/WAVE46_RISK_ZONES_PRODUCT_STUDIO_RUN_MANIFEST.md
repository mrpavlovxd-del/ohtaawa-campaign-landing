# Product Studio Run Manifest: Wave46 Risk Zones

- Run ID: `ohtaawa-wave46-risk-zones-2026-08-08`.
- Surface: standalone paid-search landing at `/risk-zones/`.
- Task type: service-specific conversion landing for local premium automotive protection.
- Source of truth: approved Wave45 production page, owner-approved fixed price `60 000 RUB`, OHTAAWA public contacts, Yandex Maps card, and counter `110584673`.
- Demand class: planned + premium/consultative + new-car life-event-led.
- Primary conversion: a meaningful Telegram, WhatsApp, MAX, or phone contact about risk-zone protection.
- Secondary signals: package view, proof interaction, reviews/maps click, 50/90 percent scroll.
- Mode: architecture-first with one generated atmospheric hero and code-native responsive implementation.

## Decision Evaluation Board

1. Clone Wave45 section-for-section. Fast, but too long and weakly specific to the smaller package.
2. Build a shorter editorial "front line protection" page in the approved OHTAAWA visual system. Best balance of message match, speed, trust, and maintainability. Selected.
3. Build an interactive car-zone diagram. Visually tempting, but high risk of schematic-looking output, mobile friction, and owner-rejected diagram aesthetics.

## Pipeline and gates

- Product Studio Kernel: active.
- Paid Campaign Landing Director: active.
- Product Excellence / Anti-Slop / Russian copy polish: required.
- Visual generation: built-in `image_gen` for one atmospheric hero only; it is not factual proof.
- Real proof: only existing approved/provenanced OHTAAWA media.
- UI arsenal: current static HTML/CSS/JS is sufficient; no new dependencies.
- Motion: existing reveal and carousel behavior only; reduced-motion support remains mandatory.
- Analytics: same go-only counter `110584673`, separate route, offer, scenario, experiment, and event names.
- Visual proof: desktop `1440x900`, mobile `390x844` and `430x932`.
- Launch boundary: page and campaign remain non-production until QA and owner approval.

## Self-reject conditions

- The page looks like a generic clone with only the price changed.
- The first screen does not explain "zones of risk" within ten seconds.
- A generated image is used as client-work proof.
- Exact package composition is invented or over-promised.
- Mobile CTA obscures content or browser controls.
- Analytics cannot distinguish Wave46 from Wave45.

## Proof pack

- design direction and reference DNA;
- asset/provenance manifest;
- event map and message-match fixtures;
- desktop/mobile screenshots;
- visual, CTA, tracking, accessibility, and console QA;
- launch blocker list and rollback path.
