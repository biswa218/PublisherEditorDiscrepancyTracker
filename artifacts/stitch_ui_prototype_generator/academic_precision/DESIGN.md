---
name: Academic Precision
colors:
  surface: '#f7f9ff'
  surface-dim: '#c7dcf4'
  surface-bright: '#f7f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#edf4ff'
  surface-container: '#e3efff'
  surface-container-high: '#d8eaff'
  surface-container-highest: '#cfe5fd'
  on-surface: '#061d2f'
  on-surface-variant: '#44474e'
  inverse-surface: '#1d3245'
  inverse-on-surface: '#e8f2ff'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#465f88'
  primary: '#002046'
  on-primary: '#ffffff'
  primary-container: '#1b365d'
  on-primary-container: '#87a0cd'
  inverse-primary: '#aec7f7'
  secondary: '#00677e'
  on-secondary: '#ffffff'
  secondary-container: '#8ce0fd'
  on-secondary-container: '#00647b'
  tertiary: '#361900'
  on-tertiary: '#ffffff'
  tertiary-container: '#552b00'
  on-tertiary-container: '#eb851c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aec7f7'
  on-primary-fixed: '#001b3d'
  on-primary-fixed-variant: '#2e476f'
  secondary-fixed: '#b5ebff'
  secondary-fixed-dim: '#7ed2ef'
  on-secondary-fixed: '#001f28'
  on-secondary-fixed-variant: '#004e60'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f7f9ff'
  on-background: '#061d2f'
  surface-variant: '#cfe5fd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0em
  body-lg:
    fontFamily: Source Sans 3
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Source Sans 3
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Source Sans 3
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.05em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system establishes an authoritative, institutional, and rigorously functional aesthetic tailored for scholarly publishing workflows. The application targets academic managing editors, production leads, integrity officers, and typesetters handling discrepancies across manuscript ingestion, peer-review transitions, production, and print-to-digital parity.

The design movement blends **Corporate / Modern** editorial utility with **Data-Dense Modernism**:
- **Clarity over decorative flourish:** Layouts prioritize scannability, vertical rhythm, and information hierarchy over ornamental design.
- **Academic rigor:** Visual cues mirror scholarly precision—crisp micro-borders, unambiguous categorical signposting, high legibility across dense data tables, and structured audit trails.
- **Productive calm:** Interface chrome recedes into cool architectural slates and navy anchors, allowing operational metrics, status alerts, and defect workflows to demand calibrated attention.

## Colors

The palette balances historical publishing authority with technical utility.

### Role Assignments
- **Primary (`#1B365D` - Scholarly Navy):** Headers, navigation surfaces, dominant structural elements, primary command buttons, and major section banners. A deeper anchor tone (`#0F2537`) serves as the primary text color and persistent sidebar shell.
- **Secondary (`#00758F` - Academic Cyan/Teal):** Interactive affordances, links, active tab underlines, focused rings, and secondary action highlights.
- **Tertiary (`#D97706` - Amber/Gold):** Medium severity alerts, triaged states, priority queues, and pending review flags.
- **Functional Semantics:**
  - **Defect/Critical (`#DC2626` - Crimson):** High-severity flags, publication-blocking issues, SLA breaches, and rejection markers.
  - **Success/Verified (`#059669` - Emerald):** Resolved states, verified author approvals, parity checks passed, and positive metrics.
  - **Neutral Surfaces:** Canvas background uses `#F8FAFC`, card surfaces sit on `#FFFFFF`, with borders and dividing rules rendered strictly in `#E2E8F0` and muted secondary borders in `#CBD5E1`.

### Data State Badges & Status Mapping
- `NEW`: Background `#EFF6FF`, Border `#BFDBFE`, Text `#1E40AF`
- `TRIAGED`: Background `#FEF3C7`, Border `#FDE68A`, Text `#92400E`
- `ASSIGNED`: Background `#F0FDFA`, Border `#99F6E4`, Text `#115E59`
- `IN PROGRESS`: Background `#F3F4F6`, Border `#E5E7EB`, Text `#374151`
- `RESOLVED`: Background `#ECFDF5`, Border `#A7F3D0`, Text `#065F46`
- `VERIFIED`: Background `#E0F2FE`, Border `#BAE6FD`, Text `#0369A1`
- `CLOSED`: Background `#F1F5F9`, Border `#CBD5E1`, Text `#475569`

