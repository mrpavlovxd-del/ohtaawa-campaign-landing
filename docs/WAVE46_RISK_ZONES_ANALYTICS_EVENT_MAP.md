# Wave46 analytics event map

- `landing_view_risk_zones_v1`
- `package_view_risk_zones_v1`
- `price_view_risk_zones_v1`
- `proof_view_risk_zones_v1`
- `proof_carousel_risk_zones_v1`
- `contact_sheet_open_risk_zones_v1`
- `lead_telegram_risk_zones_v1`
- `lead_whatsapp_risk_zones_v1`
- `lead_max_risk_zones_v1`
- `lead_phone_risk_zones_v1`
- `reviews_click_risk_zones_v1`
- `map_click_risk_zones_v1`
- `scroll_50_risk_zones_v1`
- `scroll_90_risk_zones_v1`
- `faq_open_risk_zones_v1`

Every payload must include `service_route=risk_zones`, `offer_id=risk_zones_fixed_60`, `scenario=risk-zones`, `experiment_id=wave46_ya_search_risk_zones_60k_control`, UTM fields, event time, and page path. QA/codex/smoke traffic must not reach Metrika.
