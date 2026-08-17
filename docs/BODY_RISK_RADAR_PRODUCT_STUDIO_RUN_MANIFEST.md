# Product Studio Run Manifest

- Run ID: `ohtaawa-body-risk-radar-20260817-r1`
- Timestamp: 2026-08-17
- Task type: owned-utility acquisition microchannel / standalone landing route
- Surface: `go.detailingspb.ru/body-radar/`
- Mode: architecture-first, release candidate, static code-native utility

## Project context

OHTAAWA already has three active Search cohorts. They remain unchanged control
channels. This route does not advertise another service keyword. It offers an
opt-in utility: rare, manually verified signals about weather and road events
that may justify checking the vehicle body.

The supporting shadow collector uses official MCHS and SPb transport sources.
Its first clean run found five events and sent two road-surface events to human
review, but published nothing because road repair alone does not prove a paint
damage risk.

## Design DNA

- OHTAAWA automotive editorial system: black, graphite, ivory, metal grey and
  restrained green;
- Palatino/Georgia display typography and highly legible sans-serif facts;
- real OHTAAWA atmosphere crop used only as context, never as outcome proof;
- a code-native `source -> review -> signal` rail is the signature component;
- transparent source and accuracy language instead of fear or fake urgency;
- no dashboard chrome, generic card grid, weather-app imitation or daily feed.

## Architecture tournament

| Option | Product value | Risk | Decision |
|---|---|---|---|
| Add a banner to an existing paid landing | fast | mixes cohorts and harms attribution | reject |
| New Telegram bot immediately | strong subscription UX | account setup and unproven signal precision | defer |
| Standalone opt-in page linked to the existing channel | reversible, measurable, no PII | channel join is a soft signal | select |
| Automatic public alerts from the shadow script | looks active | factual and reputation risk | reject |

## Library Selection Preflight

1. Existing static HTML/CSS/JS: exact fit, zero new runtime dependencies.
2. Astro: good static composition, unnecessary migration for one route.
3. Vite + React: excessive bundle and component overhead.
4. Next.js: deployment and server complexity with no product benefit.

Selected: existing static HTML/CSS/JS. Playwright remains the QA route. No
libraries or dependencies are installed.

## Pipeline and gates

- Product Studio Kernel: loaded.
- Product Excellence: utility truth, Russian copy, mobile and anti-slop gates.
- Conversion: one primary subscription CTA; one secondary consultation CTA.
- Visual generation: not needed. Existing approved brand assets and one real
  atmosphere crop close the visual gap more truthfully than a generated weather
  scene.
- Real media: reuse only the already reviewed `real-gloss-panel.webp`; no new
  client, plate, face or before/after claims.
- Motion: CSS state feedback only, with reduced-motion replacement.
- Release: route-specific tests, desktop/mobile screenshots, privacy/secret
  scan, rollback by reverting one branch commit.

## Self-reject conditions

- the page reads like a weather forecast or alarmist advertising;
- it implies every road repair damages paint;
- subscription and inspection have equal visual priority;
- a phone, email, vehicle identifier or route is collected;
- CTA clicks lack route/scenario/experiment attribution;
- mobile controls obscure content or the signal rail clips;
- the route changes current paid landing behavior.

## Approval boundaries

Branch implementation, QA, commit and PR preparation are autonomous. The
owner's existing instruction authorizes safe new-channel launches, but this
route must not create paid spend, a Telegram account/bot, a subscription or any
automatic public alert. Production merge remains reversible and requires all
release checks to pass.
