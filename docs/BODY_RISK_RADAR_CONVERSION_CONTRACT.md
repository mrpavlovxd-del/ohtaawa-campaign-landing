# Body Risk Radar Conversion Contract

## Cohort

- route: `/body-radar/`
- channel code: `BRR_W34`
- experiment: `body_risk_radar_w34`
- scenario: `vehicle_risk_signal_optin`
- default campaign: `unconventional_body_risk_radar_2026w34`

## Visitor promise

OHTAAWA publishes only rare, manually checked signals about events that may
matter to the vehicle body. It does not replace official safety warnings,
guarantee damage or turn every weather event and road repair into advertising.

## CTA hierarchy

1. Primary: subscribe to the existing OHTAAWA Telegram channel.
2. Secondary: open the OHTAAWA Telegram chat to request a body consultation.
3. Informational: open the official source pages.

## Funnel

`route_view -> subscribe_click -> verified_alert -> inspection_click -> meaningful_dialogue -> quote -> booking -> payment`

A route view, channel click or alert open is a soft signal. A hard lead requires
a substantive dialogue about a particular vehicle and next commercial step.

## Events

| Event | Meaning |
|---|---|
| `body_radar_view_v1` | clean route view |
| `body_radar_subscribe_click_v1` | click to the Telegram channel |
| `body_radar_how_it_works_v1` | move from hero to method |
| `body_radar_source_click_v1` | click to an official source |
| `lead_telegram_body_radar_v1` | click to consultation chat |

Every event carries `experiment_id`, `scenario`, `channel_code`, UTMs and
`entry_signal` when supplied. QA, `_ym_debug`, `codex` and `smoke` visits never
reach Yandex Metrika goals.

## Privacy and truth

- no form, file upload, geolocation, route, phone, email or vehicle identifier;
- no automatic public message;
- MCHS and transport links remain visible;
- generated visuals are not used;
- existing atmosphere media is not labeled as a specific client result;
- Open-Meteo free API is not called from the page.
