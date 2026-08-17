# Qwen 3.7 Max resume task: finish the interrupted OHTAAWA v2 run

## Exact checkpoint

The prior specialist run `20260816-123845-248-467dfcb6` was interrupted by parent-thread input while you were entering v2 browser QA. Its manifest remains `RUNNING`, but the process no longer exists. Do not read or treat its incomplete final response as evidence.

The v2 implementation was already written at approximately 2026-08-16 12:53 MSK:

- `index.html`
- `assets/qwen-full-film.css`
- `assets/qwen-full-film.js`

You also created:

- `scripts/qa_v2.cjs`
- `scripts/qa_v2_standalone.cjs`

The required proof folder `artifacts/qwen-full-film-qa-v2/` is still empty. Continue from this checkpoint. Do not redesign from scratch unless browser evidence proves the v2 implementation still fails the accepted target.

## Required outcome

1. Re-read `QWEN_REFINEMENT_TASK_ASCII.md`, `SOL_RED_TEAM_FINDINGS_RU.md`, `VISUAL_TARGET_TRANSLATION_CONTRACT_RU.md`, and both accepted v2 target images.
2. Inspect the current v2 source for completeness, UTF-8/BOM integrity, progressive enhancement, message match, analytics event mapping, Save-Data and accessibility.
3. Run the v2 QA scripts. Fix real defects in your own implementation and rerun until evidence is trustworthy.
4. Create fresh evidence under `artifacts/qwen-full-film-qa-v2/` for 1440, 430, 390 and 360 plus reduced-motion, Save-Data and no-JS states. Normal-motion full-page screenshots must traverse the page first and end with zero hidden reveal nodes.
5. Produce or update `docs/qwen-full-film-experiment/QWEN_V2_QA_REPORT_RU.md`, `FOUND_ISSUES_LEDGER_RU.md`, and a compact target-vs-v2 / old-vs-v2 self-critique.
6. Verify the full canonical event map and counter with zero QA Metrika requests; verify message match for both supported `utm_content` values; verify the car-model action result for WhatsApp and the explicit copy/paste path for Telegram/MAX.
7. Run realistic mobile Lighthouse or an equivalent lab audit and record LCP, CLS and TBT/Speed Index plus total transferred image/media bytes. Do not claim field INP.
8. List exact cleanup candidates you created. Do not commit, push, PR, deploy, edit live systems, or touch `/risk-zones/` and `/color-film/`.

## Completion rule

Return `COMPLETE` only if the existing v2 product source is visibly owner-grade, the Tension Field is visible in desktop and mobile hero evidence, every critical/high red-team item is closed or honestly blocked, and the fresh proof pack exists. Otherwise return `INCOMPLETE` with the exact failed gate. The parent will independently verify and perform cleanup/Git operations after your completed manifest.
