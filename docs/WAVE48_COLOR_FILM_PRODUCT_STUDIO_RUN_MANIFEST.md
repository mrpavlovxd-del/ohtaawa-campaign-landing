# Product Studio Run Manifest: Wave48 Color Film

- Run ID: `ohtaawa-wave48-color-film-2026-08-09`.
- Surface: isolated paid-traffic landing candidate at `/color-film/`.
- Task type: service-specific conversion landing for full-body color protective film.
- Source of truth: owner-approved fixed price `230 000 RUB`, approved Wave45 conversion mechanics, real OHTAAWA color-film photographs, public OHTAAWA contacts and map, and go-only counter `110584673`.
- Primary conversion: a meaningful messenger dialog or call about full color-film wrapping.
- Secondary signals: price, proof, process and warranty views; gallery interaction; 50/90 percent scroll; reviews and route clicks.
- Mode: architecture-first, followed by one render-first visual target and code-native responsive implementation.

## Product context

- Full color-film wrapping is a separate intent from transparent protective film and must not share a landing route or campaign cohort.
- The fixed offer is `230 000 RUB`; the page must not say `from`.
- The service covers the painted body elements. The administrator confirms the exact scope before work without loading the first screen with exceptions.
- Expected duration is `3-5 calendar days`.
- Warranty is `5 years` for material and installation; detailed terms are confirmed by the administrator.
- A detailing body wash during consultation is free and has no subsequent-booking condition on the page.
- Taxi to the customer's destination and back is included for a full wrap.
- Information is not a public offer.

## Decision Evaluation Board

1. **Wave45 clone with a burgundy accent.** Fast and consistent, but too close to the transparent-film cohort and weak at explaining the emotional reason for a color change.
2. **Editorial dual-perspective case.** Lead with a controlled studio atmosphere, then use the real OHTAAWA front/rear photographs as factual proof. Strong product truth, clear fixed offer, and maintainable code. **Selected.**
3. **Color-swatch configurator.** Interactive, but would imply inventory and color accuracy that have not been confirmed. Rejected for factual-risk reasons.
4. **Before/after split reveal.** Visually strong, but the available pair is not a verified before/after of the same view. Rejected as misleading proof.

## Pipeline and gates

- Product Studio Kernel: active.
- Paid Campaign Landing / Conversion Landing Directors: active.
- Design Intelligence: distinct architecture and style-genome check against Wave45/Wave46 required.
- Visual generation: built-in `image_gen` for one atmospheric hero or light/material layer only; generated media cannot act as customer-work proof.
- Real-media route: immutable owner-provided front/rear photographs remain factual proof; crops and deterministic tonal correction are permitted with provenance.
- UI arsenal: current static HTML/CSS/JS is sufficient; no dependencies or motion runtime required.
- Motion: purposeful gallery transitions and reveal states only, with reduced-motion replacement.
- Analytics: separate route, offer, scenario, experiment and event identifiers on counter `110584673`.
- Proof viewports: desktop `1440x900`, mobile `390x844`, mobile-wide `430x932`.
- Launch boundary: no public route or paid campaign before owner review, live tracking smoke and explicit launch decision.

## Self-reject conditions

- The page looks like Wave45 with only the image and price changed.
- Color-film intent is not clear in ten seconds.
- Generated media is presented as completed OHTAAWA work.
- The page invents film brands, stocked colors, exact material specifications or a before/after result.
- Price, duration, warranty or taxi conditions drift from the approved facts.
- Mobile crop weakens the actual color finish or a fixed bar covers content.
- Analytics cannot isolate Wave48 from Wave45, Wave46 or QA traffic.

## Proof pack

- campaign landing contract and offer matrix;
- Design DNA, architecture comparison and visual target;
- asset gap/provenance manifest and approved real-media crops;
- analytics event map and message-match fixtures;
- desktop/mobile screenshots and interaction QA;
- accessibility, console, tracking and launch-readiness reports;
- rollback and no-launch boundary.
