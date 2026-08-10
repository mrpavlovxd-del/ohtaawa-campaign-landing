# Wave48 color-film QA and launch readiness

## Candidate

- Local route: `http://127.0.0.1:4190/color-film/`.
- Public target route: `https://go.detailingspb.ru/color-film/`.
- Branch: `codex/ohtaawa-color-film-landing`.
- Offer: full colored protective wrap of painted body elements for a fixed
  `230 000 RUB`.
- State: isolated candidate, not published.

## Verified evidence

- Fresh functional and visual QA: `PASS` at `1440x900`, `390x844` and
  `430x932`.
- Evidence folder:
  `C:/Users/Никита/Documents/New project/docs/ohtaawa-retargeting/agent-work/2026-08-10/landing-wave48-color-film-qa`.
- No horizontal overflow, broken images, unnamed buttons, console errors or
  page errors.
- Hero CTA is visible in the first viewport at all tested sizes.
- Proof heading remains inside its editorial column and does not overlap media.
- No sticky mobile CTA or fixed bottom obstruction.
- Contact sheet offers Telegram, WhatsApp, MAX and phone.
- Carousel, full-screen proof dialog, FAQ and contact dialog passed interaction
  smoke.
- Real proof uses only the two owner-provided color-film views; the internal
  concept target is not loaded by the public page.
- Yandex map loaded after the location section settled on desktop and mobile.
- QA events are isolated from production decisions by Codex/QA UTM parameters.

## Tracking contract

- Counter: go-only Yandex Metrika `110584673`.
- Route: `film_color_full`.
- Offer: `color_film_fixed_230`.
- Experiment: `wave48_control`.
- Proposed campaign UTM: `wave48_ya_search_color_film_230k_control`.

Goals to create or verify before public traffic:

1. `price_view_color_film_wave48`
2. `proof_view_color_film_wave48`
3. `offer_terms_view_color_film_wave48`
4. `process_view_color_film_wave48`
5. `warranty_view_color_film_wave48`
6. `landing_scroll_50_color_film_wave48`
7. `landing_scroll_90_color_film_wave48`
8. `lead_phone_color_film_wave48`
9. `lead_telegram_color_film_wave48`
10. `lead_whatsapp_color_film_wave48`
11. `lead_max_color_film_wave48`

## Release blockers

- Owner has not yet approved publication of the `/color-film/` candidate or its
  generated atmospheric hero.
- The eleven Wave48 Metrika goals have not been live-verified in counter
  `110584673`.
- Campaign message-match, final UTM link and live HTTPS smoke must be repeated
  after publication.
- `noindex,nofollow` is intentional while the route is a candidate; SEO policy
  must be chosen at launch.

## Safe launch sequence after approval

1. Create/verify the eleven goals without changing the existing Wave45 goals.
2. Publish only the isolated `/color-film/` route.
3. Run live HTTPS, mobile, contact-path and analytics smoke with QA exclusions.
4. Prepare a separate Search-only campaign cohort; do not mix it with Wave45.
5. Start with the agreed small budget and preserve campaign-level stop rules.
6. Compare query relevance, engaged visits, price/proof progression, CTA and
   qualified conversations before scaling.

## Rollback

- Remove the isolated route from the published artifact and restore the prior
  GitHub Pages commit.
- Do not change the root Wave45 route or active campaign during the Wave48
  rollback.
