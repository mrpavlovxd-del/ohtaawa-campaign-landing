# Media publishability decision — Qwen Full Film

Статус: INTERNAL CANDIDATE ONLY / PUBLIC USE BLOCKED.

## Retained in v2.4 candidate

| File | Known provenance | Current status | Public-use gap |
|---|---|---|---|
| assets/proof/real/crops/finished-porsche-wide.webp | Stable asset ID, output SHA256 и локальный deterministic recipe зафиксированы; parent file известен. | candidate_not_published | Parent SHA256, file-level rights/consent/factual-use evidence и owner approval. |
| assets/proof/real/crops/film-sheet-wide.webp | Stable asset ID и output SHA256 зафиксированы; exact crop также есть в assets/provenance-wave45.json. | candidate_not_published | Parent source/hash, file-level rights/consent/factual-use evidence и owner approval. |
| assets/proof/real/crops/gloss-front-wide.webp | Stable asset ID, output SHA256 и локальный deterministic recipe зафиксированы; parent file известен. | candidate_not_published | Parent SHA256, file-level rights/consent/factual-use evidence и owner approval. |

Наличие owner-provided source не равно разрешению на публичную публикацию.

## Blocked and required absent from v2.4

| File | Причина |
|---|---|
| assets/proof/real/crops/gloss-panel-wide.webp | Недостаточная exact derivative/publishability запись. |
| assets/proof/real/crops/film-edge-process-wide.webp | Различимое лицо; согласие не зафиксировано. |
| assets/proof/real/crops/full-body-disassembly-wide.webp | Недостаточная derivative provenance. |

Эти файлы нельзя загружать как main image, thumbnail, fallback или prefetch.

## Generated targets и material layer

artifacts/qwen-full-film-concept-targets содержит generated-illustrative UI targets. Они:

- не являются реальными работами OHTAAWA;
- не подтверждают результат услуги;
- не должны загружаться production DOM/network;
- разрешены только как internal art-direction evidence согласно GENERATED_ASSET_MANIFEST.json.

Generated material layer имеет отдельную полную локальную hash-chain:

| Asset | Role | Proof | Current status | Public-use gap |
|---|---|---:|---|---|
| artifacts/qwen-full-film-generated-assets/qwen-tension-material-source.png | Внутренний source built-in image_gen | false | candidate_not_published_owner_gate; runtime reference отсутствует | Owner approval; source должен остаться internal. |
| assets/generated/qwen-tension-material-desktop.webp | Desktop decorative/material hero layer | false | candidate_not_published_owner_gate; embedded only inside aria-hidden hero container; rendered QA PASS | Explicit owner approval. |
| assets/generated/qwen-tension-material-mobile.webp | Mobile decorative/material hero layer | false | candidate_not_published_owner_gate; embedded only inside aria-hidden hero container; rendered QA PASS | Explicit owner approval. |

Source и derivatives визуально и по metadata проверены: реальные люди, логотипы, читаемый текст, client/result claim, private identifiers, EXIF/XMP/ICC/text/GPS payload не обнаружены. Это не превращает generated layer в реальное доказательство и не снимает owner gate.

## Что закрывает public gate

Для каждого retained proof asset нужны: original/source link внутри private inventory, ownership/license, consent/identifier review, недостающие parent hashes, intended placement, publishability verdict и явное owner approval. Для generated material derivatives rendered crop/contrast QA уже пройден; остаётся explicit owner approval при неизменном `proof:false`.

До этого даже технически зелёный Draft PR остаётся NOT FOR DEPLOY.
