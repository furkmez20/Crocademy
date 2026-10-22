---
name: StudyPilot Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3d4a3d'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6d7b6c'
  outline-variant: '#bccbb9'
  surface-tint: '#006e2f'
  primary: '#006e2f'
  on-primary: '#ffffff'
  primary-container: '#22c55e'
  on-primary-container: '#004b1e'
  inverse-primary: '#4ae176'
  secondary: '#446900'
  on-secondary: '#ffffff'
  secondary-container: '#b2f746'
  on-secondary-container: '#496f00'
  tertiary: '#755935'
  on-tertiary: '#ffffff'
  tertiary-container: '#c9a67c'
  on-tertiary-container: '#543b1a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6bff8f'
  primary-fixed-dim: '#4ae176'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005321'
  secondary-fixed: '#b2f746'
  secondary-fixed-dim: '#98da27'
  on-secondary-fixed: '#121f00'
  on-secondary-fixed-variant: '#334f00'
  tertiary-fixed: '#ffddb7'
  tertiary-fixed-dim: '#e6c095'
  on-tertiary-fixed: '#2a1800'
  on-tertiary-fixed-variant: '#5b4220'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '800'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '800'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.875rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system drives a gamified, mobile-first learning companion that turns study sessions into rewarding adventures alongside CrocPilot, a friendly mascot guide. Designed for modern students and lifelong learners, the visual language merges the tactile, dopamine-driven feedback loops of Finch and Duolingo with the punchy, high-craft sensibility of contemporary creative digital studios.

### Design Style & Attitude
- **Tactile & Bouncy:** Interfaces favor physical metaphors, pill-shaped buttons with 3D bottom bevels ("squishy" press depths), and playful elasticity on interaction.
- **Supportive & Celebratory:** Habit tracking and study milestones trigger encouraging micro-interactions, warm pastel tinting, and animated reactions from CrocPilot.
- **Clarity under Play:** Despite high energy, readability remains pristine through crisp dark charcoal typography set over airy mint-cream surfaces, avoiding visual fatigue during prolonged study blocks.

## Colors

The palette balances electric vegetation hues with soft dessert pastels and a rich charcoal ink tone, anchored on clean, near-white mint and cream surfaces.

### Core Roles
- **Primary (`#22C55E`):** Represents vitality, progress, and success. Used for primary CTAs, active study streaks, completed milestones, and CrocPilot's base character hue.
- **Secondary (`#A3E635`):** High-voltage electric lime used for active highlights, progress bar fills, badge pops, and playful notification pips.
- **Tertiary Accent Palette:**
  - Soft Peach (`#FED7AA` / `#FFEDD5`): Warm breaks, reflection cards, and gentle alerts.
  - Lemon Yellow (`#FEF08A`): XP tokens, focus timers, and gold star achievements.
  - Soft Lavender (`#E9D5FF`): Subject categorization and bedtime wind-down modes.
- **Neutrals & Surfaces:**
  - Charcoal Dark (`#0F172A`): Crisp body text, high-contrast headings, and grounding borders.
  - Muted Charcoal (`#475569`): Secondary descriptions, metadata, and placeholder states.
  - Canvas Mint Cream (`#F7FAF7`): Default application background.
  - Card & Pill Tint (`#F0FDF4` & `#FFFFFF`): Elevated tactile cards and interactive modules.

## Typography

The pairing between Plus Jakarta Sans and Be Vietnam Pro merges bold, friendly character architecture with high-clarity legibility.

- **Headlines and Interactive Labels (Plus Jakarta Sans):** Geometric curves and round letterforms lend an approachable, confident posture. Weights are biased toward 700 (Bold) and 800 (ExtraBold) to give study titles and numerical metrics a cheerful, sticker-like quality.
- **Body Copy and Explanations (Be Vietnam Pro):** Smooth, open counters and humanist details keep micro-lessons, flashcard notes, and study prompts effortlessly readable during long sessions.
- **Metric Scaling:** Headlines automatically compress on viewport widths below 390px using mobile-specific variants to protect against accidental wrapping on smaller handheld screens.

## Layout & Spacing

The layout is built for single-handed mobile navigation with safe thumb reaches, transitioning smoothly to compact tablet grids.