## Typography

The type scale marries structural discipline (`Inter`) with editorial readability (`Source Sans 3`).

- **Hierarchy & Application:** Headings use Inter to provide mechanical clarity on data dashboards and analytical views. Body text uses Source Sans 3, whose humanist terminals reduce eye fatigue during long reading sessions of discrepancies, reviewer commentary, and proof annotations.
- **Tabular Figures:** All numeric displays (table cells, timestamp markers, SLA countdowns, and metric cards) must enforce `font-feature-settings: "tnum" 1` to guarantee precise visual alignment across rows and columns.
- **Monospace Inclusion:** JetBrains Mono is designated for DOI identifiers, manuscript hashes, XML element tags, and typesetter file paths.
- **Transformations:** All `label-sm` tokens deployed within badge or status contexts enforce `text-transform: uppercase` to maintain sharp boundaries against data values.

## Layout & Spacing

This design system uses a 12-column fluid grid system optimized for data density on desktop workstations while remaining fully responsive across smaller viewports.

- **Layout Grid Models:**
  - **Desktop (>= 1280px):** Fixed navigation sidebar (260px wide) paired with a 12-column fluid content area. Max content constraint capped at 1600px for table readability; margins set to `margin-lg` (32px), gutters set to `gutter-lg` (24px).
  - **Tablet (768px – 1279px):** Collapsible sidebar (64px mini-rail). 8-column fluid canvas; margins set to `margin-md` (24px), gutters to `gutter` (16px).
  - **Mobile (< 768px):** Off-canvas slideover drawer. 4-column fluid container; margins set to `margin` (16px), gutters to `gutter` (16px). Horizontal table scrolling enabled via explicit sticky indicator columns.
- **Density Rhythms:**
  - Metric row cards span 3 columns on desktop, 6 columns on tablet, 12 columns on mobile.
  - Data workspace utilizes a vertical step scale of `space-xs` (4px) and `space-sm` (8px) for within-component packing, reserving `space-lg` (16px) and `space-xl` (24px) strictly for section boundaries.

## Elevation & Depth

Visual hierarchy relies on **low-contrast outlines combined with structured tonal layers** rather than dramatic drop shadows. This preserves the dry, reliable precision expected of an academic enterprise environment.

- **Level 0 (Canvas):** Tone `#F8FAFC`. Unbordered background.
- **Level 1 (Cards & Work Panels):** `#FFFFFF` surface enclosed in a 1px border of `#E2E8F0`. No shadow.
- **Level 2 (Hovered Cards & Table Row Hovers):** `#FFFFFF` surface, 1px border transition to `#CBD5E1`, with subtle ambient shadow: `0 1px 3px 0 rgba(15, 37, 55, 0.04), 0 1px 2px -1px rgba(15, 37, 55, 0.04)`.
- **Level 3 (Dropdowns & Contextual Menus):** `#FFFFFF` surface, 1px border `#CBD5E1`, shadow: `0 4px 6px -1px rgba(15, 37, 55, 0.07), 0 2px 4px -2px rgba(15, 37, 55, 0.05)`.
- **Level 4 (Modals & Slide-out Inspection Drawers):** `#FFFFFF` surface, 1px border `#94A3B8`, shadow: `0 20px 25px -5px rgba(15, 37, 55, 0.12), 0 8px 10px -6px rgba(15, 37, 55, 0.08)`. Backdrops use `#0F2537` set to 40% opacity with a subtle `backdrop-filter: blur(2px)`.

## Shapes

