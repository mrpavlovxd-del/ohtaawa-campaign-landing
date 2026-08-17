# QWEN V2.2 ACCESSIBILITY AND COPY FIX

Continue as design/implementation lead from the CURRENT v2.1 source. Apply one
bounded correction batch proven by independent Sol browser QA. Do not redesign.

Edit only index.html, assets/qwen-full-film.css, assets/qwen-full-film.js.

Required source fixes:

1. TEXT CONTRAST
`--accent-dark:#9a7040` is about 4.00:1 on #f5f4f0 and fails WCAG AA for
11-13px labels. Preserve the amber identity but use a darker text token with at
least 4.5:1 on both #f5f4f0 and #ffffff (for example evaluate #8f6437 or safer).
Decorative strokes may keep the lighter amber token.

2. MOBILE TARGETS
At 390px the car input is 39px high and dialog close is 32x32. Make both at
least 44px in each relevant viewport without harming the layout. Keep all other
controls at least 44px.

3. DIALOG KEYBOARD MODEL
Implement a reliable Tab/Shift+Tab focus trap inside the open modal dialog,
Escape close, and return focus to the exact trigger after close. Keep native
dialog semantics and do not trap focus while closed.

4. SAVE-DATA
When body has `.save-data`, suppress all nonessential CSS animations and
transitions, including the header 300ms transition detected by QA. Content must
remain fully visible and usable.

5. EXPLICIT CONTACT LOCATION
Add `data-contact-location="header"` to the header phone link so every contact
action has an explicit location. Do not duplicate its canonical goal event.

6. TRUTHFUL MESSAGE-MATCH COPY
Keep the two existing variants but remove overclaims:
- newcar variant must not promise that film "will preserve" paint; use honest
  risk-reduction/help-protect language consistent with the FAQ.
- price variant must not claim "no hidden surcharges" unless explicitly proven;
  say exactly that 180,000 RUB includes film, preparation, installation and
  final control, with applicability/details confirmed before work.
Keep price and all factual terms unchanged.

Do not modify intentional display:none behavior of inactive UTM copy variants;
Sol is correcting that QA false positive. Do not add libraries, packages,
screenshots, temp files, Git/GitHub/deploy/live changes.

Static self-check: node --check JS; no contrast regression; input/close min 44;
focus trap and focus return present; save-data transition suppression present;
header phone explicit location; only three source files changed. Return exact
changes and unresolved browser evidence. Sol will rerun full QA.
