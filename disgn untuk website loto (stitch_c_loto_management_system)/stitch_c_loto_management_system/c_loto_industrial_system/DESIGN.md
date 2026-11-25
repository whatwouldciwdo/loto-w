---
name: C-LOTO Industrial System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3f4850'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#525f75'
  on-secondary: '#ffffff'
  secondary-container: '#d6e3fe'
  on-secondary-container: '#58657b'
  tertiary: '#b61722'
  on-tertiary: '#ffffff'
  tertiary-container: '#da3437'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#d6e3fe'
  secondary-fixed-dim: '#bac7e1'
  on-secondary-fixed: '#0e1c2f'
  on-secondary-fixed-variant: '#3a475c'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 22px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-code:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.04em
  label-badge:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.02em
  stat-metric:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 32px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-2xs: 0.25rem
  space-xs: 0.375rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

This design system establishes a high-reliability, enterprise-grade industrial monitoring interface tailored for power generation facilities and mission-critical operations. The visual tone balances industrial rigor, operational urgency, and digital precision. It prioritizes clarity of physical isolation status (Lockout / Tagout), fast identification of Kraftwerk-Kennzeichensystem (KKS) equipment codes, and zero ambiguity during shift handovers.

### Design Movement
The style blends **Modern Enterprise Architecture** with **Tactile Industrial Semiotics**:
- High-contrast sidebar navigation anchored in authoritative, nocturnal oceanic tones to reduce fatigue during multi-shift monitoring.
- High-clarity workspace canvas utilizing neutral light gray backgrounds and crisp, compartmentalized white cards.
- Status-driven visual feedback using standard power plant safety colors (Danger Red, Caution Amber, Safety Green, and PLN Electric Cyan) deployed purposefully against neutral backdrops to guide immediate operational response.

## Colors

The palette directly communicates operational status and functional hierarchy in power generation environments:

### Core Identity
- **Primary (`#0284c7`)**: PLN electric cyan blue, representing active control, primary CTAs, active sidebar pills, and selected navigation states.
- **Secondary (`#0b192c`)**: Deep maritime navy, providing high-contrast container surfaces for global sidebar navigation, plant identity markers, and master metrics.
- **Tertiary (`#ef4444`)**: Industrial LOTO Active & Danger red, reserved exclusively for active lockouts, critical hazards, and safety isolation blocks.
- **Neutral (`#64748b`)**: Balanced slate gray for structural borders, secondary labels, and descriptive metadata.

### Industrial Safety Roles
- **Hazard / Locked (`#ef4444` on `#fee2e2`)**: Active LOTO status, emergency alerts, safety lockouts.
- **Pending / Validation (`#f59e0b` on `#fef3c7`)**: Shift handover verification, unapproved LOTO drafts, safety review needed.
- **Safe / Released (`#10b981` on `#d1fae5`)**: LOTO released, system normalized, cleared permits.
- **Information / System (`#0284c7` on `#e0f2fe`)**: Preview badges, non-critical logs, shift tags.
- **Surface Canvas (`#f8fafc`)**: Neutral background backing card containers (`#ffffff`) framed by subtle borders (`#e2e8f0`).

## Typography

The type system is built on **Plus Jakarta Sans**, chosen for its geometric precision, wide aperture, and exceptional legibility across dense data tables and technical alphanumeric strings.

### Usage Standards
- **Equipment Codes & KKS**: Rendered in `label-code` with uppercase styling and slight tracking (`0.04em`) to ensure instant differentiation of complex characters (e.g., `DEMO-KKS-001`, `HRSG 1.1`).
- **Data Densities**: Metrics in stat cards utilize `stat-metric` with tight leading, paired immediately with clear descriptive labels to allow operators rapid glanceability.
- **Hierarchy & Weight Rules**: Strict distinction between headers (700/800 bold) and contextual parameters (400 regular / 500 medium) ensures unambiguous command-and-control workflows.

## Layout & Spacing

