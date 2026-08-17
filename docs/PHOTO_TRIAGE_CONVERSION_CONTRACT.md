# Photo Triage Conversion Contract

## Scenario

A person sees a mark, stain, scratch or damaged-looking area and does not know
whether cleaning, polishing, film, body repair or only an in-person inspection
is appropriate.

## Conversion

- Primary: click to a Telegram dialogue after reading the three-shot guide.
- Qualified dialogue: three usable photographs plus vehicle and incident
  context, followed by a meaningful answer from OHTAAWA.
- Hard lead: a concrete service need and an agreed next commercial step.
- Down-funnel: inspection, quote, booking, payment and completed work are counted
  separately.

## Offer

`Покажите три фотографии. Подскажем разумный следующий шаг.`

The answer is routing, not remote diagnostics: clean/decontaminate, inspect,
polish, protect after correction, or contact a body-repair specialist.

## Measurement

- Channel code: `PHT_W34`.
- Experiment: `photo_triage_w34`.
- Scenario: `photo_defect_triage`.
- Default campaign: `unconventional_photo_triage_2026w34`.
- Events:
  - `photo_triage_view_v1`;
  - `photo_triage_telegram_click_v1`;
  - `photo_triage_shot_guide_v1`;
  - `photo_triage_route_view_v1`;
  - `photo_triage_inspection_view_v1`.

## Test Gate

Review after 21 days or 20 complete triage requests. Continue only if the pilot
produces at least 15 complete triages, 5 meaningful dialogues, 3 inspections,
2 quotes and 1 paid booking; at least 60% of requests must fit OHTAAWA services,
median manual handling must remain at or below 8 minutes and there must be no
privacy or remote-diagnosis complaints.

Immediate stop: privacy incident, materially wrong remote conclusion, repeated
requests outside the service scope or a broken contact/tracking path.
