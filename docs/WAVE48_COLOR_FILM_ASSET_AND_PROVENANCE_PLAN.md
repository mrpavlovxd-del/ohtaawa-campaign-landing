# Wave48 asset and provenance plan

| Asset | Source type | Intended role | Public status | Required action |
|---|---|---|---|---|
| `assets/real-color-film-front-v9.webp` | owner-provided real OHTAAWA material | real front-view proof and location context | candidate approved | verify final crop and identifiers at 100 percent |
| `assets/real-color-film-rear-v9.webp` | owner-provided real OHTAAWA material | real rear-view proof | candidate approved | verify final crop and identifiers at 100 percent |
| Wave45 OHTAAWA lockup and UI assets | approved production assets | brand/navigation/controls | approved | reuse without visual distortion |
| `assets/generated/wave48-color-film-hero-desktop.webp` | built-in `image_gen` atmospheric derivative grounded in the owner-provided front reference | desktop first-screen atmosphere only | candidate, not published | owner approval and final channel crop QA required; never use as proof |
| `assets/generated/wave48-color-film-hero-mobile.webp` | deterministic sharp mobile crop of the generated atmospheric derivative | mobile first-screen atmosphere only | candidate, not published | owner approval and final mobile crop QA required; never use as proof |
| `assets/generated/wave48-color-film-concept-target.png` | built-in generated visual target | internal layout and art-direction reference | internal only | never publish as page imagery; translate structure into code and real assets |
| Real map embed | Yandex map | location and route proof | approved production pattern | reuse live code-native embed |

## Asset gap

- A landscape hero that shows color-film character under controlled studio light without implying a specific completed job.
- Optional close crop of the real burgundy surface for the material section.
- No additional client-work proof is required for the first candidate because the same real vehicle is documented from two views.

## Governance

- Sources remain immutable; derivatives receive new filenames and provenance entries.
- No generated image can be placed inside the real-case gallery.
- No automatic plate/identifier mask is accepted without 100 percent visual inspection after final crop.
- Unknown-source images are blocked.
- Public publication remains subject to owner approval and final channel QA.

## Closed asset gap and critic result

- The generated hero keeps the approved deep-burgundy color cue and an
  OHTAAWA-like wood-and-black studio context, but it is explicitly classified
  as atmosphere rather than a completed client job.
- Desktop and mobile derivatives were inspected at final crop. No readable
  plate, third-party mark, broken automotive geometry or human anatomy is
  present.
- Critic scores: photorealism `9.0`, premium feeling `9.1`, automotive realism
  `9.0`, composition `9.1`, mobile crop `9.0`, conversion usefulness `9.0`.
- The real front/rear proof pair remains visually separated from the generated
  hero and is the only vehicle evidence used inside the proof carousel.
- Exact hashes and derivative roles are recorded in
  `assets/provenance-wave48.json`.
