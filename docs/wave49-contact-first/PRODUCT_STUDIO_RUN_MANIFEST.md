# Product Studio Run Manifest: Wave49 Contact First

- **Run ID:** `ohtaawa-wave49-contact-first-20260813`
- **Task type:** paid-campaign landing CRO variant
- **Surface:** отдельная посадочная полной защитной оклейки кузова
- **Mode:** implementation-alpha from an owner-approved production benchmark

## Project context

- Wave45 is the owner-approved visual and content baseline.
- Wave45 has relevant, engaged Search traffic but zero messenger/phone CTA after 34 clicks.
- The test must preserve the 180 000 ₽ offer, proof, service scope, guarantee, timing, location and visual system.
- The owner explicitly rejected a mobile sticky CTA that obscures content.

## Design DNA and reference binding

- Reused reference: current Wave45 production landing, labeled `reused-reference`.
- Signature component retained: cinematic OHTAAWA hero plus proof carousel.
- New signature conversion component: an integrated first-viewport contact console with four code-native channels.
- No new visual direction is being claimed; this is a controlled CRO derivative.

## Pipeline and gates

- Product Studio Kernel bootloader and routing enforcer.
- Paid Campaign Landing Director.
- Russian Copy and Microcopy Polish.
- Mobile First Polish Gate.
- Browser Visual QA Loop and tracking smoke.
- Privacy/provenance: no new media; existing approved assets remain unchanged.

## Visual generation decision

`NOT_NEEDED_FOR_THIS_CONTROLLED_TEST`. The accepted Wave45 art direction and assets are deliberately held constant. New generation would introduce a second variable and invalidate the contact-mechanic comparison.

## Library Selection Preflight

Options considered:

1. Keep the current vanilla HTML/CSS/JS system.
2. Introduce a small component library.
3. Rebuild the contact surface in React.
4. Add a third-party messenger widget.

Decision: option 1. The existing substrate supports the required responsive panel, dialog, focus behavior, analytics and screenshots. Other options add dependencies, payload and attribution risk without improving this experiment.

## Implementation contract

- Create a separate `/contact-first/` route.
- Replace only the hero conversion area with a lower-commitment promise and visible Telegram, WhatsApp, MAX and phone actions.
- Keep a non-sticky layout on mobile.
- Keep the existing contact dialog for later-page CTAs.
- Preserve canonical contact goals and enrich all direct channel events with their actual placement.
- Use separate `experiment_id=wave49_contact_first` and landing version.

## Required proof

- 1440x900, 430x932 and 390x844 screenshots.
- No horizontal overflow, clipped CTA, sticky bottom obstruction, broken images or console errors.
- Four hero channels visible and tappable.
- Existing modal, carousel, gallery and FAQ remain functional.
- QA traffic does not reach production Metrika.

## Self-reject conditions

- The panel looks like a generic widget detached from the hero.
- The first mobile viewport loses the 180 000 ₽ offer or the main action.
- Any action is hidden behind a modal before the user can choose a channel.
- The panel becomes fixed/sticky or covers page content.
- More than the contact mechanic changes relative to Wave45.

## Approval and launch boundary

- Local candidate and QA are autonomous and reversible.
- Public deployment and a paid Wave49 campaign remain separate launch actions after visual/behavioral proof.
