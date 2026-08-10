# Wave48 Visual Target Translation Contract

## Target

- Reference: `assets/generated/wave48-color-film-concept-target.png`.
- Classification: internal `CONCEPT_TARGET`.
- Old product surface: Wave45 root landing in `index.html` and
  `assets/styles.css`.
- Product surface to build: isolated `/color-film/` candidate.

## Extraction

### Layout skeleton

1. Slim near-black brand header.
2. Desktop hero uses a roughly `48/52` editorial split: cool-ivory offer plane
   and full-height automotive image plane.
3. The offer plane contains one eyebrow, one short headline, one fixed-price
   block, one concise inclusion line and one primary CTA.
4. The first proof section is near-black and contains one compact editorial
   introduction plus the `Two perspectives, one finish` stage.
5. Four factual rows use precise vertical rules on desktop and stacked
   horizontal rules on mobile; no pictogram strip.
6. Process, reviews/map, FAQ and contact follow as unframed full-width bands.

### Typography

- Display serif: large but bounded, short lines, no viewport-scaled font size.
- Sans: compact Russian copy with comfortable `1.45-1.6` line height.
- Price is the largest numeric element but does not compete with the headline.
- Letter spacing remains `0`; uppercase is reserved for short metadata.

### Color and material tokens

- `ink`: near-black with a faint cool-green undertone.
- `paper`: cool ivory rather than beige.
- `lime`: restrained OHTAAWA action/highlight color.
- `burgundy`: thin rule, metadata and active gallery state only.
- No CSS gradients, glass panels or shadows used as section containers.

### Signature interaction

- Desktop: dominant real front image plus a visible narrow real rear rail.
- Selecting the rail swaps the dominant view with a short directional fade.
- Mobile: stable single stage with two explicit controls and no overlaps.
- Reduced motion: immediate swap without transform or fade.

## Product adaptations allowed

- Correct Russian production copy replaces all target text.
- Authentic OHTAAWA logo replaces the target placeholder.
- Real front/rear images replace the generated vehicle views.
- The real map/contact pattern may retain proven Wave45 behavior while adopting
  the Wave48 typography and spacing language.
- Additional sections may extend below the target when needed for trust, but
  must preserve the editorial rhythm and avoid card-grid fallback.

## Implementation substrate

- Current static HTML/CSS/JS: sufficient.
- No new component or motion dependency.
- CSS variables, grid, aspect-ratio, object-position, dialog and native buttons
  provide all required primitives.
- Carousel state, focus, analytics and contact routing remain code-native.

## Proof requirements

- Fresh screenshots at `1440x900`, `390x844` and `430x932`.
- No horizontal overflow, clipped text, broken media or fixed CTA obstruction.
- Keyboard/focus and reduced-motion checks.
- Gallery, FAQ, contact dialog, links and analytics-event smoke.
- Screenshot comparison against the target and Wave45.

## Post-implementation verdict

- Target translation score: `0.86`.
- Substrate fit score: `0.93`.
- Estimated Wave45 visual similarity: `0.43` (below the `0.55` ceiling).
- Signature-component fidelity: `0.91` for the dominant-view plus narrow-rail
  proof stage.
- Desktop first-screen CTA visibility: passed at `1440x900` after one internal
  correction cycle.
- Mobile hero, proof stage and contact path: passed at `390x844` and `430x932`.
- No sticky mobile CTA or fixed bottom obstruction is present.
- Owner output is allowed as an isolated candidate only; public release remains
  approval-gated.
