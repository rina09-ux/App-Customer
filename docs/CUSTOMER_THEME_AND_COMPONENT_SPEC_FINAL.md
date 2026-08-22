# NusaSec Customer — Final Theme & Component Consistency Specification

Status: **Design contract for implementation**

This specification is based on the current Customer application inventory and a comparative review of mature enterprise design-system guidance from Carbon, Atlassian, and Material Design.

## 1. Core principle

The same semantic role must look the same everywhere. A theme changes token values, not the meaning of the role.

Do not use raw colors as design decisions in components. Components choose a semantic role; Light and Dark themes supply the value.

Examples:
- Primary action -> `primary`
- Current navigation -> `navigation-active`
- Selected filter -> `selection`
- Success -> `success`
- Warning -> `warning`
- Critical -> `danger`
- Informational -> `info`
- AI-generated/AI-assisted -> `ai`
- Disabled -> `disabled`
- Neutral information -> `surface-muted`

## 2. Theme philosophy

### Light
Enterprise, calm, readable, information-dense without glare.

- Canvas: `#F4F7F9`
- Surface: `#FFFFFF`
- Surface alternate: `#F8FAFC`
- Surface muted: `#EEF3F6`
- Panel/navigation: `#E8F0F3`
- Border: `#D6E0E6`
- Strong border: `#BFCDD5`
- Primary text: `#17212B`
- Secondary text: `#465866`
- Muted text: `#6F7F8C`
- Primary brand: `#0C6F7A`
- Primary hover: `#09545F`
- Brand soft: `#E4F3F5`

### Dark
Security/SOC-oriented, low-glare, layered rather than flat black.

- Canvas: `#020617`
- Surface: `#0F172A`
- Surface alternate: `#111C2D`
- Surface muted: `#172033`
- Panel/navigation: `#152033`
- Code/technical: `#0B1220`
- Border: `#334155`
- Strong border: `#475569`
- Primary text: `#F8FAFC`
- Secondary text: `#CBD5E1`
- Muted text: `#94A3B8`
- Primary brand: `#2563EB`
- Primary hover: `#1D4ED8`
- Brand soft: `#172554`

The hue of a semantic role must not change its meaning between themes. Theme values may change for contrast, luminance, and readability.

### Auto / System
Auto does not create a third visual language. It selects the Light or Dark token set from the operating-system preference.

## 3. Surface/layer contract

Every page uses the same layering model.

### Level 0 — Canvas
Entire page background. Never used for cards, controls, or information boards.

### Level 1 — Surface
Cards, primary panels, tables, dialogs.

### Level 2 — Surface Alternate
Nested panels, secondary sections, filters, table headers, side information.

### Level 3 — Surface Muted
Small neutral blocks, icon tiles, field groups, subtle containers.

### Level 4 — Technical Surface
Only for code, command output, terminal-like content, and intentionally SOC-technical views.

Do not create arbitrary fifth/sixth surface levels merely by changing a Tailwind gray.

## 4. Text hierarchy

Every text instance must have one semantic role:

- `text-primary`: page titles, important values, card headings
- `text-secondary`: body copy, descriptions, normal labels
- `text-muted`: metadata, timestamps, helper text
- `text-inverse`: text on primary/selected/critical-solid controls
- `text-disabled`: disabled controls
- `text-link`: navigational/action links

Do not use white text simply because a component happens to have a dark background. Use `text-inverse` only when the surface is explicitly inverse/solid.

## 5. Buttons

### Primary
One action that represents the main next step.

- Solid brand
- White text
- Brand hover
- Brand focus ring

### Secondary
For alternative actions.

- Surface
- Border
- Secondary text
- Surface alternate hover

### Tertiary / Text
No container unless needed for grouping.

### Destructive
Danger role. Never use brand blue/teal for destructive confirmation.

### Disabled
Muted surface + muted text + no hover/focus effect.

## 6. Selection and navigation

Selection must be predictable.

### Navigation active
Use `navigation-active` everywhere: Sidebar, IconRail, tabs, section switchers.

### Selected filter/card/SDK/framework
Use `selection` role. Do not use transparent selected states if the user must clearly understand what is chosen.

### Unselected
Neutral surface + border or transparent, depending on component type.

### Keyboard focus
Use a visible focus ring on every interactive control. Do not rely only on color change.

## 7. Information boards / callouts

Information boards are semantic, not decorative.

- Neutral -> `surface-muted`
- Info -> `info`
- Success -> `success`
- Warning -> `warning`
- Critical -> `danger`
- AI -> `ai`

Each board must have:
1. icon or visual marker,
2. title/label,
3. supporting information,
4. readable border/background pairing.

Do not mix a green border with a blue title or a purple background with unrelated blue action styling unless the content has two distinct semantics.

## 8. Status colors

Use status colors only when they communicate status.

- Success = green/teal family
- Warning = amber
- Danger = red/rose
- Info = cyan/sky
- AI = purple

Status colors must be used consistently in text, icon, badge, border, and soft background variants.

## 9. Badges / chips / tags

### Read-only tag
Soft background + semantic text + subtle border.

### Selected tag
Solid brand + inverse text.

### Status tag
Semantic soft background + semantic text + semantic border.

Never use a solid dark/black badge simply because the page is Dark Mode.

## 10. Forms

All `input`, `select`, `textarea`, checkbox, radio, range and native options follow the same contract.

