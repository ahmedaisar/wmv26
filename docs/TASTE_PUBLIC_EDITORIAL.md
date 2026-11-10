# Public editorial Taste Skill deal

The public publisher page was dealt with the pinned Taste Skill 2.5.1 at commit `f6b76575f949707b4e3c37cd86cb44b0b98643e8`, using page kind `service` and closest available trade `agency` (there is no publisher/media trade in the current dealer).

## Selected first deal

- Palette: `blush-sage-slate`
  - Ground: `#a6b3bc`
  - Surface: `#b2bdc5`
  - Ink: `#1c1c1c`
  - Accent: `#2c3620`
- Type: `red-hat`
  - Display: Red Hat Display
  - Text: Red Hat Text
- Moment: `pinned-chapters`

The palette and type are the first outputs of the agency/service deal, as required by the skill. The existing WheresMaldives brand direction is retained through its restrained editorial composition and content hierarchy; the dealt olive is the accent and the slate palette supplies the neutral ground.

## Applied in this increment

- CSS brand tokens updated to the selected palette.
- Red Hat Display and Red Hat Text loaded as the display and reading families.
- Existing responsive editorial layout and image framing retained.

## Deliberate limitation

The dealt `pinned-chapters` moment was not added to the first public newsroom increment. It introduces a scroll-controlled chapter interaction that is not yet supported by the real content model or authored photography; inventing a faux chapter sequence would make the publisher page feel like a marketing microsite rather than a credible newsroom. Revisit when the first photo-led long-form feature has three genuine editorial chapters. The Taste deal ran in CI and its output is attached as the `taste-public-editorial-deal` artifact.

The browser gate in this CI workflow currently targets the protected admin sign-in screen, not the public publisher pages. Public desktop/tablet/mobile visual review remains an explicit release check.
