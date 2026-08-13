# Wave46 mobile hero hotfix

## Scope

- Surface: published risk-zones landing page.
- Defect: on narrow mobile viewports the hero asset was technically loaded, but
  the upper portion of the source image and the dark overlay made the first
  screen appear as if the hero had not loaded.
- Owner boundary: keep advertising active; do not change campaign, UTM,
  counter, offer, contact paths or desktop composition.

## Product Studio route

- Run id: `wave46-mobile-hero-hotfix-20260813`.
- Mode: production defect hotfix, current static HTML/CSS/JS stack.
- Asset decision: reuse the approved existing mobile image; no generation or
  source-media edit is needed.
- Library decision: current stack is sufficient; no dependencies installed.
- Mobile primary action: see the offer, price and consultation CTA while the
  service image is visibly present in the first screen.

## Changes

- Lift and enlarge the mobile hero image so the vehicle enters the first screen.
- Reduce the excessive mobile overlay while preserving text contrast.
- Add explicit WebP source type, high fetch priority and cache-busting version.
- Extend visual QA to verify the selected mobile source, decoded dimensions and
  mobile crop instead of accepting any technically complete image.
- Scope the tracking QA network assertion to the main landing frame so the
  embedded Yandex Map telemetry is not misclassified as landing telemetry.

## Proof plan

- Visual and interaction QA at 1440x900, 430x932 and 390x844.
- Assert zero broken images, no horizontal overflow, no bottom obstruction and
  successful contact/gallery/carousel/FAQ interactions.
- Assert the mobile `currentSrc` selects `hero-mobile.webp`, natural dimensions
  are non-zero, and the intended crop is applied.
- Run Wave46 tracking and message-match regressions.
- After deploy: HTTPS 200, counter `110584673`, live mobile screenshot and
  decoded hero check.

## Rollback

Revert the hotfix commit. The change is isolated to the Wave46 page, its CSS and
QA scripts; no advertising or analytics configuration is changed.