### Mobile-First Fluid Shell
- **Canvas Bounds:** Fluid full-bleed view bounded by a maximum readable width of 480px on desktop previews, centered on a soft mint backdrop.
- **Rhythm & Padding:** Uses an 8pt base grid. Component cards rely on `space-lg` (20px) inner padding to create open, touch-friendly tapping zones.
- **Thumb Zones:** Primary CTAs, mascot interaction bubbles, and persistent deck controls anchor into the bottom 25% of the mobile viewport, padded with safe-area insets.

## Elevation & Depth

Visual hierarchy uses tactile physical depths rather than dark, realistic shadows. Depth is communicated via two primary mechanisms:

1. **3D Bottom Offsets ("Push-Down" Surfaces):**
   - Active interactive surfaces feature solid, darker-toned bottom borders (typically a 3px to 4px solid rim tinted in a 20% darker shade of the element’s fill, such as `#16A34A` under `#22C55E`).
   - On tap or active state, the element translates down on the Y-axis by 2px, diminishing the bottom rim and mimicking a physical push button.

2. **Soft Pastel Ambient Drops:**
   - Cards float gently above the `#F7FAF7` canvas using an ultra-diffused drop shadow: `0 8px 24px -4px rgba(15, 23, 42, 0.05)`.
   - Modals and mascot dialog bubbles utilize a crisper outline (1.5px solid `#E2E8F0` or `#DCFCE7`) paired with a high-offset playful blur: `0 12px 32px -4px rgba(34, 197, 94, 0.12)`.

## Shapes

The shape system adopts a pill-centric philosophy. Sharp angles are completely avoided in favor of friendly curves.

- **Primary Radius (`roundedness: 3`):** Core interactive elements (buttons, search pills, streak chips, navigation capsules) use complete rounded caps (9999px / full pill).
- **Cards and Containers:** Content cards, study decks, and modal sheets use chunky radii ranging from `2rem` (32px) for card exteriors to `1rem` (16px) for interior nested segments.
- **Progress Trackers & Badges:** Progress tracks are fully rounded pill capsules with pill-shaped indicator thumbs.

## Components

### Buttons
- **Primary CTA:** Full pill-shaped container filled with `#22C55E`, crisp `#FFFFFF` text in Plus Jakarta Sans Bold, backed by a `#15803D` 4px bottom rim. Active press moves `translateY(3px)` and reduces rim height to 1px.
- **Secondary CTA:** Cream-mint surface (`#F0FDF4`) with an electric lime border (`#86EFAC`) and charcoal text (`#0F172A`).
- **Icon Actions:** Circular tactile buttons with centered mascot or study icons, equipped with equal push-down physics.

### Chips & Badges
- **Streak & XP Counter:** Compact pill badge pairing Lemon Yellow (`#FEF08A`) with Charcoal text and an animated fire or leaf glyph.
- **Status Tags:** Soft peach or lavender pills displaying subject tags ("Biology", "Calculus") with `label-sm` tracking.

### Cards & Deck Surfaces
- **Chunky Study Modules:** White card surfaces with `rounded-lg` (2rem) corners, a subtle 1.5px border (`#DCFCE7`), and gentle ambient elevation. Cards group content with generous `space-lg` internal padding.
- **Interactive Option Tiles:** Multiple-choice quiz tiles that light up in vibrant green on selection, vibrating with a micro-spring scale animation.

### Form Inputs & Checkboxes
- **Input Fields:** Generous pill fields (52px height) with light green/cream backgrounds, soft charcoal placeholder text, and an energetic 2px lime highlight ring on focus.
- **Tactile Checkboxes:** Oversized circular check targets (28px diameter) that bounce when toggled, filling with `#22C55E` and a crisp white checkmark icon.

### Progress Widgets & Gamification Elements
- **Segmented Progress Bars:** Pill-shaped capsules with translucent backgrounds (`#DCFCE7`) and `#22C55E` fills that pulse slightly upon completion.
- **CrocPilot Speech Bubbles:** White rounded dialog cards featuring a soft directional beak pointing toward the CrocPilot mascot illustration, delivering real-time study tips and cheering streaks.