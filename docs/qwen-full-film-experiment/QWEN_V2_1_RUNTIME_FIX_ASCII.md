# QWEN V2.1 RUNTIME FIX

You are still the implementation lead. Fix one independently proven blocker in
the CURRENT source, without redesigning anything.

Workspace source: assets/qwen-full-film.js

Blocker: the v2.1 script reads `compact(params.get(...))` at lines 11-14 before
both `params` and `compact` are declared later with `const`. This is a temporal
dead zone ReferenceError and stops all analytics and interactions.

Required action:
- Reorder initialization so URLSearchParams and compact exist before message
  variant selection. Keep config/QA isolation and attribution behavior intact.
- Keep the existing synchronous inline hero variant script in index.html intact.
- Do not introduce duplicate declarations or global variables.
- Do not edit HTML/CSS or any other route/file unless absolutely necessary.
- Run `node --check assets/qwen-full-film.js` and a short real browser smoke on
  localhost with `?qa=1&utm_content=newcar_fullfilm` that proves:
  no pageerror, `window.ohtaawaAnalytics` exists, message_variant is `newcar`,
  and zero Metrika requests occur.
- Also smoke `price_install_fullfilm` and prove message_variant is `price`.

Hard boundaries: no Git/GitHub, deploy, production, ads, Metrika/Mango changes,
package install, screenshots or temp writers. Finish quickly with exact evidence.