- Surface background
- Theme border
- Theme text
- Muted placeholder
- Brand focus
- Semantic selected state
- Disabled muted state

Native `option` colors must also follow the active theme.

## 11. Tables and data grids

- Table shell = surface
- Header = surface alternate
- Row = surface
- Divider = border subtle
- Hover = brand soft/neutral hover
- Selected = selection
- Critical row marker = danger
- Numeric values = primary text when important
- Metadata = muted

Do not use white text on dark rows in Light Mode or dark text on dark rows in Dark Mode.

## 12. Metrics / KPI cards

Metrics use hierarchy, not a rainbow of card backgrounds.

- Card = surface
- Metric number = primary text
- Label = secondary text
- Supporting period/context = muted
- Status = semantic badge or marker
- Trend = success/warning/danger only when semantically meaningful

Accent should be limited to the icon/indicator unless the card represents a clearly selected state.

## 13. Charts

Chart palette is semantic and consistent:

1. Primary series -> brand
2. Secondary series -> info/AI depending on meaning
3. Positive -> success
4. Warning -> warning
5. Critical -> danger
6. Neutral comparison -> muted

Grid lines use border-subtle. Axis labels use muted text. Never use random bright colors solely to differentiate series.

## 14. Security-specific components

### Threat Radar
Technical density may be high, but its surrounding surface follows the normal theme. Alert colors remain semantic.

### Risk Exposure
Risk score -> danger/warning/success based on threshold. Neutral explanatory text remains secondary/muted.

### Attack Paths
Graph canvas may use a technical surface. Nodes must use node semantics. Selected node is clear and high-contrast. Inspector panel follows standard surface layering.

### Compliance
Framework/category selected state is explicit and unmistakable. Compliance status uses success/warning/danger, not arbitrary brand colors.

### Evidence
Evidence type is neutral; validation status is semantic.

## 15. PQC / Developer surfaces

Developer views are information-dense but must obey the same theme contract.

- Code block -> technical surface
- Language/SDK category -> neutral or selected brand
- Version -> secondary/muted badge
- API status -> semantic status
- Environment -> neutral/semantic state
- Copy action -> secondary/primary depending on importance

Do not make an entire developer page dark in Light Mode. Only code/terminal regions may remain technical-dark if explicitly intentional.

## 16. AI elements

AI receives a dedicated semantic role: purple.

AI purple is used for:
- AI label
- AI-generated indicator
- AI explainability affordance
- AI-specific status/badge

AI does not replace primary actions. Primary actions remain brand.

## 17. Modal / dialog / drawer / tooltip / toast

### Modal/dialog
Surface + border + elevation appropriate to theme.

### Overlay
Theme-independent translucent dark blanket.

### Tooltip
Inverse/high-contrast role is allowed and should remain readable in both themes.

### Toast
Inverse/high-contrast role or semantic status variant.

Nested content inside a dialog must inherit the dialog theme instead of reverting to white or black.

## 18. Empty/loading/error states

### Empty
Neutral surface, primary title, secondary description, optional muted icon.

### Loading
Muted text + subtle progress/spinner using brand.

### Error
Danger semantic treatment with clear explanation and next action.

## 19. Shared shell

Sidebar, IconRail, header, mobile drawer and command/search affordances must use the same navigation and surface roles across every page.

A page must never appear to belong to a different product because its shell uses a different blue, gray, black, or card treatment.

## 20. Interaction state matrix

Every interactive component must define:

- default
- hover
- focus-visible
- pressed
- selected
- disabled
- loading
- error (when applicable)

The state should change predictably without changing the component's semantic meaning.

## 21. Implementation rule

No new component may introduce a raw color for UI meaning when a semantic token exists.

Allowed exceptions:
- actual brand asset color,
- chart data-viz palette with a documented semantic role,
- technical code syntax highlighting,
- inverse tooltip/toast,
- intentionally high-contrast overlay.

## 22. Quality gate

A theme pass is not complete when the page background looks correct. It is complete only when all nested elements follow the same semantic contract.

For every menu, verify:
1. page canvas,
2. page header,
3. filters,
4. cards,
5. buttons,
6. tabs,
7. badges,
8. tables,
9. information boards,
10. status indicators,
11. forms,
12. modal/overlay,
13. tooltips/toasts,
14. hover/focus/selected/disabled,
15. nested panels.

## 23. Research basis

This specification follows the principles used by mature design systems:

- Carbon recommends role-based color tokens so the same role maps to different theme values, rather than using hard-coded colors; it also uses a layering model to create depth in light and dark themes. citeturn105582search1turn105582search3
- Carbon explicitly notes that hard-coded values do not change when themes switch and therefore tokens are required throughout the product. citeturn105582search1
- Carbon's guidance for tags, selected states, disabled states, and focus states uses semantic/component tokens and requires theme-specific contrast treatment. citeturn105582search5turn105582search3
- Atlassian similarly recommends hovered/pressed/selected/focused/disabled tokens and WCAG-oriented contrast checks in both themes. citeturn105582search6turn105582search2
- Material Design 3 is a current open design-system reference for adaptable, consistent components, including progress, toolbars, buttons and related states. citeturn947417search0
- Nielsen Norman Group's dashboard examples emphasize information hierarchy, grouping, logical scanning, and restrained color so high-priority alerts remain salient rather than every element competing for attention. citeturn947417search1
