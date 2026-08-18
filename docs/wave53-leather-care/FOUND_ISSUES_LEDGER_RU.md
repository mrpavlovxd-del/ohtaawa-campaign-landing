# Found Issues Ledger — Wave53

| ID | Source | Severity | Owner/director | Finding | Action | Status | Verification |
|---|---|---|---|---|---|---|---|
| W53-001 | Media inventory | P1 | Real Media | Нет подтверждённого exact Koch/after proof asset | Не создавать gallery/before-after; owner shot list | Open / production blocker | Rights ledger + owner confirmation |
| W53-002 | Legacy brand asset | P1 | Real Media | Права и контекст `premium-car.jpg` не подтверждены владельцем | Draft atmosphere only; production gate | Open / accepted for Draft | SHA256 + owner review |
| W53-003 | Legacy shared JS | P1 | Technical | `assets/app.js` содержит film-specific fallbacks/urgency/goals | Route-local JS | Closed | Static + runtime event QA PASS |
| W53-004 | Experiment design | P1 | Conversion | Нет существующего production control для новой услуги | Называть v1 baseline, не A/B proof | Closed by contract | Experiment contract review |
| W53-005 | Offer scope | P1 | Copy | Риск смешать leather care с полной химчисткой/реставрацией | Explicit exclusions and separate extras | Closed | Message-match + screenshot QA PASS |
| W53-006 | Live boundary | P0 | Launch | Route/campaign/counter goals ещё не public-approved | Stop at Draft PR | Open / hard gate | Git diff + PR state |
| W53-007 | First cold browser run | P2 | QA | Первый cold desktop FCP/LCP был 2,124 с; повторный финальный прогон 1,008 с | Сохранить production performance как отдельный post-deploy gate | Accepted risk | Final `qa.json`; both LCP values <2.5 s |
