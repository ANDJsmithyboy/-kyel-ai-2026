# Visual Grammar — Ñkyel AI

## Design Language

The Visual Workspace uses a consistent grammar of shapes, colors, and edges to communicate meaning without requiring labels to be read.

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Gold | `#C0A062` | Goals, decisions, brand accent |
| Blue | `#6B8AE0` | Plans, tasks |
| Purple | `#9B72CF` | Agents, scenarios |
| Teal | `#5BA3B5` | Tool calls, artifacts |
| Green | `#6EB86E` / `#4CAF50` | Sources, evidence |
| Amber | `#E8A838` | Claims, approvals |
| Pink | `#CF72A8` | Hypotheses |
| Red | `#E57373` | Errors |
| Grey-blue | `#90A4AE` | Checkpoints |

## Status Indicators

| Symbol | Status |
|--------|--------|
| ○ | Pending |
| ◉ | Active |
| ● | Completed |
| ✕ | Failed |
| ⊘ | Cancelled |
| ◈ | Blocked |
| ⊙ | Waiting approval |

## Edge Styles

| Relationship | Color | Style |
|-------------|-------|-------|
| `decomposes_into` | Blue | Solid |
| `supports` | Green | Solid |
| `contradicts` | Red | Dashed |
| `depends_on` | Amber | Animated |
| `assigned_to` | Purple | Animated |
| `derived_from` | Pink | Dotted |
| `produces` | Green | Solid |

## Provenance Badges

Every node displays a small badge indicating content origin:
- `generated` — Created by AI
- `retrieved` — Fetched from external source
- `user_provided` — Entered by the user
- `verified` — Cross-checked
- `simulated` — Hypothetical/projected
- `calculated` — Computed deterministically

## Accessibility

- No information conveyed by color alone (icons + labels always present)
- Focus-visible outlines on all interactive elements
- `prefers-reduced-motion` disables animations
- Full keyboard navigation
- Screen reader announcements for node creation/updates
