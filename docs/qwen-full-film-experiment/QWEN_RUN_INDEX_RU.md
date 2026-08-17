# Qwen specialist run index — Full Film Reinvention

Срез: 2026-08-17 после завершения v2.4. Статус: `OWNER_GRADE_TECHNICAL_CANDIDATE / NOT FOR DEPLOY / MEDIA_OWNER_GATE`. Run IDs ссылаются на изолированный Codex OS specialist run store. Локальные абсолютные пути и секреты намеренно не приводятся.

| Run ID | Task capsule | Status | Роль в evidence |
|---|---|---|---|
| 20260816-115907-352-f30960c2 | QWEN_BUILD_TASK_RU.md | FAILED_RUNTIME | Кириллический input route завершился runtime failure; не evidence реализации. |
| 20260816-120036-082-cdf9e420 | QWEN_BUILD_TASK_ASCII.md | COMPLETED | Первый полный Qwen implementation pass. Позже отклонён независимым red-team. |
| 20260816-123845-248-467dfcb6 | QWEN_REFINEMENT_TASK_ASCII.md | INTERRUPTED / STALE_MANIFEST | Процесс прерван до финального evidence; FINAL_RESPONSE не использовать. |
| 20260817-001953-804-a39c4a69 | QWEN_RESUME_V2_TASK_ASCII.md | INTERRUPTED / STALE_MANIFEST | Незавершённый resume; не evidence. |
| 20260817-004248-481-93f479d3 | QWEN_RESUME_V2_TASK_ASCII.md | INTERRUPTED / STALE_MANIFEST | Незавершённый resume; не evidence. |
| 20260817-022008-362-f006dcfc | QWEN_V2_1_CORRECTION_TASK_ASCII.md | COMPLETED | Content visibility, signature strengthening, message match, contact/gallery corrections; требовал независимой проверки. |
| 20260817-022709-746-238c95cf | QWEN_V2_1_RUNTIME_FIX_ASCII.md | COMPLETED | Закрытие TDZ runtime blocker. |
| 20260817-023408-729-ab2507ab | QWEN_V2_2_ACCESSIBILITY_FIX_ASCII.md | COMPLETED | Contrast, targets, dialog, Save-Data, header location, truthful copy. |
| 20260817-025031-189-8bce3396 | QWEN_V2_3_TARGET_TRANSLATION_TASK_ASCII.md | COMPLETED / exit 0 | Qwen3.7-max v2.3 завершён 2026-08-17 03:15:43 МСК; source затем прошёл отдельную correction/verification chain. |
| 20260817-032324-052-83245090 | QWEN_V2_4_FINAL_CORRECTION_TASK_ASCII.md | FAILED_RUNTIME / exit 1 | UTF-8 stdin/capsule decode failure до исполнения; stdout 0, source effect 0. |
| 20260817-032408-893-3a8887ee | QWEN_V2_4_FINAL_CORRECTION_TASK_ASCII.md | COMPLETED / exit 0 | Corrected Qwen3.7-max v2.4 завершён 2026-08-17 03:35:06 МСК; это финальный Qwen pass. |

## Правила доверия

- Qwen — автор design/implementation решения; Sol/root — независимый verifier.
- COMPLETED manifest и exit code 0 доказывают только завершение specialist run, не browser quality, conversion effect, public rights или launch readiness.
- Interrupted/stale manifests исключены из финальных утверждений.
- Task capsules сохраняются как исторический contract evidence и не переписываются под последующий результат.
- Runtime failure `20260817-032324-052-83245090` не считается implementation evidence и не входит в source lineage.
- Финальная source-линия: corrected Qwen v2.4 + bounded Sol hardening/material integration с asymmetric compositing.
- Независимые технические доказательства: browser QA `90/90 PASS`, performance `70/70 PASS`, motion `99/99 PASS`, source checks `PASS`.

## Открытые gates

- Final visual score/verdict: `GO_OWNER_GRADE / VISUAL GO`; overall `8,8`, signature `8,9`, premium `8,6`, target translation `0,84`. Старый v2.2 score сохранён только как historical failure.
- Generated hero layer остаётся owner-gated; три retained real proof assets — `UNKNOWN_DO_NOT_PUBLISH`.
- Final commit/Draft PR, merge, deploy, live experiment assignment и любые production changes не выполнены.
