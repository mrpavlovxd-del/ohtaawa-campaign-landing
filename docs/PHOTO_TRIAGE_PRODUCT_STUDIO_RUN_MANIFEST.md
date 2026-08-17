# Product Studio Run Manifest: Photo Triage

- Run ID: `PHT_W34_20260817`.
- Surface: isolated owned-utility route `/photo-check/`.
- Task type: conversion utility for urgent/problem-led and consultative demand.
- Primary outcome: a voluntary Telegram dialogue about a concrete body defect.
- Secondary outcome: an in-person inspection when photographs are insufficient.

## Context

- Active Yandex Search cohorts remain unchanged controls.
- Existing design DNA: OHTAAWA wordmark, dark studio atmosphere, ivory editorial
  sections, lime action color, large serif headings and code-native controls.
- Reference surfaces: `/body-radar/`, `/estimate-check/`, the three live service
  landings and their mobile QA findings.
- Demand anxiety: uncertainty about what a mark is, fear of paying for the wrong
  procedure, risk of making the surface worse and reluctance to visit before the
  problem is understood.

## Decision Board

| Substrate | Product | Speed | Risk | Maintainability | Decision |
|---|---:|---:|---:|---:|---|
| Existing static HTML/CSS/JS | 9 | 10 | 9 | 10 | selected |
| Astro static route | 8 | 6 | 8 | 8 | unnecessary dependency |
| React/Vite micro-app | 7 | 5 | 7 | 7 | excessive for one action |
| Hosted upload/form service | 5 | 7 | 3 | 5 | rejected: privacy and ownership |

No dependency installation is required. The current substrate supports the
information architecture, accessible links, responsive layout and tracking.

## Pipeline And Gates

- Product Studio Kernel: context, route contract and proof plan.
- Service Demand Strategy: urgent/problem-led plus premium/consultative.
- Conversion Director: one primary action, clear photo instructions and no
  diagnostic overclaim.
- Product Excellence: Russian copy, anti-slop and mobile hierarchy.
- Visual Quality: desktop/mobile screenshots, crop, overflow, tap targets and
  reduced motion.
- Security/Privacy: no form, upload, identifier or browser-side image handling.
- Release: isolated branch, CI contract, rollback by reverting one route.

## Visual Decision

No new generated asset is required. The utility reuses one existing
privacy-reviewed OHTAAWA atmosphere image already present in the repository.
It is used as environment and process context, not as proof of a particular
customer result. Live controls and text remain code-native.

## Hard Gates

- Do not diagnose a defect, guarantee repairability or quote a final price from
  photographs.
- Do not collect images, phone, email, plate, VIN or any form data on the site.
- Tell the visitor to hide plates, faces and documents before sending.
- Keep Search campaigns, budgets and existing service pages unchanged.
- No sticky CTA, automatic outreach or paid distribution in this release.
- Production claim requires HTTP 200, isolated tracking, desktop/mobile proof,
  CI success and an explicit release record.

## Proof Pack

- Static contract test.
- Browser QA at `1440x1000` and `390x844`.
- Screenshots for hero, photo guide, decision routes, inspection and final CTA.
- QA suppression proof with zero Metrika requests.
- Asset provenance manifest and rollback note.
