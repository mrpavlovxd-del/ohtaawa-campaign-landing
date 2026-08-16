# Wave53 analytics event map

Counter boundary: only Yandex Metrika 110584673.

## Attribution contract

| Field | Required value |
|---|---|
| utm_campaign | wave53_ya_search_leather_care_3500 |
| scenario | leather_care_fixed_3500 |
| experiment_id | wave53 |
| service_route | leather_care |
| offer_id | leather_care_koch_fixed_3500 |
| landing_version | wave53-leather-care-v1 |

## Goals

| Goal | Trigger | Interpretation |
|---|---|---|
| landing_view_leather_care_w53 | route JS ready | Visit, not engagement |
| price_view_leather_care_w53 | price visible at ≥45% | Price exposure |
| offer_terms_view_leather_care_w53 | scope section visible at ≥45% | Scope exposure |
| trust_view_leather_care_w53 | condition/trust section visible at ≥45% | Trust/fit exposure |
| process_view_leather_care_w53 | protocol visible at ≥45% | Process exposure |
| contact_sheet_open_leather_care_w53 | any contact dialog opener | Contact intent, not a lead |
| contact_channel_click_leather_care_w53 | channel selected | Channel handoff, not a hard lead |
| lead_phone_leather_care_w53 | phone clicked | Channel signal |
| lead_telegram_leather_care_w53 | Telegram clicked | Channel signal |
| lead_whatsapp_leather_care_w53 | WhatsApp clicked | Channel signal |
| lead_max_leather_care_w53 | MAX clicked | Channel signal |
| landing_scroll_50_leather_care_w53 | 50% document scroll | Depth signal |
| landing_scroll_90_leather_care_w53 | 90% document scroll | Deep-read signal |
| route_yandex_reviews_leather_care_w53 | external review source opened | Reputation research |
| route_yandex_maps_leather_care_w53 | route opened | Location intent |
| route_main_site_leather_care_w53 | main site opened | Site navigation |

Hard lead is not inferred from a client-side event. It requires a meaningful two-sided dialogue with a next step; confirmed booking remains separate.

## QA isolation

Metrika is disabled on localhost/127.0.0.1, query keys qa, codex, smoke, _ym_debug, and attribution markers containing those tokens. QA events remain available in window.ohtaawaAnalytics.qaEvents.

Production-like mapping is tested locally by serving the page under go.detailingspb.ru, intercepting the Metrika script request, and inspecting queued ym calls. No real goal is sent during QA.
