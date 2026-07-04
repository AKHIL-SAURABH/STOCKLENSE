# Design System
## StockLens — Stock Market Analytics Dashboard

| Field | Details |
|---|---|
| **Document Type** | Design System & Component Library |
| **Project** | StockLens |
| **Version** | v1.0 |
| **Status** | Draft |
| **Author** | — |
| **Created** | June 2026 |
| **References** | PRD v1.0 · TECH_SPEC v1.0 · ARCHITECTURE v1.0 · SCHEMA v1.0 |

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Visual Identity](#2-visual-identity)
3. [Color System](#3-color-system)
4. [Typography System](#4-typography-system)
5. [Spacing & Grid](#5-spacing--grid)
6. [Design Tokens — CSS Variables](#6-design-tokens--css-variables)
7. [Tailwind Configuration](#7-tailwind-configuration)
8. [Dashboard Layout](#8-dashboard-layout)
9. [Component Library](#9-component-library)
10. [Data Visualization Style](#10-data-visualization-style)
11. [Animation & Motion System](#11-animation--motion-system)
12. [Icon System](#12-icon-system)
13. [Page States](#13-page-states)
14. [Accessibility](#14-accessibility)
15. [Responsive Behaviour](#15-responsive-behaviour)

---

## 1. Design Philosophy

### The Concept — "Midnight Terminal"

StockLens is a tool for people who read between the lines of market data.
The visual language draws from the analog world of financial research:
the glow of a late-night terminal, the precision of a printed earnings report,
the weight of a number that matters.

The design takes one deliberate risk: **the primary accent is amber-gold,
not the industry-default green**. Green is the color of profit tickers — it
has become noise. Amber is the color of old Reuters terminals, of brass
instruments, of the moment before you know which way the market moves.
It signals intelligence without implying the answer.

### Three design principles

**Density is clarity.** A financial dashboard that shows four metrics when
it could show twenty is not minimal — it's incomplete. StockLens packs data
tightly, but every element earns its position. Whitespace is used for
hierarchy, not emptiness.

**Numbers are the headline.** Price figures, RSI values, and volume ratios
are displayed in monospace at scale. The typography makes numbers the primary
reading experience — not the chart titles, not the section headers.

**Signal over noise.** The analytics layer (trend signals, anomaly flags,
volatility states) uses color sparingly: amber for attention, coral for
warning, ice-blue for confirmation. Color carries meaning — it is never
decorative.

---

## 2. Visual Identity

### The Signature Element

The live price display in the Market Summary Bar uses a large monospaced
number with a **dynamic ambient glow** that breathes in the stock's
sentiment color:

- Bullish / up day → amber glow (`rgba(245, 166, 35, 0.15)`)
- Bearish / down day → coral glow (`rgba(255, 107, 107, 0.15)`)
- Neutral / flat → no glow

This is the one motion effect that runs continuously. Everything else is
entrance animation only. The glow is subtle — felt, not seen.

### Personality keywords

```
Precise    ·    Intelligent    ·    Dense    ·    Confident    ·    After hours
```

### What this design is NOT

```
✗  Crypto-dark with neon green accents
✗  Corporate light-mode blue dashboard
✗  Playful / consumer finance app aesthetic
✗  Gradient-heavy hero sections
✗  Card-grid with excessive whitespace
```

---

## 3. Color System

### 3.1 Base Palette

Six foundational colors. Every other color in the system derives from these.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   VOID            SURFACE         PANEL            BORDER               │
│   #080B18         #0D1117         #131A2A          #1E2A3A              │
│   ████████        ████████        ████████         ████████             │
│   App background  Card bg         Sidebar/header   Dividers             │
│                                                                         │
│   AMBER           CORAL           ICE BLUE         MUTED                │
│   #F5A623         #FF6B6B         #64B5F6          #8B99B0              │
│   ████████        ████████        ████████         ████████             │
│   Primary accent  Bear / down     Bull / up        Inactive text        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Full Color Token Table

#### Background scale

| Token name | Hex | Usage |
|---|---|---|
| `--color-void` | `#080B18` | App root background, outermost layer |
| `--color-surface` | `#0D1117` | Primary card backgrounds, main content area |
| `--color-panel` | `#131A2A` | Secondary panels, sidebar, header |
| `--color-elevated` | `#1A2438` | Hover states, active rows, selected items |
| `--color-border` | `#1E2A3A` | All borders, dividers, grid lines |
| `--color-border-subtle` | `#162030` | Very subtle separators within cards |

#### Text scale

| Token name | Hex | Usage |
|---|---|---|
| `--color-text-primary` | `#E8EDF5` | Headlines, primary labels, active values |
| `--color-text-secondary` | `#8B99B0` | Supporting text, sublabels, timestamps |
| `--color-text-muted` | `#4A5568` | Disabled states, placeholder text |
| `--color-text-inverse` | `#080B18` | Text on colored badge backgrounds |

#### Accent — Amber (primary)

| Token name | Hex | Usage |
|---|---|---|
| `--color-amber` | `#F5A623` | Primary accent, CTAs, active tabs, symbol labels |
| `--color-amber-dim` | `#C4831A` | Hover state for amber elements |
| `--color-amber-glow` | `rgba(245,166,35,0.15)` | Ambient glow, focus rings |
| `--color-amber-subtle` | `rgba(245,166,35,0.08)` | Badge backgrounds, tag fills |

#### Signal — Bull / Bear

| Token name | Hex | Usage |
|---|---|---|
| `--color-bull` | `#4ADE80` | Positive price change, bullish signal badge |
| `--color-bull-dim` | `#16A34A` | Darker bull for text on light |
| `--color-bull-subtle` | `rgba(74,222,128,0.1)` | Bull badge background |
| `--color-bear` | `#FF6B6B` | Negative price change, bearish signal badge |
| `--color-bear-dim` | `#DC2626` | Darker bear for text on light |
| `--color-bear-subtle` | `rgba(255,107,107,0.1)` | Bear badge background |
| `--color-neutral` | `#64B5F6` | Neutral RSI, flat movement, informational |
| `--color-neutral-subtle` | `rgba(100,181,246,0.1)` | Neutral badge background |

#### Chart — data visualization palette

| Token name | Hex | Role in charts |
|---|---|---|
| `--color-chart-1` | `#F5A623` | Primary series (active stock) |
| `--color-chart-2` | `#64B5F6` | Comparison series 1 |
| `--color-chart-3` | `#A78BFA` | Comparison series 2 |
| `--color-chart-4` | `#34D399` | Comparison series 3 |
| `--color-chart-5` | `#F97316` | Comparison series 4 |
| `--color-chart-bg` | `#0D1117` | Chart background |
| `--color-chart-grid` | `#1A2438` | Grid lines inside charts |
| `--color-chart-crosshair` | `#2E3D54` | Crosshair line color |
| `--color-volume-bull` | `rgba(74,222,128,0.4)` | Up-day volume bar |
| `--color-volume-bear` | `rgba(255,107,107,0.4)` | Down-day volume bar |

#### Status colors

| Token name | Hex | Usage |
|---|---|---|
| `--color-warning` | `#FBBF24` | Budget warning, stale data banners |
| `--color-warning-subtle` | `rgba(251,191,36,0.1)` | Warning banner background |
| `--color-error` | `#EF4444` | Error banners, critical states |
| `--color-error-subtle` | `rgba(239,68,68,0.1)` | Error banner background |
| `--color-success` | `#4ADE80` | Confirmation states |
| `--color-success-subtle` | `rgba(74,222,128,0.1)` | Success banner background |

---

## 4. Typography System

### 4.1 Typeface selection

Three typefaces, each with a distinct role. No mixing within a context.

```
DISPLAY FACE          DM Serif Display
                      Use: Section eyebrows, pull quotes, large empty-state text
                      Source: Google Fonts
                      Character: Editorial, considered, slightly formal
                      Weight used: 400 (italic) only — used sparingly

DATA FACE             JetBrains Mono
                      Use: ALL numbers — prices, percentages, volumes, RSI values,
                           dates, axis labels, table data
                      Source: Google Fonts
                      Character: Tabular, precise, readable at small sizes
                      Weights used: 400 (data), 600 (primary prices)

UI FACE               Inter
                      Source: Google Fonts (Variable)
                      Character: Neutral, highly legible at small sizes, versatile
                      Weights used: 400 (body), 500 (labels), 600 (headings), 700 (eyebrows)
```

### 4.2 Import

```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
```

### 4.3 Type scale

| Scale name | Font | Size | Weight | Line height | Letter spacing | Used for |
|---|---|---|---|---|---|---|
| `display` | DM Serif Display | 48px | 400 italic | 1.1 | −0.02em | Empty state headline |
| `price-hero` | JetBrains Mono | 40px | 600 | 1.0 | −0.03em | Live price in summary bar |
| `price-large` | JetBrains Mono | 28px | 600 | 1.1 | −0.02em | Chart axis major values |
| `heading-1` | Inter | 20px | 600 | 1.3 | −0.01em | Card section titles |
| `heading-2` | Inter | 16px | 600 | 1.3 | 0 | Panel subheadings |
| `label` | Inter | 13px | 500 | 1.4 | 0.02em | Metric labels, eyebrows |
| `label-mono` | JetBrains Mono | 13px | 400 | 1.4 | 0 | Table data, axis ticks |
| `body` | Inter | 14px | 400 | 1.6 | 0 | Descriptions, summary text |
| `caption` | Inter | 12px | 400 | 1.5 | 0.01em | Timestamps, footnotes |
| `caption-mono` | JetBrains Mono | 11px | 400 | 1.4 | 0 | Small chart labels, tooltips |

### 4.4 Typography rules

```
Rule 1: Every number in the dashboard uses JetBrains Mono.
         Price: $213.07 — NOT $213.07
         Change: −0.67% — font switches at the % sign

Rule 2: DM Serif Display is used at most ONCE per screen view.
         It exists only in large empty states and the app logotype.

Rule 3: All chart labels, axis ticks, tooltips, and table cells
         use JetBrains Mono at 11–13px.

Rule 4: Uppercase text uses Inter at weight 700, tracking 0.08em.
         Used for: section eyebrows, metric labels, status badges.

Rule 5: Body copy and summary text use Inter 14px/400/1.6 line-height.
         The analytics summary paragraph is the primary body copy block.
```

---

## 5. Spacing & Grid

### 5.1 Spacing scale (4px base)

```
--space-1:   4px    Micro gaps (icon to label, badge padding y)
--space-2:   8px    Tight spacing (within components)
--space-3:  12px    Compact spacing (card inner padding small)
--space-4:  16px    Base unit (most common gap)
--space-5:  20px    Medium spacing
--space-6:  24px    Card inner padding
--space-8:  32px    Section gap, between card rows
--space-10: 40px    Large section breaks
--space-12: 48px    Header height component
--space-16: 64px    Major layout gaps
```

### 5.2 Dashboard grid

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HEADER  (height: 56px)                              │
├────────────────────────────────────────────────────────────────────────────-┤
│                      MARKET SUMMARY BAR  (height: 88px)                     │
├──────────────────────────────────────────────────────────────────┬──────────┤
│                                                                  │          │
│  MAIN CONTENT AREA  (flex: 1)                                    │  RIGHT   │
│                                                                  │  SIDEBAR │
│  ┌─────────────────────────────────────────────────────────┐    │  (320px) │
│  │  CANDLESTICK CHART  (height: 420px)                     │    │          │
│  └─────────────────────────────────────────────────────────┘    │          │
│  ┌──────────────────────┐  ┌──────────────────────────────┐    │          │
│  │  RSI  (height: 160px)│  │  MACD  (height: 160px)       │    │          │
│  └──────────────────────┘  └──────────────────────────────┘    │          │
│  ┌─────────────────────────────────────────────────────────┐    │          │
│  │  COMPARISON CHART  (height: 280px)                      │    │          │
│  └─────────────────────────────────────────────────────────┘    │          │
│  ┌──────────────────────┐  ┌──────────────────────────────┐    │          │
│  │  DRAWDOWN (200px)    │  │  DISTRIBUTION (200px)         │    │          │
│  └──────────────────────┘  └──────────────────────────────┘    │          │
│                                                                  │          │
└──────────────────────────────────────────────────────────────────┴──────────┘

Column layout:    main content = calc(100% - 320px - 1px border)
                  sidebar = 320px fixed
Gap between:      16px
Outer padding:    24px (top, bottom, left) / 0px (right — sidebar flush)
Inner card gap:   16px
```

### 5.3 Card anatomy

```
┌──────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐ │  ← 1px border: --color-border
│  │  EYEBROW LABEL                        BADGE / META  │ │  ← padding: 20px 24px 12px
│  │  (Inter 11px / 700 / uppercase / --color-text-muted)│ │
│  ├─────────────────────────────────────────────────────┤ │  ← 1px border-bottom: --color-border-subtle
│  │                                                     │ │
│  │   CARD CONTENT                                      │ │  ← padding: 16px 24px 20px
│  │   (chart / table / signal grid)                     │ │
│  │                                                     │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
  background: --color-surface
  border-radius: 12px
  border: 1px solid --color-border
  box-shadow: 0 1px 3px rgba(0,0,0,0.4), 0 0 0 0 transparent
  transition: box-shadow 200ms ease
```

---

## 6. Design Tokens — CSS Variables

Full token file. Referenced across all component stylesheets.

```css
/* src/styles/tokens.css */

:root {
  /* ── Backgrounds ───────────────────────────────────── */
  --color-void:             #080B18;
  --color-surface:          #0D1117;
  --color-panel:            #131A2A;
  --color-elevated:         #1A2438;
  --color-border:           #1E2A3A;
  --color-border-subtle:    #162030;

  /* ── Text ──────────────────────────────────────────── */
  --color-text-primary:     #E8EDF5;
  --color-text-secondary:   #8B99B0;
  --color-text-muted:       #4A5568;
  --color-text-inverse:     #080B18;

  /* ── Amber (primary accent) ────────────────────────── */
  --color-amber:            #F5A623;
  --color-amber-dim:        #C4831A;
  --color-amber-glow:       rgba(245, 166, 35, 0.15);
  --color-amber-subtle:     rgba(245, 166, 35, 0.08);

  /* ── Bull / Bear / Neutral ─────────────────────────── */
  --color-bull:             #4ADE80;
  --color-bull-dim:         #16A34A;
  --color-bull-subtle:      rgba(74, 222, 128, 0.10);
  --color-bear:             #FF6B6B;
  --color-bear-dim:         #DC2626;
  --color-bear-subtle:      rgba(255, 107, 107, 0.10);
  --color-neutral:          #64B5F6;
  --color-neutral-subtle:   rgba(100, 181, 246, 0.10);

  /* ── Chart colors ──────────────────────────────────── */
  --color-chart-1:          #F5A623;
  --color-chart-2:          #64B5F6;
  --color-chart-3:          #A78BFA;
  --color-chart-4:          #34D399;
  --color-chart-5:          #F97316;
  --color-chart-bg:         #0D1117;
  --color-chart-grid:       #1A2438;
  --color-chart-crosshair:  #2E3D54;
  --color-volume-bull:      rgba(74, 222, 128, 0.40);
  --color-volume-bear:      rgba(255, 107, 107, 0.40);

  /* ── Status ────────────────────────────────────────── */
  --color-warning:          #FBBF24;
  --color-warning-subtle:   rgba(251, 191, 36, 0.10);
  --color-error:            #EF4444;
  --color-error-subtle:     rgba(239, 68, 68, 0.10);
  --color-success:          #4ADE80;
  --color-success-subtle:   rgba(74, 222, 128, 0.10);

  /* ── Typography ────────────────────────────────────── */
  --font-display:           'DM Serif Display', Georgia, serif;
  --font-ui:                'Inter', system-ui, sans-serif;
  --font-mono:              'JetBrains Mono', 'Fira Code', monospace;

  /* ── Spacing ───────────────────────────────────────── */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* ── Border radius ─────────────────────────────────── */
  --radius-sm:    6px;
  --radius-md:    10px;
  --radius-lg:    12px;
  --radius-xl:    16px;
  --radius-pill:  999px;

  /* ── Shadows ───────────────────────────────────────── */
  --shadow-card:      0 1px 3px rgba(0, 0, 0, 0.40),
                      0 1px 2px rgba(0, 0, 0, 0.30);
  --shadow-elevated:  0 4px 16px rgba(0, 0, 0, 0.50),
                      0 1px 4px rgba(0, 0, 0, 0.30);
  --shadow-amber:     0 0 24px rgba(245, 166, 35, 0.20);
  --shadow-bull:      0 0 24px rgba(74, 222, 128, 0.15);
  --shadow-bear:      0 0 24px rgba(255, 107, 107, 0.15);

  /* ── Transitions ───────────────────────────────────── */
  --transition-fast:   120ms ease;
  --transition-base:   200ms ease;
  --transition-slow:   350ms ease;
  --transition-glow:   1800ms ease-in-out;
}
```

---

## 7. Tailwind Configuration

```js
// tailwind.config.js
import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void:    '#080B18',
        surface: '#0D1117',
        panel:   '#131A2A',
        raised:  '#1A2438',
        border:  '#1E2A3A',

        amber: {
          DEFAULT: '#F5A623',
          dim:     '#C4831A',
        },
        bull:    '#4ADE80',
        bear:    '#FF6B6B',
        neutral: '#64B5F6',

        text: {
          primary:   '#E8EDF5',
          secondary: '#8B99B0',
          muted:     '#4A5568',
        },

        chart: {
          1: '#F5A623',
          2: '#64B5F6',
          3: '#A78BFA',
          4: '#34D399',
          5: '#F97316',
        },
      },

      fontFamily: {
        display: ['DM Serif Display', ...fontFamily.serif],
        ui:      ['Inter', ...fontFamily.sans],
        mono:    ['JetBrains Mono', ...fontFamily.mono],
      },

      fontSize: {
        'price-hero':  ['40px', { lineHeight: '1.0', letterSpacing: '-0.03em', fontWeight: '600' }],
        'price-large': ['28px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'label-upper': ['11px', { lineHeight: '1.4', letterSpacing: '0.08em', fontWeight: '700' }],
      },

      borderRadius: {
        sm:   '6px',
        md:   '10px',
        lg:   '12px',
        xl:   '16px',
        pill: '999px',
      },

      boxShadow: {
        card:     '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        elevated: '0 4px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)',
        amber:    '0 0 24px rgba(245,166,35,0.20)',
        bull:     '0 0 24px rgba(74,222,128,0.15)',
        bear:     '0 0 24px rgba(255,107,107,0.15)',
      },

      animation: {
        'glow-pulse':    'glowPulse 1800ms ease-in-out infinite alternate',
        'fade-up':       'fadeUp 300ms ease forwards',
        'slide-in':      'slideIn 250ms ease forwards',
        'skeleton-wave': 'skeletonWave 1500ms ease-in-out infinite',
      },

      keyframes: {
        glowPulse: {
          '0%':   { opacity: '0.6' },
          '100%': { opacity: '1.0' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        skeletonWave: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
```

---

## 8. Dashboard Layout

### 8.1 Full-page wireframe

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  HEADER  (bg: --color-panel, border-bottom: 1px --color-border)  h: 56px   ║
║                                                                              ║
║  ◈ StockLens              [  🔍 Search symbol...     ]   ⬡ 8/25  [?]       ║
║  (amber logotype)         (symbol search input)     (budget badge)          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  MARKET SUMMARY BAR  (bg: --color-surface)  h: 88px                        ║
║                                                                              ║
║  AAPL · Apple Inc         $213.07          −$1.43  −0.67%    Jun 13 2026   ║
║  (amber · Inter 600 14px) (JetBrains 40px) (bear)           (muted)        ║
║                                                                              ║
║  [52W  $164 ─────────────────●──── $237]  VOL  0.89× avg  BETA  1.24      ║
║  (range slider — visual only)             (mono 13px)       (mono 13px)    ║
╠═══════════════════════════════════════════════════════════╦══════════════════╣
║  TOOLBAR  h: 48px                                         ║                 ║
║  [ 1M ] [ 3M ] [ 6M ] [●1Y] [ 5Y ]     Overlays:        ║  RIGHT SIDEBAR   ║
║  (period tabs, amber active)             [✓EMA20][✓EMA50]  ║  w: 320px       ║
║                                          [ EMA200][  BB  ]  ║                 ║
╠═══════════════════════════════════════════════════════════║                 ║
║                                                           ║  ┌─────────────┐ ║
║  ┌──────────────────────────────────────────────────────┐║  │ ANALYTICS   │ ║
║  │                                                      │║  │ INSIGHTS    │ ║
║  │   CANDLESTICK CHART (lightweight-charts)    h: 420px │║  │             │ ║
║  │   ┌ EMA 20 (amber dashed)                           │║  │ ◈ Trend     │ ║
║  │   ├ EMA 50 (ice blue solid)                         │║  │ Bullish     │ ║
║  │   │ candlesticks (green/red)                        │║  │             │ ║
║  │   │ Bollinger bands (purple, very thin)             │║  │ ◈ RSI       │ ║
║  │   └────────────────────────────────────────────────-│║  │ Neutral 58  │ ║
║  │   Volume bars (green/red at 30% opacity)            │║  │             │ ║
║  └──────────────────────────────────────────────────────┘║  │ ◈ Volatil. │ ║
║                                                           ║  │ Medium 24% │ ║
║  ┌──────────────────────┐  ┌───────────────────────────┐║  │             │ ║
║  │  RSI            160px│  │  MACD               160px │║  │ ◈ Volume   │ ║
║  │  ──── 70 (red band)  │  │  MACD line (amber)        │║  │ 0.89× avg  │ ║
║  │  ─── RSI line        │  │  Signal (ice blue)         │║  │             │ ║
║  │  ──── 30 (green band)│  │  Histogram bars            │║  │ ◈ Squeeze  │ ║
║  └──────────────────────┘  └───────────────────────────┘║  │ No         │ ║
║                                                           ║  │             │ ║
║  ┌──────────────────────────────────────────────────────┐║  ├─────────────┤ ║
║  │  COMPARISON CHART                           h: 280px │║  │ FUNDAMENT.  │ ║
║  │  AAPL ─── MSFT ─── GOOGL  (normalised to 100)       │║  │             │ ║
║  │  Total returns: +12.4%  −3.1%  +18.7%               │║  │ P/E   32.5  │ ║
║  └──────────────────────────────────────────────────────┘║  │ EPS   $6.56 │ ║
║                                                           ║  │ Mkt Cap 3.2T│ ║
║  ┌───────────────────────┐  ┌──────────────────────────┐║  │ Div   0.50% │ ║
║  │  DRAWDOWN       200px │  │  RETURN DIST      200px  │║  │ Beta  1.24  │ ║
║  │  (area chart, red)    │  │  (histogram, neutral)     │║  │ Tgt  $230   │ ║
║  └───────────────────────┘  └──────────────────────────┘║  └─────────────┘ ║
╚═══════════════════════════════════════════════════════════╩══════════════════╝
```

---

## 9. Component Library

### 9.1 Header

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ◈ StockLens          [ 🔍  Search symbol, e.g. AAPL          ]   ⬡ 8/25  │
└──────────────────────────────────────────────────────────────────────────────┘

Specs:
  height:         56px
  background:     var(--color-panel)
  border-bottom:  1px solid var(--color-border)
  padding:        0 24px
  layout:         flex, space-between, align-center

Logotype "◈ StockLens":
  ◈ glyph:        color: var(--color-amber), font-size: 20px
  "StockLens":    font: Inter 600 18px, color: var(--color-text-primary)
  gap:            8px

Search input:
  width:          360px
  height:         36px
  background:     var(--color-elevated)
  border:         1px solid var(--color-border)
  border-radius:  var(--radius-pill)
  padding:        0 14px 0 38px  (icon left)
  font:           Inter 14px / 400
  placeholder:    color: var(--color-text-muted)
  focus ring:     0 0 0 2px var(--color-amber-glow)
  focus border:   var(--color-amber)

Budget badge "⬡ 8/25":
  See §9.9 BudgetBadge component
```

---

### 9.2 Market Summary Bar

The signature component. The price number is the hero.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   AAPL · Apple Inc Inc                $213.07              −$1.43  −0.67%  │
│   ─────────────────────────       ─────────────────      ─────────────────  │
│   Inter 600 14px                  JetBrains Mono         JetBrains Mono     │
│   var(--color-amber)  ·  muted    600 40px primary        400 18px bear     │
│   letter-spacing: 0.04em          dynamic glow            (with ▼ icon)     │
│                                                                              │
│   [  $164.08 ─────────────────────────●──────── $237.23  ]                 │
│   52-week low (muted mono)           current   52-week high (muted mono)    │
│   Progress bar: background --color-border, fill --color-amber               │
│                                                                              │
│   VOL  54.4M  (0.89× avg)        BETA  1.24          Last updated 08:12 AM  │
│   ──────────────────────          ────────────        ────────────────────── │
│   label: muted Inter 11px upper   mono 13px primary   muted caption         │
│   value: mono 14px primary                                                   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

Specs:
  height:         88px
  background:     var(--color-surface)
  border-bottom:  1px solid var(--color-border)
  padding:        0 24px
  layout:         flex, align-center, gap: 48px

Price glow (signature element):
  bull day:  filter: drop-shadow(0 0 20px rgba(74,222,128,0.3))
             animation: glowPulse 1800ms ease-in-out infinite alternate
  bear day:  filter: drop-shadow(0 0 20px rgba(255,107,107,0.3))
  Uses CSS animation on the price element only
```

---

### 9.3 Period Selector Tabs

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [ 1M ]  [ 3M ]  [ 6M ]  [ 1Y ]  [ 5Y ]                                    │
└──────────────────────────────────────────────────────────────────────────────┘

Tab (inactive):
  padding:          6px 14px
  font:             Inter 13px 500
  color:            var(--color-text-secondary)
  background:       transparent
  border:           1px solid transparent
  border-radius:    var(--radius-pill)
  cursor:           pointer
  transition:       all var(--transition-fast)

  hover:
    color:          var(--color-text-primary)
    background:     var(--color-elevated)

Tab (active):
  color:            var(--color-amber)
  background:       var(--color-amber-subtle)
  border-color:     rgba(245,166,35,0.3)
  font-weight:      600
```

---

### 9.4 Overlay Toggle Chips

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  OVERLAYS   [✓ EMA 20] [✓ EMA 50] [ EMA 200 ] [ BB ]                        │
└──────────────────────────────────────────────────────────────────────────────┘

Label "OVERLAYS":
  font:     Inter 11px 700 uppercase
  color:    var(--color-text-muted)
  tracking: 0.08em

Chip (inactive):
  padding:          5px 12px
  font:             Inter 12px 500
  color:            var(--color-text-secondary)
  background:       transparent
  border:           1px solid var(--color-border)
  border-radius:    var(--radius-pill)
  gap:              6px (icon + text)

  Circle indicator (left, 8px diameter):
    EMA 20:    background: var(--color-amber)
    EMA 50:    background: var(--color-neutral)
    EMA 200:   background: var(--color-chart-3) [#A78BFA purple]
    BB:        background: var(--color-chart-4) [#34D399 green]

Chip (active):
  background:    rgba(color, 0.1)    (uses the indicator's own color)
  border-color:  rgba(color, 0.4)
  color:         var(--color-text-primary)
  checkmark:     ✓ prepended in color
```

---

### 9.5 Candlestick Chart Card

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  PRICE CHART                               AAPL · Daily · 1Y  [↗ Expand]   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  240 ─                    ╱╲                                        240 ─   │
│  220 ─           ║  ╱╲   ╱  ╲                                       220 ─   │
│  200 ─ ║    ╔═╗  ║  ║ ╲ ╱    ╲  ╔════════════════════════╗         200 ─   │
│  180 ─ ║    ╚═╝  ╚══╝  ╲╱     ╚═╝  (candlesticks)        ╚═══...   180 ─   │
│  160 ─                                                               160 ─   │
│       Jun 25  Aug 25  Oct 25  Dec 25  Feb 26  Apr 26  Jun 26              │
│                                                                              │
│  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬  (volume bars)   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

Chart configuration (lightweight-charts):
  layout:
    background:           { type: 'solid', color: '#0D1117' }
    textColor:            '#8B99B0'
    fontFamily:           'JetBrains Mono'
    fontSize:             11

  grid:
    vertLines:            { color: '#1A2438', style: LineStyle.Solid }
    horzLines:            { color: '#1A2438', style: LineStyle.Solid }

  crosshair:
    mode:                 CrosshairMode.Normal
    vertLine:             { color: '#2E3D54', width: 1, style: LineStyle.Dashed }
    horzLine:             { color: '#2E3D54', width: 1, style: LineStyle.Dashed }

  rightPriceScale:
    borderColor:          '#1E2A3A'
    textColor:            '#8B99B0'

  timeScale:
    borderColor:          '#1E2A3A'
    textColor:            '#8B99B0'
    fixLeftEdge:          true
    fixRightEdge:         true

Candlestick series:
  upColor:               '#4ADE80'
  downColor:             '#FF6B6B'
  borderUpColor:         '#4ADE80'
  borderDownColor:       '#FF6B6B'
  wickUpColor:           '#4ADE80'
  wickDownColor:         '#FF6B6B'

Volume series (histogram):
  color:                 conditionally '#4ADE8066' or '#FF6B6B66'
  priceScaleId:          'volume' (separate scale)
  priceFormat:           { type: 'volume' }

EMA 20 overlay:
  color:                 '#F5A623'
  lineWidth:             1
  lineStyle:             LineStyle.Dashed

EMA 50 overlay:
  color:                 '#64B5F6'
  lineWidth:             1.5
  lineStyle:             LineStyle.Solid

EMA 200 overlay:
  color:                 '#A78BFA'
  lineWidth:             1
  lineStyle:             LineStyle.SparseDotted

Bollinger Bands:
  Upper:   color '#A78BFA', lineWidth: 1
  Middle:  color '#A78BFA44', lineWidth: 1, lineStyle: Dashed
  Lower:   color '#A78BFA', lineWidth: 1
  Fill:    AreaSeries between upper/lower, topColor: rgba(167,139,250,0.04)
           bottomColor: rgba(167,139,250,0.01)
```

---

### 9.6 RSI Chart

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  RSI (14)                                                 Current  58.34    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  100 ─                                                               100 ─  │
│   70 ─ ════════════════════════════════════════════════════════════   70 ─  │
│        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ← overbought fill
│   50 ─ ─────────────────────────────────── RSI line ───────────────  50 ─  │
│        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ← oversold fill
│   30 ─ ════════════════════════════════════════════════════════════   30 ─  │
│    0 ─                                                                 0 ─  │
└──────────────────────────────────────────────────────────────────────────────┘

RSI line:
  color:             var(--color-amber)
  lineWidth:         1.5

Reference band fill (70–100):
  background:        rgba(255,107,107,0.06)   ← bear-subtle zone
  border at 70:      1px dashed #FF6B6B44

Reference band fill (0–30):
  background:        rgba(74,222,128,0.06)    ← bull-subtle zone
  border at 30:      1px dashed #4ADE8044

Current value badge (top right of card):
  overbought (>70):  bear color, bear-subtle background
  oversold (<30):    bull color, bull-subtle background
  neutral (30-70):   text-secondary
```

---

### 9.7 MACD Chart

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  MACD (12,26,9)                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   2 ─                           ╱───────────────────────── MACD (amber)    │
│   1 ─               ╱──────────╱  ──────────────────────── Signal (blue)   │
│   0 ─ ─────────────────────────────────────────────────────                 │
│  -1 ─                                                                        │
│                                                                              │
│  ████████░░░░░░░░░░░███████████░░░░░░░████  ← histogram bars               │
│  (bull=green, bear=red, 60% opacity)                                        │
└──────────────────────────────────────────────────────────────────────────────┘

MACD line:     color: var(--color-amber), lineWidth: 1.5
Signal line:   color: var(--color-neutral), lineWidth: 1
Histogram:
  positive:    color: var(--color-bull) at 70% opacity
  negative:    color: var(--color-bear) at 70% opacity
Zero line:     color: var(--color-border), lineWidth: 1, dashed
```

---

### 9.8 Analytics Insights Panel (Sidebar)

The most important sidebar component. Five signal cards in a stacked layout.

```
┌─────────────────────────────────────────────────────┐
│  ANALYTICS INSIGHTS                          ↻       │
│  AAPL · signals computed from 252 data points       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │  ◈ TREND                                      │  │
│  │                                               │  │
│  │  BULLISH              ▲ EMA 50 > EMA 200      │  │
│  │  (bull color, 18px)   (muted, caption)        │  │
│  │                                               │  │
│  │  ══════════════════════════              %    │  │
│  │  (EMA spread bar: distance EMA50 - EMA200)    │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │  ◈ MOMENTUM — RSI (14)                        │  │
│  │                                               │  │
│  │    0 ───────────●──────────────── 100         │  │
│  │                58.34                          │  │
│  │  (gradient track: green→amber→red)            │  │
│  │                                               │  │
│  │  NEUTRAL                    58.34             │  │
│  │  (neutral text badge)       (mono bold)       │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │  ◈ VOLATILITY (20d rolling)                   │  │
│  │                                               │  │
│  │  LOW ─────●────────── HIGH                   │  │
│  │       MEDIUM  24.7%                          │  │
│  │                                               │  │
│  │  Annualised  ·  Medium risk                   │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │  ◈ VOLUME ACTIVITY                            │  │
│  │                                               │  │
│  │  0.89×                                        │  │
│  │  (mono 28px, secondary color)                 │  │
│  │  vs 30-day average                            │  │
│  │                                               │  │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 1.0×      │  │
│  │  (bar: fill at 89%, muted background)         │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │  ◈ BOLLINGER SQUEEZE                          │  │
│  │                                               │  │
│  │  ◉ NO SQUEEZE DETECTED                        │  │
│  │  (bull dot, bull color text)                  │  │
│  │                                               │  │
│  │  Band width at 44th percentile                │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
├─────────────────────────────────────────────────────┤
│  SUMMARY                                             │
│                                                      │
│  "Trend is bullish (EMA 50 above EMA 200).           │
│   RSI at 58 — neutral range. Volume is               │
│   below average."                                    │
│                                                      │
│  (DM Serif Display italic 15px / muted text-primary) │
└─────────────────────────────────────────────────────┘

Signal card specs:
  background:     var(--color-surface)
  border:         1px solid var(--color-border-subtle)
  border-radius:  var(--radius-md)
  padding:        16px
  margin-bottom:  8px

  Card header (◈ SIGNAL NAME):
    ◈ glyph:      color: var(--color-amber), 12px
    label:        Inter 11px / 700 / uppercase / muted
    letter-track: 0.06em

  RSI gradient track:
    background: linear-gradient(to right,
      #4ADE80 0%,    #4ADE80 25%,
      #F5A623 40%,   #F5A623 60%,
      #FF6B6B 75%,   #FF6B6B 100%)
    height: 4px, border-radius: pill
    thumb: 10px circle, white fill, shadow
```

---

### 9.9 Budget Badge

Sits in the header. Signals the API usage state without interrupting workflow.

```
Normal (< 20 used):        ⬡ 8/25
                           background: var(--color-elevated)
                           color:      var(--color-text-secondary)
                           border:     1px solid var(--color-border)

Warning (20–23 used):      ⬡ 21/25  ⚠
                           background: var(--color-warning-subtle)
                           color:      var(--color-warning)
                           border:     1px solid rgba(251,191,36,0.3)

Critical (24 used):        ⬡ 24/25  CACHE ONLY
                           background: var(--color-error-subtle)
                           color:      var(--color-error)
                           border:     1px solid rgba(239,68,68,0.3)
                           text:       "CACHE ONLY" label appended

All states:
  font:         JetBrains Mono 12px 400
  padding:      5px 10px
  border-radius:var(--radius-pill)
  gap:          6px (⬡ icon + text)
```

---

### 9.10 Signal Badge

Reusable pill badge used in signal cards and summary bar.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  BULLISH      BEARISH      NEUTRAL      OVERBOUGHT   OVERSOLD   HIGH VOL   │
│                                                                              │
│  ▲ Bullish    ▼ Bearish    ● Neutral    ⚠ Overbought  ↓ Oversold  🔥 High  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

Bullish badge:
  background:   var(--color-bull-subtle)
  color:        var(--color-bull)
  border:       1px solid rgba(74,222,128,0.25)

Bearish badge:
  background:   var(--color-bear-subtle)
  color:        var(--color-bear)
  border:       1px solid rgba(255,107,107,0.25)

Neutral badge:
  background:   var(--color-neutral-subtle)
  color:        var(--color-neutral)
  border:       1px solid rgba(100,181,246,0.25)

Shared:
  font:         Inter 12px 600 uppercase
  letter-track: 0.04em
  padding:      4px 10px
  border-radius:var(--radius-pill)
  gap:          5px (icon + text)
```

---

### 9.11 Fundamentals Panel

```
┌─────────────────────────────────────────────────────┐
│  FUNDAMENTALS                                        │
│  Apple Inc · NASDAQ · Technology                    │
├─────────────────────────────────────────────────────┤
│  P/E Ratio          32.50                           │
│  ─────────────────────────────────────────────────  │
│  Forward P/E        28.10                           │
│  ─────────────────────────────────────────────────  │
│  PEG Ratio           2.30                           │
│  ─────────────────────────────────────────────────  │
│  EPS (TTM)          $6.56                           │
│  ─────────────────────────────────────────────────  │
│  Revenue (TTM)    $385.0B                           │
│  ─────────────────────────────────────────────────  │
│  Profit Margin      26.4%                           │
│  ─────────────────────────────────────────────────  │
│  Dividend Yield      0.50%                          │
│  ─────────────────────────────────────────────────  │
│  Beta                1.24                           │
│  ─────────────────────────────────────────────────  │
│  Analyst Target    $230.00  ▲ +7.97%               │
└─────────────────────────────────────────────────────┘

Row:
  height:           36px
  border-bottom:    1px solid var(--color-border-subtle)
  layout:           flex, space-between, align-center
  padding:          0 16px

  Label:  Inter 12px / 500 / text-secondary
  Value:  JetBrains Mono 13px / 600 / text-primary

  Analyst target row:
    Shows value + upside % in bull color (or bear if below price)
    Upside: "(▲ +7.97%)" → bull-subtle badge
    Downside: "(▼ −2.1%)" → bear-subtle badge

Null values:  show "—" in text-muted
```

---

### 9.12 Comparison Chart Card

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  COMPARE                                    [+ Add symbol]    [Clear all]   │
│  [● AAPL ×] [● MSFT ×] [● GOOGL ×]         Normalised to 100 · 1Y          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  140 ─                                  ╱                           140 ─  │
│  120 ─                          ╱──────╱ GOOGL +18.7%               120 ─  │
│  100 ─ ─────────────────────────────────────────── base              100 ─  │
│   90 ─  ╲────────────────────╱            MSFT −3.1%                 90 ─  │
│                    AAPL ───────────────────── +12.4%                        │
│       Jun 25    Sep 25    Dec 25    Mar 26    Jun 26                        │
│                                                                              │
│  TOTAL RETURNS:  ● AAPL +12.4%   ● MSFT −3.1%   ● GOOGL +18.7%           │
│                  (mono 13px)      (bear color)    (bull color, largest)     │
└──────────────────────────────────────────────────────────────────────────────┘

Compare chip (active symbol):
  background:   rgba(chart-color, 0.12)
  border:       1px solid rgba(chart-color, 0.4)
  color:        var(--chart-color)
  left dot:     8px circle in chart-color
  ×:            text-muted, hover: bear

Return legend row:
  layout:       flex, gap: 24px, padding: 12px 0 0
  Each item:    colored dot + mono value + % change badge
```

---

### 9.13 Skeleton Loading State

Used for all components while data fetches.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ████████████████  (header skeleton, 40% width, h: 16px)                    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ████████████████████████████████████████████████████████████████  100%    │
│  ████████████████████████████████████████████████████████████████  100%    │
│  ████████████████████████████████████████████████████████████████  100%    │
│  ████████████████████████████████████████████████  80%                     │
└──────────────────────────────────────────────────────────────────────────────┘

Skeleton element:
  background:    linear-gradient(
                   90deg,
                   var(--color-elevated) 25%,
                   var(--color-panel) 50%,
                   var(--color-elevated) 75%
                 )
  background-size: 200% 100%
  animation:     skeletonWave 1500ms ease-in-out infinite
  border-radius: var(--radius-sm)

Skeleton line heights: 16px (text), 12px (caption), 200–420px (chart area)
```

---

### 9.14 Error Banner

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ⚠  Daily API request limit reached (24/25).                    [Retry ↻]  │
│     Using cached data from Jun 13, 2026 · 08:00 AM                          │
└──────────────────────────────────────────────────────────────────────────────┘

Container:
  background:   var(--color-warning-subtle)
  border:       1px solid rgba(251,191,36,0.3)
  border-left:  3px solid var(--color-warning)
  border-radius:var(--radius-md)
  padding:      12px 16px
  layout:       flex, space-between, align-center

Icon ⚠:
  color:        var(--color-warning)
  font-size:    16px

Message:
  font:         Inter 13px / 500
  color:        var(--color-text-primary)

Sublabel (stale timestamp):
  font:         Inter 12px / 400
  color:        var(--color-text-secondary)
  margin-top:   2px

Retry button:
  font:         Inter 12px / 600
  color:        var(--color-warning)
  background:   rgba(251,191,36,0.12)
  border:       1px solid rgba(251,191,36,0.3)
  border-radius:var(--radius-pill)
  padding:      5px 12px
```

---

### 9.15 Tooltip (Chart Crosshair)

Appears on hover over any chart.

```
┌──────────────────────────┐
│  Jun 13, 2026            │
│  Open     $207.50        │
│  High     $214.20        │
│  Low      $206.80        │
│  Close    $211.30        │
│  Volume   58.2M  (0.95×) │
└──────────────────────────┘

Container:
  background:   var(--color-panel)
  border:       1px solid var(--color-border)
  border-radius:var(--radius-md)
  padding:      12px 14px
  box-shadow:   var(--shadow-elevated)
  min-width:    180px

Date header:
  font:         JetBrains Mono 11px / 600
  color:        var(--color-amber)
  padding-bottom: 8px
  border-bottom:  1px solid var(--color-border-subtle)
  margin-bottom:  8px

Rows:
  layout:       flex, space-between
  gap:          10px (between rows)

  Label:  Inter 11px / 500 / text-secondary
  Value:  JetBrains Mono 12px / 400 / text-primary
  Close value:  weight 600, bull/bear color based on open vs close
```

---

## 10. Data Visualization Style

### 10.1 Chart visual principles

```
1. No chart titles inside the chart area.
   Titles live in the card header only.

2. Minimal axis styling.
   Axes are present but quiet: JetBrains Mono 11px, --color-text-secondary.
   No axis titles — the card header provides that context.

3. Grid lines: present, very faint.
   color: --color-chart-grid (#1A2438)
   They should be sensed, not seen.

4. Color = meaning, always.
   Green: up / bull / positive / confirmed
   Red:   down / bear / negative / warning
   Amber: active selection / current value / primary series
   Blue:  neutral / informational / comparison series 1
   
5. Filled areas use low-opacity versions of line colors.
   Max opacity for area fills: 15%

6. No 3D effects, no gradients on data series.
   Flat, clean lines and bars only.
```

### 10.2 Drawdown chart

```
   0% ────────────────────────────────────────
       ╲╱╲     ╱╲╱   ╱╲                ╱╲╱
  -5%  ──╲───╱────╲──────────────────╱─────
         ╲╱         ╲              ╱
 -12%                ╲────────────╱

Area fill:
  Fill between line and 0% baseline
  topColor:     rgba(255,107,107,0.15)    at 0%
  bottomColor:  rgba(255,107,107,0.02)    at minimum
  Line:         var(--color-bear), 1.5px
  Zero line:    var(--color-border), 1px solid
```

### 10.3 Return distribution histogram

```
       │
   45  │     ██
   40  │    ████
   35  │    ████
   30  │   ██████
   25  │   ████████                 ← bars centered on 0%
   20  │  ██████████
   15  │ ████████████
   10  │ ██████████████
    5  │ ████████████████
    0  ├────────────────────────────
      -3%  -2%  -1%   0%  +1%  +2%  +3%

Bars left of 0%:    var(--color-bear) at 60% opacity
Bars right of 0%:   var(--color-bull) at 60% opacity
Bars at 0%:         var(--color-text-muted)
Normal curve:       optional dashed amber overlay line
Zero line:          var(--color-amber), 1px solid
```

### 10.4 Comparison chart line styles

Each series gets a unique color + dash pattern so they're distinguishable
when printed or for colorblind users.

| Symbol slot | Color token | Dash pattern |
|---|---|---|
| Series 1 (active) | `--color-chart-1` amber | Solid |
| Series 2 | `--color-chart-2` ice blue | Solid |
| Series 3 | `--color-chart-3` purple | Dashed `4,2` |
| Series 4 | `--color-chart-4` green | DotDash `1,2,4,2` |
| Series 5 | `--color-chart-5` orange | SparseDotted |

---

## 11. Animation & Motion System

### 11.1 Motion principles

```
One ambient motion only:   The price glow pulse (signature element).
                           Everything else is entrance-only or hover-only.

No looping decorative animations.
No bouncing or elastic easing.
Easing: ease or ease-out only. No ease-in for entrances.
Duration budget: 120ms (fast), 200ms (base), 350ms (slow).
```

### 11.2 All animations defined

| Name | Trigger | Duration | Easing | Effect |
|---|---|---|---|---|
| `glowPulse` | On load if price changed | 1800ms | ease-in-out alternate infinite | Price number opacity 0.6 → 1.0 |
| `fadeUp` | Component mount | 300ms | ease | opacity 0→1, translateY 8px→0 |
| `slideIn` | Sidebar panel reveal | 250ms | ease | opacity 0→1, translateX −8px→0 |
| `skeletonWave` | Loading state | 1500ms | ease-in-out infinite | Background position sweep |
| Card hover | hover | 200ms | ease | border-color lightens, shadow lifts |
| Tab active | click | 120ms | ease | background fills, color shifts |
| Badge mount | data arrives | 200ms | ease | fadeUp (offset by 50ms per badge) |
| Overlay toggle | click | 120ms | ease | chip background fills/empties |
| Tooltip appear | chart hover | 80ms | ease | opacity 0→1 |

### 11.3 Staggered entrance

When the analytics signal badges appear after data loads, they stagger:

```css
.signal-card:nth-child(1) { animation-delay: 0ms;   }
.signal-card:nth-child(2) { animation-delay: 60ms;  }
.signal-card:nth-child(3) { animation-delay: 120ms; }
.signal-card:nth-child(4) { animation-delay: 180ms; }
.signal-card:nth-child(5) { animation-delay: 240ms; }
```

### 11.4 Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. Icon System

StockLens uses `lucide-react` for all UI icons. No custom icon sets.
All icons are rendered at consistent sizes with consistent colors.

### 12.1 Icon sizes

| Context | Size | Tailwind class |
|---|---|---|
| Header actions | 18px | `size-[18px]` |
| Card headers | 14px | `size-[14px]` |
| Signal cards | 12px | `size-3` |
| Badge icons | 10px | `size-[10px]` |
| Chart controls | 16px | `size-4` |

### 12.2 Icon usage map

| Icon | Lucide name | Context | Color |
|---|---|---|---|
| ↑ Up | `TrendingUp` | Bullish signal | `var(--color-bull)` |
| ↓ Down | `TrendingDown` | Bearish signal | `var(--color-bear)` |
| ─ Neutral | `Minus` | Neutral signal | `var(--color-neutral)` |
| 🔍 Search | `Search` | Header search | `var(--color-text-muted)` |
| ⚠ Warning | `AlertTriangle` | Budget warning, error | `var(--color-warning)` |
| ↻ Refresh | `RefreshCw` | Retry button | inherits button color |
| ✕ Remove | `X` | Remove compare symbol | `var(--color-text-muted)` |
| + Add | `Plus` | Add compare symbol | `var(--color-amber)` |
| ↗ Expand | `Maximize2` | Chart expand (v1.1) | `var(--color-text-muted)` |
| ⬡ Budget | `Hexagon` | Budget badge | inherits badge color |
| ? Help | `HelpCircle` | Help tooltip | `var(--color-text-muted)` |
| ● Dot | `Circle` filled | Legend color dot | chart series color |
| ✓ Check | `Check` | Active overlay toggle | chart overlay color |

---

## 13. Page States

### 13.1 Initial load (cold cache)

```
Header:              renders immediately (static)
Market summary bar:  skeleton (3 blocks)
Candlestick card:    skeleton (full height, 420px)
RSI card:            skeleton
MACD card:           skeleton
Analytics sidebar:   skeleton (5 cards)
Fundamentals:        skeleton (8 rows)

After ~1–3s (API response):
  All skeletons replaced with data via fadeUp (300ms)
```

### 13.2 Symbol change

```
User types new symbol → presses Enter
→ Zustand updates activeSymbol
→ All React Query keys change
→ Skeletons replace content immediately
→ New data fetches
→ fadeUp on each card as it resolves
→ Price glow re-evaluates and pulses
```

### 13.3 Empty state (symbol not found)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                         ◈                                                   │
│                                                                              │
│               No data found for "XYZQ"                                     │
│                (DM Serif Display italic 28px)                               │
│                                                                              │
│          Alpha Vantage returned no results for this symbol.                 │
│          Try AAPL, MSFT, GOOGL, TSLA, or AMZN.                             │
│                (Inter 14px / text-secondary)                                │
│                                                                              │
│                   [ Search a different symbol ]                             │
│                   (amber button, outlined)                                  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

◈ glyph: color amber, font-size 40px, opacity 0.5
```

### 13.4 Budget exhausted (cache-only mode)

```
Yellow warning banner below header:
  "⚠  API request limit reached for today (24/25).
      All data shown is from cache · Refreshes at midnight UTC.
      [Dismiss]"

Dashboard continues to show cached data normally.
All data has a subtle muted border-left: 2px solid var(--color-warning)
on each card to signal staleness.
```

---

## 14. Accessibility

### 14.1 Color contrast ratios

| Pairing | Ratio | WCAG level |
|---|---|---|
| `--color-text-primary` (#E8EDF5) on `--color-surface` (#0D1117) | 14.8:1 | AAA |
| `--color-text-secondary` (#8B99B0) on `--color-surface` | 5.2:1 | AA |
| `--color-amber` (#F5A623) on `--color-surface` | 8.4:1 | AAA |
| `--color-bull` (#4ADE80) on `--color-surface` | 9.1:1 | AAA |
| `--color-bear` (#FF6B6B) on `--color-surface` | 5.6:1 | AA |
| `--color-text-muted` (#4A5568) on `--color-surface` | 3.1:1 | AA Large only |

**Rule:** Never use `--color-text-muted` for important information.
Use only for timestamps, footnotes, and disabled states.

### 14.2 Non-color signal redundancy

Signal badges always pair **color + icon + text label**:

```
✓  ▲ BULLISH  (icon + color + text — three signals)
✗  ▲          (icon + color only — fails if color blind)
✗  BULLISH    (text + color only — unclear without color)
```

Charts use color + dash pattern combinations (see §10.4).

### 14.3 Keyboard navigation

```
Tab order:
  Header search input
  → Period tabs (arrow keys to navigate)
  → Overlay toggle chips (arrow keys)
  → Comparison input
  → Compare chips × buttons
  → Retry buttons (if error)
  → Chart area (focus enters chart for keyboard zoom/pan)

Focus ring:
  outline: 2px solid var(--color-amber)
  outline-offset: 2px
  border-radius: matches element

Never suppress :focus-visible.
```

### 14.4 Screen reader

```
Chart aria-label: "Candlestick price chart for AAPL, 1 year period.
                   Most recent close: $213.07 on June 13, 2026."

Signal badges aria-label: "Trend signal: Bullish. EMA 50 is above EMA 200."

Price number aria-live="polite" — updates announced on symbol change.

Loading state aria-busy="true" on card containers.
```

---

## 15. Responsive Behaviour

StockLens is desktop-first. Minimum supported width: **1280px**.

### Breakpoints

| Breakpoint | Width | Layout change |
|---|---|---|
| Desktop XL | ≥ 1440px | Sidebar: 360px. Charts: fuller width |
| Desktop L | 1280–1439px | Default layout. Sidebar: 320px |
| Desktop M | 1024–1279px | Sidebar collapses to bottom tab panel |
| Tablet | 768–1023px | Two-column becomes single-column. Sidebar becomes drawer |
| Mobile | < 768px | Single column. Charts resize. Summary bar stacks vertically |

### 1280px+ layout (primary target)

No changes from the default layout documented in §8.

### 1024–1279px layout

```
- Right sidebar moves BELOW main charts as a collapsible panel
- Main content area: 100% width
- Panel toggle: "Analytics ▼" tab at bottom of candlestick card
```

### 768–1023px layout (tablet)

```
- Sidebar becomes a slide-in drawer (hamburger trigger in header)
- Indicator charts stack vertically (RSI then MACD, full width)
- Comparison chart: reduced height (200px)
- Font sizes: price-hero scales down to 32px
```

### < 768px (mobile — degraded)

```
- Header: search collapses to icon-only button
- Market summary bar: 2-row layout
- Candlestick chart: height 280px
- Indicators: hidden by default, accessible via "Show Indicators" toggle
- Analytics signals: horizontal scrolling card strip
- Not optimised — functional, not polished at this width
```

---

*End of DESIGN.md v1.0*
