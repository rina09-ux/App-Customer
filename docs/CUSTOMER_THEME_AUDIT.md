# NusaSec Customer — Total Theme, Routing & Data-Hygiene Audit

## Scope

Audited the Customer application shell, theme engine, shared navigation, route dispatcher, view inventory, developer/security views, billing modal, stylesheet stack, command palette, source-level demo data, and deployment configuration. The review was repeated after the first remediation pass to catch regressions introduced by global theme overrides and stale legacy UI code.

## Theme architecture

The runtime theme engine is `ThemeContext` with `light`, `dark`, and `system`. `system` follows the browser/OS `prefers-color-scheme` value. The runtime visual source of truth is `src/design-system.css`, followed by the targeted `src/theme-qa-overrides.css` compatibility layer.

`src/index.css` is theme-neutral. The retired `src/light-theme.css` compatibility file has been removed after its verified page-specific exceptions were migrated into the QA layer.

## Repeated functional findings and remediation

1. SDK selection previously compared package names, causing Python and Rust (`nusasec-pqc`) to be selected together. Selection now uses a unique SDK identity.
2. Data Explorer query results previously mixed dark text with light surfaces. Result table, query editor, and primary action now follow the active theme.
3. PQC Readiness contained a dark-only hero gradient and white text that became unreadable in Light Mode. The hero now has a verified Light semantic treatment while preserving the Dark treatment.
4. Developer/security code surfaces had conflicting Light/Dark treatment. Verified page-specific Light rules were migrated from the retired stylesheet into the QA layer.
5. A global `bg-slate-900/950` bridge was recoloring intentional dark micro-surfaces such as the toast, navigation tooltips, avatar, and technical previews. Targeted exceptions were added instead of broadening the global override.
6. Several legacy status colors lacked Dark-mode semantic mappings. Dark status mappings were added centrally.
7. The document body kept a fixed Light background outside the app canvas. Root body/theme rules now switch with Light/Dark/System so outer gutters do not remain Light in Dark mode.
8. `notifications` existed in navigation/types and in `OtherViews`, but the route dispatcher had no explicit `notifications` case. The dispatcher now renders the notifications view explicitly.
9. The Command Palette now covers the active Customer navigation surface, including security, trust, data, PQC, developer, GitHub, organization, billing, settings, and notifications.
10. `OtherViews` contained large legacy branches with secrets, credential-like mock values, fake integrations, scanner state, and unrelated views that were no longer part of the active Customer routing surface. It has been reduced to the active Notifications view, eliminating that stale attack/data-hygiene surface.
11. `OrganizationView` contained personal-looking identity/email data in demo state. It now uses generic demo identities (`example.com`) so the public UI repository does not carry personal contact data.
12. `UpgradeModal` contained hard-coded customer identity, tax, phone, card, CVC, VA, and payment details and presented client-side payment completion as if it were a live transaction. It has been replaced with a backend-safe billing intent flow: customer fields are entered at runtime, payment credentials are not stored in source, and the UI explicitly refuses to claim a production payment until a real Core/gateway integration exists.

## Deployment consistency

The repository has one canonical Pages workflow at `.github/workflows/pages.yml`. It uses the committed `bun.lock`, `bun install --frozen-lockfile`, and the Customer Pages base path.

## Current residual engineering boundary

The remaining production work is no longer a UI bug: the Customer needs a real authenticated Core session and backend-backed data contracts for billing, organization/RBAC, notifications, and other operational telemetry. Until those contracts are wired, demo datasets must remain clearly labeled as demo data and must never be presented as proof of live security controls.

## Verification boundary

Source-level audit and remediation are complete for this pass. A green GitHub Actions build/deployment remains the authoritative evidence for the live Pages artifact; source inspection alone is not treated as proof that the currently deployed artifact has updated.
