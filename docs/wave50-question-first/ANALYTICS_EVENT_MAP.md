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

The desktop header phone remains a parallel direct path inherited from Wave45: it can produce the canonical phone goal without an intent-open event. This is held constant, must be reported separately by `location=header`, and must not be forced into the modal funnel.

## Cabinet boundary

The frontend candidate may emit the dedicated event locally. Creating or verifying a matching Metrika goal is a separate read/write cabinet action and is not authorized in this task.