### Layout Structure
- **Global Frame**: Two-pane workstation layout. A fixed `260px` deep navy sidebar anchored on the left, paired with an adaptive fluid content workspace on the right.
- **Content Grid**: Fluid 12-column grid system with standard `1.25rem` (20px) gutters between operational modules.
- **Breakpoints**:
  - **Desktop (> 1280px)**: 12-column full layout. KPI row runs across 4 balanced columns; the workspace splits into a 8-column main monitoring table/chart and a 4-column actionable feed/workflow stream.
  - **Tablet (768px - 1279px)**: Sidebar collapses into an icon rail (`72px`). KPI row wraps to 2x2. Main content and secondary side panels stack vertically.
  - **Mobile (< 767px)**: Sidebar shifts to an off-canvas drawer. All summary widgets, filter bars, and LOTO lists stack into a single column with scrollable horizontal sub-tables.

## Elevation & Depth

To prioritize clarity and prevent visual noise in technical plant monitoring, this system relies on **low-contrast architectural framing** over heavy shadows:

- **Level 0 (Workspace Canvas)**: `#f8fafc` flat background.
- **Level 1 (Card Containers)**: Pure white `#ffffff` surfaces bordered by a hairline `#e2e8f0` (1px solid) stroke. Paired with a delicate ambient shadow: `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.05)`.
- **Level 2 (Popovers, Select Menus, Dropdowns)**: Elevated `#ffffff` containers with `box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)` and 1px border.
- **Level 3 (Modal Overlays / Emergency Confirmations)**: Centered containers over a 60% opacity midnight backdrop (`rgba(11, 25, 44, 0.6)`), with `box-shadow: 0 25px 50px -12px rgba(11, 25, 44, 0.25)`.

## Shapes

The UI applies **Roundedness Level 2** (`0.5rem` / `8px` default radius) to convey modern software precision while maintaining gentle, humanized corners suitable for extended industrial desk work:

- **Cards & Data Tables**: `rounded-lg` (`12px` to `16px`) for primary dashboard containers.
- **Buttons, Form Inputs & Filters**: `rounded-md` (`8px`) for strict structural integrity.
- **Status Badges, Shift Avatars & Icon Wells**: `rounded-md` (`6px` to `8px`) or fully circular pills for step trackers and avatar indicators.

## Components

### Buttons
- **Primary CTA**: `#0284c7` solid fill, white text, 8px radius, bold label. Hover state darkens to `#0369a1`.
- **Active Navigation Pill**: In the sidebar, the active link receives a vibrant electric blue background (`#0284c7`), solid white typography, and a left/full highlighted container. Inactive links remain translucent soft blue-gray (`#94a3b8`) on `#0b192c`.
- **Secondary / Action Outlines**: White surface with `#e2e8f0` border, `#0f172a` text, shifting to `#f8fafc` on hover.

### Status Indicators & Badges
- **Active LOTO Badge**: Bordered pill with `#fee2e2` fill, `#b91c1c` text, and a locked padlock icon.
- **Released Badge**: Bordered pill with `#d1fae5` fill, `#047857` text, and a checkmark icon.
- **Validation Badge**: Bordered pill with `#fef3c7` fill, `#b45309` text, and a warning triangle icon.
- **Shift Badges**: Compact square rounded tags (`#e0f2fe` background, `#0284c7` text, 700 bold) denoting shift groups (e.g., "Shift B").

### KPI / Metric Summary Cards
- Composed of an icon well with tinted background (e.g., Red well for Aktif, Green well for Release, Amber well for Validasi, Blue well for Total), large numeric metric (`28px` bold), metric title, and a bottom contextual pill tag (e.g., "Pratinjau (LOTO_2026)").

### Data Table (KKS Register)
- Clean, condensed rows with zebra-free white background, separated by `1px solid #f1f5f9`.
- Column headers in subdued slate (`#64748b`, uppercase, `11px` bold) accompanied by subtle sort chevrons.
- KKS identifier cell rendered in distinctive bold monoline type for zero-misread tolerance.
- Action column with ghost icon buttons for horizontal overflow actions (`...`).

### Workflow / Process Stepper (Alur Proses LOTO)
- Step nodes connected by directional arrows (`→`).
- Each step features a light rounded icon block (e.g., Pengajuan, Isolasi, Verifikasi, Aktif, Release) with active status highlighted in standard safety status colors.