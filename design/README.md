# WheresMaldives design kit

## Approved direction — Atoll Atlas

**Owner decision: 11 November 2026.** Direction A, Atoll Atlas, is the selected public discovery direction. It is an atoll-first, photography-led directory with prominent search, compact filters and property cards. The atoll is the primary organizing geography; island and property type refine the results. The editorial publication remains part of the same site, not a separate booking product.

## Brand and rationale

- Ocean ink anchors the masthead, display type and primary action.
- Lagoon is the interactive accent for links and selected controls.
- Paper and white provide calm editorial surfaces; sand is reserved for subtle structure.
- Red Hat Display carries headlines; Red Hat Text carries interface and reading copy.
- Photography is used only when approved media is present. No invented resort images, facts, star ratings, availability or pricing.
- Where no verified property records exist, the UI says so clearly rather than showing sample hotels.

## Kit files

- `tokens.css`: the only source of raw colors, type, spacing, radii, elevation, motion, z-index and control dimensions.
- `kit.css`: reusable public primitives composed only from tokens.
- `src/app/globals.css`: imports the kit and maps tokens to Tailwind's theme aliases.

## Direction A hierarchy

1. Editorial masthead with concise navigation.
2. Atoll Atlas hero: clear visitor promise and search by property, island or atoll.
3. Compact, composable filters: atoll, island, property type and verified facilities.
4. Photography-led property cards with island/atoll context and source-backed details.
5. Trust language distinguishes verified information from live rates or availability, neither of which is offered.

## Screen jobs

| Visitor job | Route | One question | Primary action |
|---|---|---|---|
| Find a stay | `/hotels` | Which verified properties match my filters? | Open a property |
| Evaluate a property | `/hotels/[slug]` | What can I verify about this property and where is it? | Visit its official website |
| Understand geography | `/destinations` | Which atolls can I explore? | Open an atoll |
| Explore an atoll | `/atolls/[slug]` | Which islands and published stays are here? | Open an island or property |
| Explore an island | `/islands/[slug]` | What verified stays and guides are on this island? | Open a property or guide |

## Accessibility and motion

- All filters use native labels and controls; the filter form works without client JavaScript.
- Focus is visible; links and controls retain keyboard access.
- State is expressed in text as well as color.
- Reduced-motion preferences disable transitions and smooth scrolling.
- Images require meaningful alt text supplied by approved media records.
- No result count, review score, star classification or booking availability is inferred.

## Known limitation

The Figma draft contains editable desktop specimens but the initial visual QA pass did not complete. The owner has since selected Direction A. App screens are therefore built from this approved direction and the token kit; screenshots at 1440, 768 and 390 remain a required follow-up before calling the screen stage complete.
