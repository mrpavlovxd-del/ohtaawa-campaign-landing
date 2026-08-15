# Wave50 question-first analytics map

## Diagnostic funnel

| Stage | Event | Meaning | Lead status |
|---|---|---|---|
| Landing | `landing_view` | Page initialized | none |
| Price | `price_view_polish_film_v9` | Price visible | none |
| Proof | `proof_view_polish_film_v9` | Real proof section visible | none |
| Intent | `contact_intent_open_question_first_v1` | Visitor chose to ask a question | soft only |
| Contact sheet | `contact_sheet_open` | Existing generic modal-open telemetry | soft only |
| Channel | `contact_channel_click` | Channel selected, with `channel` and `location` | soft only |
| Canonical CTA | existing phone/Telegram/WhatsApp/MAX goal | External contact action | soft only |
| Business outcome | lead ledger/Mango/messenger verification | Meaningful dialogue, booking, prepayment, completion | hard outcome |

Every browser payload must retain UTM, scenario, experiment ID, service route, offer ID, landing version, event time and page path. QA traffic must remain local in `window.ohtaawaAnalytics.qaEvents` and must not load/send Metrika.

Attribution invariant: known QA must be excluded through the parent `analytics-known-qa-batches.json`. The owner-confirmed untagged organic aggregate from the interval preceding 15 August 08:41 MSK and the technical Mango call are excluded wholesale, with no guessed visit count. Paid exact-UTM Wave45/46/48 cohorts remain separate and valid.

The desktop header phone remains a parallel direct path inherited from Wave45: it can produce the canonical phone goal without an intent-open event. This is held constant, must be reported separately by `location=header`, and must not be forced into the modal funnel.

## Evidence needed before a causal claim

| Check | Required evidence | Gate |
|---|---|---|
| CTA exposure | Proposed `primary_contact_cta_view` with location, or a documented first-viewport invariant | No live event addition without owner approval |
| Control intent | Exact-UTM `contact_sheet_open` for Wave45/Wave48 | Report separately by route and CTA location |
| Candidate intent | `contact_intent_open_question_first_v1` and `contact_sheet_open` | Counts should reconcile 1:1 outside the inherited header phone path |
| Channel choice | `contact_channel_click` plus canonical per-channel event | Channel click cannot exceed sheet open; channel totals must reconcile |
| Hard outcome | QA-excluded Mango/messenger/Avito/lead-ledger reconciliation | Open/click never becomes a lead by itself |

`N<10` clean visits per route is descriptive only. `N=30` clean comparable visits or the approved spend checkpoint is a diagnostic review, not automatic proof. Current Wave45 `0/33` is a channel-click result, not an intent baseline. Only after an exact comparable control establishes `contact_sheet_open=0/33` would `≥5/33` candidate intent opens produce nominal one-sided Fisher `p≈0.0266`; this remains a soft funnel signal because cohorts are not randomized and commercial success still requires meaningful conversations.

Wave48 has two strictly relevant paid clicks, but only one processed behavioral visit. That `N=1` visit reaches terms/price/proof/process/warranty/scroll50 without a channel event. Delivery clicks must not substitute for processed-session denominator, and Wave48 must not be pooled with Wave45 or Wave50.

The 15 August production smoke confirms that route-specific page events and all four channel click targets can fire under QA isolation on full-film, risk-zones and color-film. This is implementation evidence only: it does not establish a live `contact_sheet_open` baseline, prove an external app opened successfully, or count a meaningful conversation.

## Cabinet boundary

The frontend candidate may emit the dedicated event locally. Creating or verifying a matching Metrika goal is a separate read/write cabinet action and is not authorized in this task.
