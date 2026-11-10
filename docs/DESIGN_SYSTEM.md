# WheresMaldives.com — Design Direction

Version 1.0 | Direction baseline; validate with Taste Skill before final tokens.

## Brand expression
Premium editorial hospitality media: worldly, composed, independent, contemporary and connected to the Maldives. Working line: **The Maldives. Beyond the Ordinary.** Avoid generic booking UI, SaaS-looking public pages, overused gradients, excessive glass effects and motion that competes with content.

## Principles
1. Photography is an editorial asset, not decoration.
2. Typography establishes hierarchy and voice.
3. Editorial layouts have deliberate pacing and asymmetry only where useful.
4. Strong grid, consistent edges and disciplined spacing.
5. Colour is intentional and contrast-safe.
6. Motion is subtle and respects reduced-motion.
7. Public discovery and admin share tokens but use different information density.
8. Mobile layouts are composed intentionally.

## Initial palette proposal
These are starting directions only; Taste Skill must help produce and validate final tokens.
| Token | Proposal | Use |
|---|---|---|
| Ocean ink | `#102F43` | Brand depth, headings, navigation |
| Lagoon | `#2C8991` | Accent, links, selected states |
| Sand | `#E9E2D4` | Warm neutral surfaces |
| Paper | `#FAF9F6` | Editorial background |
| White | `#FFFFFF` | Cards and clean surfaces |
| Ink | `#17232B` | Body text |
| Muted | `#68747B` | Secondary text |

Validate text/background combinations for WCAG AA and adjust as needed.

## Typography
Pair a distinctive editorial display face with a highly legible sans-serif for interface and body. Use no more than two primary families unless justified by data/utility needs. Validate weights, language support and loading performance.

## Photography
Use authentic Maldives imagery: resorts, atolls, local islands, people, boats, aviation, marine life and hospitality. Preserve photographer/source attribution. Use licensed or permissioned assets only. Art-direct crops by breakpoint. Avoid repeated generic tropical stock. Provide meaningful alt text; decorative images use empty alt.

## Public patterns
Editorial masthead and compact navigation; lead story; article cards with category/date; feature photography; readable article measure; property cards with useful facts; destination breadcrumbs; consent-aware newsletter; paid placements visibly distinct from editorial recommendations.

## Admin patterns
A functional editorial tool, not a marketing page: compact density, clear statuses, keyboard access, robust tables/filters, safe bulk actions and destructive confirmations. Core screens: dashboard; article list/editor/review; media library; property list/editor; destination management; enquiry inbox; user/role management.

## Taste Skill workflow
Install current skill:
```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```
Follow current upstream instructions and project-start/inspection commands. Upstream documentation requires Node.js 22+ and Chrome, Edge or Chromium for browser inspection. Set `CHROME_PATH` only if required. Adapt generated direction to the WheresMaldives brand, actual content model, accessibility and product needs. PE MCP `ui-design` remains mandatory; Taste Skill supplements it.

## Visual validation
Inspect at 1440px, 1024px, 768px and 390px. Check edges, overflow, typography, image focal crop, navigation, keyboard focus, reduced motion, contrast, loading/empty states and admin table/form usability. Attach screenshots for significant UI PRs.
