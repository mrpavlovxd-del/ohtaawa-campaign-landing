# QWEN V2.1 CORRECTION TASK

You are the design and implementation lead for the OHTAAWA full transparent
paint-protection-film landing. Continue from the CURRENT source in this
workspace. Do not restart from origin/main and do not create a second prototype.

Outcome: edit the real candidate source into an owner-grade NOT FOR DEPLOY v2.1.
Sol will run all browser QA after your edit, so keep this pass bounded: implement
the fixes, run only short static checks, then finish with an exact change summary.

Source of truth:
- index.html
- assets/qwen-full-film.css
- assets/qwen-full-film.js
- docs/qwen-full-film-experiment/SOURCE_OF_TRUTH_ASCII.md
- docs/qwen-full-film-experiment/SOL_RED_TEAM_FINDINGS_RU.md
- internal visual targets in artifacts/qwen-full-film-concept-targets/*-v2.png
- rejected fresh proof showing mobile blanks:
  artifacts/qwen-full-film-qa-v2/mobile-390-full.png

Hard truth and boundaries:
- Fixed confirmed price is 180,000 RUB, not 1,800,000.
- Keep the exact factual offer, terms, real brand logo, phone, channels, address,
  counter 110584673 and canonical event names already in source.
- Never touch risk-zones/, color-film/, live ads, production, Metrika settings,
  Mango, Git, GitHub, deploy or secrets.
- Generated target PNGs are internal art direction only. Never embed them and
  never present them as real client proof.
- Existing real proof images remain candidate_not_published until owner approval.
- Do not fabricate film brands, testimonials, response times, results, video or
  client facts.

Mandatory corrections:

1. CONTENT MUST NEVER BE HIDDEN BY MOTION.
The current mobile full-page proof has large blank areas because data-reveal
nodes remain opacity:0. Redesign the reveal mechanism so HTML content is visible
by default and remains visible with JS, no-JS, interrupted scroll, full-page
screenshot, reduced motion and Save-Data. Motion may enhance already visible
content; it may not gate visibility. Remove the failure class of opacity-hidden
content completely. No huge empty sections at 430, 390 or 360 widths.

2. MAKE THE QWEN SIGNATURE LEGIBLE AND BOLD.
The current Tension Field is too faint and reads as unused empty space. Strengthen
the code-native film membrane / inspection-light signature so it is clearly
visible at 1440 and on mobile while staying premium, truthful and lightweight.
Use purposeful CSS/SVG/WAAPI motion and custom line icons only; no fake video and
no generic dark-car house style. Let the signature connect the hero to the
process/proof story rather than behaving as decoration. Keep reduced-motion and
Save-Data static replacements. Do not return to a card-grid template.

3. MESSAGE MATCH.
Implement deterministic, truthful hero copy variants before first paint or at
the earliest synchronous script point:
- utm_content=newcar_fullfilm: emphasize protection of a new car while keeping
  the fixed 180,000 RUB price and identical terms.
- utm_content=price_install_fullfilm: emphasize that 180,000 RUB includes film,
  preparation, installation and final control.
- default: current full-body protection proposition.
Record the selected variant in analytics payload as message_variant. Do not
change the offer or invent conditions.

4. FIRST CONTACT MECHANICS.
Keep the low-commitment car question. Ensure each phone/Telegram/WhatsApp/MAX
action has an explicit contact location, one canonical channel goal, and honest
copy behavior. WhatsApp may receive a prepared URL. Telegram/MAX must clearly
say that the prepared text is copied and must be pasted; provide a readable
manual fallback if clipboard is unavailable. Avoid claiming a fast reply.

5. GALLERY AND ACCESSIBILITY.
Autoplay must not begin at all. Remove the misleading Pause control and all
autoplay timers; keep manual arrows, tabs, swipe and keyboard navigation.
Do not churn aria-live. Ensure visible focus, logical tab order, 44px mobile tap
targets for primary controls, dialog close/focus behavior and usable content
without JS. Decorative SVG must be aria-hidden; meaningful text stays native.

6. QA ISOLATION AND PERFORMANCE.
Preserve localhost/qa suppression of all Metrika requests and expose QA events.
Save-Data and reduced-motion must suppress nonessential motion. Keep source
dependency-light and no new runtime/library. Do not add background video.

7. SOURCE HYGIENE.
UTF-8 without BOM/zero-width markers. Keep real source changes limited to
index.html, assets/qwen-full-film.css and assets/qwen-full-film.js unless a very
small supporting doc update is necessary. Do not write screenshots, install
packages, create temp writers, or modify package files in this pass.

Before finishing, perform short static checks only:
- inspect git diff for the three source files;
- confirm no setInterval/autoplay implementation remains;
- confirm no CSS rule can leave data-reveal at opacity:0;
- confirm both UTM variants and message_variant exist;
- confirm no other route changed.

Return: concise files changed, design decisions, static checks, unresolved facts.
Do not claim browser QA or owner approval; Sol owns those gates.
