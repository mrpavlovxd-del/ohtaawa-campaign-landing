# Product Studio Run Manifest

- Run ID: `ohtaawa-estimate-audit-20260817-r1`
- Timestamp: 2026-08-17
- Task type: high-intent acquisition microtool / standalone landing route
- Surface: `go.detailingspb.ru/estimate-check/`
- Mode: architecture-first, code-native utility implementation

## Project context and demand

OHTAAWA sells planned, premium and consultative detailing services. Search is a
working control channel and remains unchanged. This route targets a different
moment: the owner already has an estimate for PPF or color film, but cannot
confidently compare scope, preparation, installation and warranty terms.

## Design DNA

- automotive editorial rather than dashboard or generic SaaS;
- graphite, ivory, metal grey and restrained green;
- serif offer language plus highly legible sans-serif facts;
- one real OHTAAWA atmosphere crop, never presented as proof of a specific
  outcome;
- code-native estimate checklist as the signature component;
- no fake urgency, fake independence, competitor criticism or hidden price.

## Architecture tournament

1. Static article explaining how to compare estimates.
2. Long lead form with file upload.
3. Code-native six-point estimate decoder with messenger handoff.
4. Downloadable PDF checklist.

Selected: option 3. It gives immediate value, captures explicit high intent,
does not store a competitor document on the site and produces measurable
interaction before the messenger handoff.

## Pipeline and gates

- Product Studio Kernel: loaded.
- Service Demand Strategy: planned + premium/consultative + comparison-stage.
- Product Excellence: Russian-copy, anti-slop, mobile and self-reject gates.
- Conversion: one primary action, Telegram handoff after useful output.
- Visual Quality: desktop/mobile screenshots, overflow, interaction, keyboard,
  reduced-motion and event-payload QA.
- Visual generation: not needed. The identity-bearing real atmosphere asset and
  code-native utility are more truthful than a generated scene for this tool.
- Library selection: existing static HTML/CSS/JS and Playwright are sufficient;
  no dependency installation.
- Motion: only short CSS state feedback; reduced-motion replacement required.

## Required proof

- desktop and mobile screenshots for hero, checklist and result;
- automated interaction and tracking-payload test;
- static privacy/secret scan;
- asset provenance and HTTPS target check;
- production publication remains a separate reversible release step.

## Self-reject conditions

- visitor cannot understand the offer and next action in ten seconds;
- the page implies legal, technical or independent certification;
- a file or personal data is collected by the site;
- CTA opens without preserving experiment attribution;
- mobile content clips or a sticky control obscures the tool;
- visual resembles a generic card grid or an internal dashboard.

## Approval boundaries

Local implementation, QA, branch commit and PR preparation are autonomous.
Publishing the route to production is allowed only under the owner's current
channel-launch scope after release checks; no paid campaign or subscription is
created by this route.
