# Wave48 color-film project context harvest

## Business outcome

Create an isolated conversion landing for paid traffic from people already
considering a full color-film wrap. The first measurable outcome is a meaningful
messenger dialog or call about the service, not a generic click or scroll.

## Owner-approved offer truth

- Full wrapping of painted body elements with color protective film: fixed
  `230 000 RUB`, without `from`.
- Material, body preparation, installation and final quality control are
  included.
- Typical duration: `3-5 calendar days`.
- Warranty: `5 years` for material and installation; detailed conditions are
  confirmed by the administrator.
- A detailing body wash during the consultation is free and is not conditional
  on a subsequent booking in public copy.
- Taxi to the customer's destination and back is included for a full wrap.
- The administrator confirms the exact vehicle scope and final conditions.
- Page information is not a public offer.

## Customer intent and friction

The visitor wants two outcomes at once: a visible new color and protection of
the factory paint. Main friction points are uncertainty about the final price,
fear of poor edges or disassembly, concern about how the finish will look in
daylight, and doubt that the studio is a real local business. The page therefore
must make the fixed offer, real finish, installation discipline, location and
contact path legible without forcing the visitor through technical film jargon.

## Accepted and rejected taste evidence

- Accepted: premium but restrained OHTAAWA black/ivory/lime identity, large
  automotive photography, concise editorial copy, real map and direct contact
  choices.
- Accepted: Wave45 offer clarity and stable mobile composition.
- Rejected: diagram-like infographics assembled from basic shapes, floating
  service cards, repeated technical captions, awkward photo overlaps, fixed
  mobile CTA bars, generic mountain/forest luxury imagery and generated media
  presented as factual proof.
- Rejected: repeated caveats that undermine the fixed-price promise.

## Product architecture

1. Fixed offer and emotional color benefit in the first viewport.
2. One short explanation of color plus protection.
3. `Two perspectives, one finish` real-photo stage.
4. Compact included-work rows.
5. Process, duration, warranty, free consultation wash and taxi.
6. Reviews, real map, FAQ and final contact choice.

## Signature component

`Two perspectives, one finish` is a code-native front/rear stage using two real
OHTAAWA photographs of the same wrapped vehicle. Desktop keeps a dominant
selected frame and a visible narrow alternate perspective. Mobile uses a stable
two-step gallery with explicit controls and no overlapping cards.

## Implementation and analytics boundaries

- Static HTML/CSS/JS, no new dependencies.
- All contact, gallery, FAQ and focus behavior remains code-native.
- Route candidate: `/color-film/`.
- Campaign/experiment: `wave48_ya_search_color_film_230k_control`.
- Counter: go-only `110584673` with separate Wave48 events and QA exclusion.
- Work remains isolated from production until owner review and launch gate.

## Safe-data and media plan

- Only public business facts and owner-provided, provenanced OHTAAWA media may
  be used.
- No customer identifiers, private account data, raw phones, plates or private
  documents enter generation prompts.
- Generated output is an internal atmospheric or layout target. It is not a
  completed-job photograph, testimonial or factual proof.
- Real front/rear photographs remain the only case-proof media in the first
candidate.