The design system enforces a **Soft (`1`)** shape language:
- **Base Geometry (`rounded` / 0.25rem - 4px):** Applied to form inputs, table badges, workflow pills, buttons, and individual data tags. This creates sharp, controlled interfaces that look deliberate and enterprise-grade.
- **Secondary Containers (`rounded-lg` / 0.5rem - 8px):** Applied to metric summary cards, audit log containers, data tables, and slide-in panels.
- **Dialogs & Overlay Containers (`rounded-xl` / 0.75rem - 12px):** Reserved solely for global modal dialogs and taxonomy selection trees.
- Circular radii (`rounded-full`) are strictly restricted to user avatar fallbacks, numeric table counters, and workflow step state indicators.

## Components

### Buttons
- **Primary:** Background `#1B365D`, border 1px solid `#1B365D`, text `#FFFFFF`, radius `4px`, padding `6px 14px`. Hover: `#0F2537`. Focus: ring 2px `#00758F` with 2px offset.
- **Secondary:** Background `#FFFFFF`, border 1px solid `#CBD5E1`, text `#0F2537`, radius `4px`, padding `6px 14px`. Hover: background `#F8FAFC`, border `#94A3B8`.
- **Destructive:** Background `#DC2626`, border 1px solid `#DC2626`, text `#FFFFFF`, radius `4px`. Hover: `#B91C1C`.
- **Subtle / Ghost:** Background transparent, text `#1B365D`, padding `6px 10px`. Hover: background `#F1F5F9`.

### Badges & Status Tags
- Height: 20px, font: `label-sm`, tracking uppercase, padding: `2px 6px`, radius: `4px`.
- Must pair an explicit icon glyph (or dot marker) alongside the text label for color-blind accessibility.

### Input Fields & Search Controls
- Height: 32px for compact table filters, 36px for standard form inputs.
- Background: `#FFFFFF`, border: 1px solid `#CBD5E1`, text: `#0F2537`, font: `body-md`.
- Placeholder: `#94A3B8`. Active/Focus: border `#00758F`, outline 1px solid `#00758F`.
- Error: border `#DC2626`, text `#DC2626`.

### Checkboxes & Radio Controls
- Square 16px × 16px with 2px corner radius for checkboxes; circular 16px for radio.
- Inactive: border 1px solid `#94A3B8`, background `#FFFFFF`.
- Checked: border `#1B365D`, background `#1B365D`, white checkmark or inner dot.

### Data Tables (Dense Editorial Layout)
- **Header:** Height 36px, background `#F8FAFC`, border-bottom 1px solid `#CBD5E1`. Font: `label-md`, text: `#475569`, text-align left.
- **Row:** Height 44px (default) or 36px (compact toggle). Border-bottom 1px solid `#E2E8F0`. Hover state background: `#F1F5F9`. Selected row background: `#F0FDFA`.
- **Cell Content:** Font: `body-md` (Source Sans 3). Numerical data set to JetBrains Mono or tabular figures.

### Metric Cards
- Background `#FFFFFF`, border 1px solid `#E2E8F0`, padding `16px`, radius `8px`.
- Structure: Micro-label (`label-md`, `#64748B`), Primary Metric Value (`headline-lg`, `#0F2537`), Trend indicator container with inline micro-pill (e.g., `+4.2%` with emerald upward arrow or `-1.8%` with crimson downward arrow).

### Workflow Step Trackers
- Horizontal segmented rail connecting circular status markers (24px).
- Completed: filled `#059669` circle with white check icon. Connecting line `#059669` (2px).
- Current Active: `#1B365D` outline (2px) with `#1B365D` centered dot and bold text label (`label-md`).
- Upcoming: `#CBD5E1` outline (1.5px) with `#94A3B8` step number. Connecting line `#E2E8F0` (2px).

### Root Cause Taxonomy Tags
- Segmented pills representing hierarchical error taxonomies (e.g., `Metadata > CrossRef > DOI Mismatch`).
- Background `#F1F5F9`, border 1px solid `#E2E8F0`, text `#334155`, font `code-sm`, padding `2px 6px`. Chevron separator icon tinted with `#94A3B8`.