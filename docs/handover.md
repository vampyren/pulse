# ──────────────────────────────────────────────────────────────────────────────
# Append updates to docs/FEATURES_ROADMAP.md (no removals)
# ──────────────────────────────────────────────────────────────────────────────
cat >> ~/App/pulse/docs/FEATURES_ROADMAP.md <<'EOF'

---

## UI Kit Standardization — Version: v0.1.0 (Aug 14, 2025)
**Goal:** every dropdown, button, badge, and popover looks/behaves the same across the app.

**Rules**
- Use shared components only: `Button`, `Chip`, `Popover` (`Popover`, `PopoverTrigger`, `PopoverContent`), `PrivacyBadge`.
- No raw `<button>` or `<select>` styling in pages — wrap them with the shared components.
- Mobile-first paddings, rounded corners `rounded-2xl`, subtle borders `border-gray-200`, and hover/active states.
- Keep interactions consistent: popovers close on choose/tap-outside; keyboard focus rings enabled.

**Status:** Adopted in `LanguageMenu`, Discover filter header, and theme toggle.  
**Next:** Migrate “Me” menu, admin pages, and any ad-hoc dropdowns.

---

## Discover Filters (Read-only) — Version: v0.8.0 (Aug 14, 2025)
**Done**
- Compact header with **three controls**:
  - **All** — resets privacy = `all`, clears selected sports, clears city input.
  - **Privacy** popover — single select: *All / Public / Friends / Invite*.
  - **Activity** popover — multi-select *sports*.
- **City filter** (row 2): single input with **debounce**, “Clear” on the right.
- State persisted in `localStorage`; no list flicker during fetch (tiny spinner by count).
- Cards are lean; **rich info lives on `/groups/:id`**.

**Planned (short-term)**
- Show a tiny count badge on Activity (e.g., “Activity (2)”).
- Optional city “contains” search (backend `LIKE '%term%'`) — behind a flag.
- Multi-city chips (frontend) using the new backend `city_in` (see Data Model note).

**Planned (mid-term)**
- Sorting (Newest, Most active) and pagination.
- Save named filter presets per user (e.g., “My Malmö tennis”).

---

## Group Detail (Design Direction) — Version: v0.2.0 (Aug 14, 2025)
**MVP**
- Header: name, sport, city, privacy badge.
- Sections:
  - **Members** (count + avatars) → tap to open full list (roles: owner/admin/member).
  - **Upcoming activities** (date, slots, price) → tap to expand; join/request inline.
  - **About** (description/details).

**Later**
- Member skills & ratings; flag flow (users can report; stores in `flags`).
- Invite flow (friends only), requests/invites inbox (admin).
- Audit trail (basic) for admin review.

---

## Language & Theme — Version: v0.1.0 (Aug 14, 2025)
**Done**
- Top-right controls using the same Popover UI kit.
- Language dropdown (EN/SV) and Theme toggle (sun/moon) are responsive.

**Next**
- Persist language/theme per user when signed in (fallback: localStorage).
- Extract text content to locales file; begin SV strings.

---

## Admin / Dev Tools — Version: v0.1.0 (Aug 14, 2025)
**Seed**
- Rich demo dataset for groups/activities/friendships/messages to support UI.
- `meta.seed_version` records last seed run.

**Next**
- Minimal admin “Reseed” action (protected) that triggers seed script safely (read-only confirmation UI first).

---

## Quality / Performance — Version: v0.1.0 (Aug 14, 2025)
- Keep hooks ordered before any early return (avoid React invariant #310).
- Avoid flicker: keep list while fetching, show tiny spinner near count.
- Store only compact filter state in `localStorage`.
- Consider SQLite indices (doc only): `groups(city)`, `groups(sport_id, privacy)` for future scaling.

EOF


# ──────────────────────────────────────────────────────────────────────────────
# Append updates to docs/DATA_MODEL.md (no removals)
# ──────────────────────────────────────────────────────────────────────────────
cat >> ~/App/pulse/docs/DATA_MODEL.md <<'EOF'

---

## API Notes — Groups Filtering (Aug 14, 2025)
**Version: v0.2.2** (no schema changes)

### Endpoint
`GET /api/v2/groups`

### Supported query params
- `privacy` — one of `public | friends | invite` (omit or use `all` to include everything).
- `sport` — comma-separated list of sport ids. Example: `sport=tennis,padel`.
- `city_like` — case-insensitive **prefix** match. Example: `city_like=Mal` → *Malmö*.
- **NEW** `city_in` — comma-separated list of **exact** city names (case-insensitive).  
  Example: `city_in=Malmö,Stockholm`.

> If both `city_in` and `city_like` are provided, **`city_in` takes precedence** (exact filter is applied).

### Examples
