# DESIGN.md — TuteFlow (Mitesh Sir's Study Circle)

A plain-text design system for AI agents. Read this before generating any HTML or CSS for this project.

---

## 1. Mood & Brand

Warm, authoritative, academic. Feels like an established institution — not a startup dashboard. The palette is built around a warm ivory base with deep ink-navy and terracotta accents. Glassmorphism is the primary surface treatment: frosted white panels over the ivory background. Nothing is harsh, sharp, or neon. The UI should feel trustworthy, premium, and unhurried.

---

## 2. Color Palette

All colors are defined as CSS custom properties on `:root` in `css/styles.css`. Always use these variables — never hardcode hex values.

### Core Variables

| Variable             | Value                        | Usage                                               |
|----------------------|------------------------------|-----------------------------------------------------|
| `--bg-base`          | `#F2EADD`                    | Page background (warm ivory)                        |
| `--bg-surface`       | `#FDFAF6`                    | Cards, footer, clean surfaces                       |
| `--bg-surface-hover` | `#EDE4D3`                    | Hover states, pill containers, form inputs          |
| `--glass-bg`         | `rgba(255, 255, 255, 0.7)`   | Glassmorphic panels, cards, navbar                  |
| `--glass-border`     | `rgba(0, 0, 0, 0.08)`        | Borders on glass elements                           |
| `--border-color`     | `rgba(0, 0, 0, 0.1)`         | Standard borders on non-glass elements              |
| `--primary`          | `#1E3A5F`                    | Primary actions, panel headings, active nav         |
| `--primary-hover`    | `#152D4A`                    | Hover state for primary elements                    |
| `--secondary`        | `#B05028`                    | Active tab buttons, subject pill selection, accents |
| `--text-main`        | `#1A2332`                    | Body text, headings, high-contrast labels           |
| `--text-muted`       | `#3D4F63`                    | Secondary text, labels, table cells                 |
| `--shadow-glow`      | `0 4px 6px rgba(0,0,0,0.05)` | Subtle elevation on hover                           |
| `--amber`            | `#C48A14`                    | Late status, warning states                         |
| `--cadmium-red`      | `#B83232`                    | Danger/error (alongside `.btn--danger`)             |
| `--success`          | `#10b981`                    | Success states                                      |
| `--danger`           | `#ef4444`                    | Error states                                        |
| `--grade-11`         | `#C41230`                    | Grade 11 accent / absent toggle active              |
| `--grade-12`         | `#00A36C`                    | Grade 12 accent / present toggle active             |

### Semantic One-offs (not variables)

- **Success status bg:** `rgba(16, 185, 129, 0.1)` with `1px solid rgba(16,185,129,0.3)` border
- **Error status bg:** `rgba(239, 68, 68, 0.1)` with `1px solid rgba(239,68,68,0.3)` border
- **Info status bg:** `rgba(30, 58, 95, 0.1)` with `1px solid rgba(30,58,95,0.3)` border, color `var(--primary)`
- **WhatsApp green:** `#25D366` — used exclusively for WhatsApp send buttons

---

## 3. Typography

Two fonts are in use. Load both via Google Fonts.

```css
--font-main:    'Plus Jakarta Sans', 'Outfit', 'Inter', sans-serif;
--font-heading: 'Crimson Pro', Georgia, serif;
```

- `body`: uses `--font-main`, `line-height: 1.6`
- `h1`–`h4`: uses `--font-heading`, `line-height: 1.2`, `font-weight: 700`
- All interactive elements (buttons, inputs, selects): explicitly set `font-family: var(--font-main)`

### Heading Scale (fluid)

| Element | `font-size` |
|---------|-------------|
| `h1` | `clamp(2.5rem, 5vw, 4rem)` |
| `h2` | `clamp(2rem, 4vw, 3rem)` |
| `h3` | `clamp(1.5rem, 3vw, 2rem)` |
| `.panel__header h2, h3` | `1.75rem`, `color: var(--primary)` |
| Welcome heading | `2rem`, name in `var(--primary)` |
| Breadcrumb title | `2.5rem` |

### Gradient Text (hero headings, login header)

```css
background: linear-gradient(135deg, var(--primary), var(--secondary));
-webkit-background-clip: text;
background-clip: text;
-webkit-text-fill-color: transparent;
```

Use on hero highlight spans and the login card heading.

---

## 4. Layout & Spacing

- **Max content width:** `1200px`, centered, `padding: 0 2rem`
- **Section padding:** `3rem 0 6rem`
- **Section header bottom margin:** `4rem`
- **Panel padding:** `1.5rem 2rem 2rem`
- **Gap between panels/cards:** `2rem`
- **Form group margin:** `1.5rem` bottom

### Dashboard Grid

```css
/* Default: single column */
.dashboard { display: grid; gap: 2rem; }
/* ≥992px: content + sidebar */
@media (min-width: 992px) { grid-template-columns: 2fr 1fr; }
```

### Common Grid Patterns

- Stats row / Stat cards: `repeat(auto-fit, minmax(200px, 1fr))`, `gap: 1.5rem`
- Testimonials: `repeat(auto-fit, minmax(300px, 1fr))`
- Landing pills / Classes grid (desktop): `repeat(2, 1fr)`, `gap: 1.5rem`
- Landing pills / Classes grid (mobile ≤600px): `1fr`
- Footer: `repeat(auto-fit, minmax(250px, 1fr))`

---

## 5. Border Radii

| Variable        | Value  | Used on                                       |
|-----------------|--------|-----------------------------------------------|
| `--radius-full` | `8px`  | Buttons, nav pills, pill toggles, badges      |
| `--radius-lg`   | `16px` | Panels, glass cards, modals, filter bars      |
| `--radius-md`   | `8px`  | Form inputs, material list items, stat cards  |

**Note:** `--radius-full` is `8px`, not `9999px`. The name is legacy. Buttons and pills have noticeably rounded corners, not fully circular. Do not use `border-radius: 9999px` directly.

**Rule:** Interactive + prominent (button, tab, nav) → `--radius-full`. Container (panel, card, table wrapper) → `--radius-lg`. Input field or small widget → `--radius-md`.

---

## 6. Glassmorphism (Primary Surface Pattern)

This is the signature visual pattern. Apply to panels, cards, filter bars, navbar.

```css
background: var(--glass-bg);           /* rgba(255,255,255,0.7) */
border: 1px solid var(--glass-border); /* rgba(0,0,0,0.08) */
border-radius: var(--radius-lg);
backdrop-filter: blur(16px);
-webkit-backdrop-filter: blur(16px);
```

Navbar: `position: sticky; top: 0; z-index: 100; padding: 0.65rem 0;`

The utility class `.glass` applies this pattern with `padding: 2rem`.

---

## 7. Components

### Buttons

All buttons: `display: inline-flex; align-items: center; gap: 0.5rem; border-radius: var(--radius-full); font-weight: 600; font-family: var(--font-main); transition: var(--transition);`

| Class           | Background       | Text          | Hover                                   |
|-----------------|------------------|---------------|-----------------------------------------|
| `.btn--primary` | `var(--primary)` | white         | `var(--primary-hover)` + glow shadow   |
| `.btn--outline` | transparent      | `--text-main` | `--bg-surface` bg + primary border     |
| `.btn--danger`  | `var(--danger)`  | white         | darker red + shadow                     |

Modifiers: `.btn--full` (full width, `padding: 1rem`, `font-size: 1.1rem`), `.btn--sm` (`padding: 0.5rem 1rem`, `font-size: 0.9rem`).

Disabled: `opacity: 0.7; cursor: not-allowed;`

### Tabs (Dashboard Navigation)

```
.tabs__nav  — rgba(255,255,255,0.4) bg, --radius-full, padding: 0.4rem, gap: 0.25rem
.tabs__btn  — flex:1, transparent, --radius-full, white-space: nowrap
.tabs__btn--active  — background: var(--secondary), color: white
.tabs__btn:hover:not(.active)  — rgba(255,255,255,0.5)
```

**Important:** Active tabs use `--secondary` (terracotta), not `--primary` (navy). Active navbar links use `--primary`.

### Pill Toggle (Binary Switch inside Panels)

Container: `--bg-surface-hover` background, `--border-color` border, `--radius-full`, `padding: 0.25rem`, `display: inline-flex`.
Active pill: `--primary` background, white text.

```html
<div class="pill-toggle">
  <button class="pill-toggle__btn pill-toggle__btn--active">Option A</button>
  <button class="pill-toggle__btn">Option B</button>
</div>
```

### Subject Pill Selector

Same container style as pill toggle (`subject-pills`). Each option is a hidden `<input>` + visible `<span class="subject-pill__label">`.
Selected state: `--secondary` (terracotta) background.

### Panel

```css
.panel {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem 2rem 2rem;
  backdrop-filter: blur(16px);
}
.panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}
.panel__header h2, .panel__header h3 { font-size: 1.75rem; color: var(--primary); margin: 0; }
```

### Form Controls

Inputs, selects, textareas share:
```css
background: var(--bg-surface-hover);
border: 1px solid var(--border-color);
border-radius: var(--radius-md);
padding: 0.75rem 1rem;
font-family: var(--font-main);
font-size: 1rem;
width: 100%;
```

Focus ring: `border-color: var(--primary); box-shadow: 0 0 0 3px rgba(30,58,95,0.3);`

Label (`.form__label`): `color: var(--text-muted); font-size: 0.9rem; display: block; margin-bottom: 0.5rem;`

Form group (`.form__group`): `margin-bottom: 1.5rem`

Upload zone: `border: 2px dashed var(--border-color); border-radius: var(--radius-md); padding: 1.5rem;`

### Data Table

Two patterns exist — use `.table-wrap` inside panels, `.data-table` for standalone glass surfaces.

**`.table-wrap`** (used inside `.panel`):
```css
overflow-x: auto;
/* table inside: */
width: 100%; border-collapse: collapse; text-align: left;
/* th: */ padding: 1rem; color: var(--text-muted); font-weight: 600;
/* td: */ padding: 1rem; color: var(--text-muted);
/* thead tr: */ border-bottom: 2px solid var(--border-color);
```

**`.data-table`** (standalone glass wrapper):
- Glass surface + `overflow-x: auto`
- `th`: `color: var(--primary); font-weight: 600;`
- `td`: `color: var(--text-muted);` / `.data-table__td--main`: `color: var(--text-main); font-weight: 500;`
- Row hover: `rgba(0,0,0,0.03)`
- Highlight row: `rgba(30,58,95,0.08)` + `border-left: 3px solid var(--primary)`
- Cell padding: `1rem`–`1.25rem`

### Badge

```css
.badge       { background: rgba(176,80,40,0.15); color: var(--secondary); font-weight: 700; padding: 0.25rem 0.75rem; border-radius: var(--radius-full); border: 1px solid rgba(176,80,40,0.3); }
.badge--green { background: rgba(16,185,129,0.12); color: #10b981; border-color: rgba(16,185,129,0.35); }
```

### Status Messages

```css
.status--success { background: rgba(16,185,129,0.1);  color: var(--success); border: 1px solid rgba(16,185,129,0.3); display: block; }
.status--error   { background: rgba(239,68,68,0.1);   color: var(--danger);  border: 1px solid rgba(239,68,68,0.3);  display: block; }
.status--info    { background: rgba(30,58,95,0.1);    color: var(--primary); border: 1px solid rgba(30,58,95,0.3);   display: block; }
```

All: `border-radius: var(--radius-md); padding: 1rem; font-size: 0.9rem; margin-top: 1rem;`

### Stat Card

Glass surface, `border-radius: var(--radius-md)`, `padding: 1.5rem`, centered text.
- Value: `font-size: 2rem; font-weight: 700; color: var(--primary); margin-bottom: 0.25rem;`
- Label: `font-size: 0.9rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;`

### Notice List (Announcements)

```css
.notice-list__item { background: rgba(176,80,40,0.05); border-left: 4px solid var(--secondary); border-radius: 0 var(--radius-md) var(--radius-md) 0; padding: 1rem; }
```

### Spinner

```css
width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 1s ease-in-out infinite;
```

### Navbar Logo

`logo.png` (40px tall, `filter: drop-shadow(0 1px 4px rgba(0,0,0,0.12))`) + site name text.
`font-weight: 800; color: var(--text-main); font-size: 1.5rem; letter-spacing: -0.5px;`

### Landing Pill (clickable card / class selector card)

```css
.landing-pill {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  padding: 1.5rem 2.5rem;
  display: flex; align-items: center; gap: 1.5rem;
  cursor: pointer; transition: var(--transition);
  backdrop-filter: blur(16px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.landing-pill:hover {
  transform: translateY(-5px);
  border-color: var(--primary);
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
}
```

Icon area (`.landing-pill__icon`): 60×60px circle, `background: rgba(30,58,95,0.1)`, `border-radius: 50%`, `color: var(--primary)`.

For inline type badges (Extra / Regular) inside landing pills, use a compact pill span instead of the icon:
```css
/* extra class */
background: rgba(255,191,0,0.15); color: var(--amber);
/* regular class */
background: rgba(115,147,179,0.15); color: var(--primary);
/* shared */
font-size: 0.75rem; font-weight: 600; padding: 0.3rem 0.75rem; border-radius: var(--radius-full); text-transform: uppercase; letter-spacing: 0.05em;
```

### Student Picker

```css
.student-picker { background: rgba(0,0,0,0.02); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem; }
.student-picker__list { max-height: 320px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.25rem; }
.student-picker__item { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 0.75rem; border-radius: var(--radius-md); cursor: pointer; }
.student-picker__item:hover { background: rgba(30,58,95,0.08); }
```

---

## 8. Attendance-Specific Components

These components are only used in the attendance tab (`components/tabs/attendance.html`).

### Classes Grid (Pre-Selection)

```css
.classes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}
@media (max-width: 600px) {
  .classes-grid { grid-template-columns: 1fr; gap: 1rem; }
}
```

Classes are rendered as `.landing-pill` buttons inside this grid.

### Live Summary Bar (`.att-summary`)

Four stat tiles in a flex row. Each tile has a colored background tied to its status.

```css
.att-summary { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.att-summary__stat { flex: 1; min-width: 70px; display: flex; flex-direction: column; align-items: center; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid; gap: 0.2rem; }
.att-summary__count { font-size: 1.75rem; font-weight: 700; line-height: 1; }
.att-summary__label { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.75; }
```

Status colors:
| Modifier | Background | Border | Color |
|----------|------------|--------|-------|
| `--present` | `rgba(16,185,129,0.08)` | `rgba(16,185,129,0.25)` | `#10b981` |
| `--late` | `rgba(196,138,20,0.08)` | `rgba(196,138,20,0.25)` | `var(--amber)` |
| `--absent` | `rgba(184,50,50,0.08)` | `rgba(184,50,50,0.25)` | `var(--cadmium-red)` |
| `--unmarked` | `rgba(0,0,0,0.03)` | `var(--border-color)` | `var(--text-muted)` |

### Attendance Table (`.attendance-table`)

Plain `width: 100%` table inside `.table-wrap`. Row hover: `rgba(30,58,95,0.04)`.

Row status — colored left border on the **first `<td>`** (desktop):
```css
.att-row--present td:first-child { border-left: 3px solid #10b981; }
.att-row--late    td:first-child { border-left: 3px solid var(--amber); }
.att-row--absent  td:first-child { border-left: 3px solid var(--cadmium-red); }
```

On mobile (≤600px), rows stack vertically as flex cards. The left border moves to the row itself:
```css
.att-row--present { border-left: 3px solid #10b981 !important; }
.att-row--late    { border-left: 3px solid var(--amber) !important; }
.att-row--absent  { border-left: 3px solid var(--cadmium-red) !important; }
```

### Attendance Toggles (`.attendance-toggles`)

Three-option radio group rendered as a pill strip. One per student row.

```css
.attendance-toggles {
  display: inline-flex;
  background: rgba(255,255,255,0.4);
  border-radius: var(--radius-full);
  padding: 0.25rem;
  gap: 0.25rem;
  border: 1px solid var(--border-color);
}
.attendance-toggle { position: relative; cursor: pointer; }
.attendance-toggle input { position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none; }
.attendance-toggle__mark {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-full);
  font-size: 0.85rem; font-weight: 500;
  color: var(--text-muted);
  transition: all 0.18s ease;
  user-select: none;
  min-height: 38px;
}
```

Checked states:
```css
/* Present — Emerald */
input[value="present"]:checked ~ .attendance-toggle__mark { background: var(--grade-12); color: white; box-shadow: 0 2px 6px rgba(16,185,129,0.3); }
/* Absent — Ruby */
input[value="absent"]:checked  ~ .attendance-toggle__mark { background: var(--grade-11); color: white; box-shadow: 0 2px 6px rgba(184,50,50,0.3); }
/* Late — Amber */
input[value="late"]:checked    ~ .attendance-toggle__mark { background: var(--amber);    color: white; box-shadow: 0 2px 6px rgba(196,138,20,0.3); }
```

On mobile (≤600px): `.attendance-toggles` goes `width: 100%; display: flex;` and each `.attendance-toggle` gets `flex: 1` with `.attendance-toggle__mark` at `min-height: 44px; width: 100%;`.

### Action Bar (`.att-actions`)

Two rows stacked:
1. **Secondary** (`.att-actions__secondary`): "Mark All Present" + "Add Student" — outline small buttons
2. **Primary** (`.att-actions__primary`): "Save Attendance" (primary, `flex:1`) + "Send WhatsApp" (custom green outline)

```css
.att-actions { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1.5rem; }
.att-actions__secondary { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.att-actions__primary   { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
.att-actions__primary .btn--primary { flex: 1; }
```

WhatsApp button inline style: `background: rgba(37,211,102,0.1); border-color: #25D366; color: #25D366;`

On mobile (≤600px): `.att-actions__primary` goes `flex-direction: column` with all buttons `width: 100%`.

### Sent Row State

When a WhatsApp message is sent for a student, the row is locked:
```css
background: rgba(37,211,102,0.12);
border-left: 3px solid #25D366;
/* inputs inside are disabled */
```

A `"Sent"` badge is appended inline: `background: rgba(37,211,102,0.2); color: #25D366; border-radius: var(--radius-full); font-size: 0.7rem; font-weight: 600; padding: 0.1rem 0.5rem;`

### Guest / Transfer Tags

Inline pill tags on student name cells:
```css
/* Guest tag */  background: rgba(115,147,179,0.15); color: var(--primary);
/* Day tag */    background: rgba(0,0,0,0.06);       color: var(--text-muted);
/* shared */     display: inline-block; padding: 0.15rem 0.5rem; border-radius: var(--radius-full); font-size: 0.7rem; font-weight: 600;
```

---

## 9. Motion & Interaction

```css
--transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

Apply to all interactive elements. Use `transition: all 0.25s ease` for navbar links.

### Hover Conventions

- **Cards / stats on hover:** `transform: translateY(-5px)` + stronger box-shadow
- **Primary / danger buttons:** `box-shadow` with color glow (no translateY)
- **Nav links:** color darkens, subtle white background
- **Table rows:** `rgba(0,0,0,0.03)` background
- **Border highlight on hover:** `border-color: var(--primary)`
- **Landing pills on hover:** `transform: translateY(-5px)` + border goes primary

### Animations

```css
@keyframes fadeUp  { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
@keyframes fadeIn  { from { opacity:0; transform:translateY(5px)  } to { opacity:1; transform:translateY(0) } }
@keyframes spin    { to { transform: rotate(360deg) } }
@keyframes skeleton-shimmer { 0% { background-position:-400px 0 } 100% { background-position:400px 0 } }
```

Use `fadeUp 0.8s` on hero / page load. Use `fadeIn 0.3s` on tab panel reveals, detail views, and dynamically injected content.

---

## 10. Responsive Breakpoints

| Breakpoint | Behaviour |
|------------|-----------|
| `≤600px`   | Attendance rows stack as flex cards; toggles go full-width; classes grid goes single column |
| `≤768px`   | Batch detail goes single column |
| `≤480px`   | Stat grid goes 2-column; stat card padding reduces |
| `≥992px`   | Dashboard gains 2-column layout (`2fr 1fr`) |

Scrollable tab nav hides scrollbar: `scrollbar-width: none; overflow-x: auto; -webkit-overflow-scrolling: touch;`

---

## 11. Do's and Don'ts

**Do:**
- Always use CSS variables — never hardcode colors
- Apply `backdrop-filter: blur(16px)` alongside `--glass-bg` (they are a pair)
- Use `--radius-full` (8px) for buttons/pills, `--radius-lg` (16px) for containers, `--radius-md` (8px) for inputs
- Use `--secondary` (terracotta) for active tab state; `--primary` (navy) for active nav and panel headings
- Add `transition: var(--transition)` to every interactive element
- Keep form inputs on `--bg-surface-hover` background to distinguish from panels
- Use `fadeIn 0.3s` on dynamically injected content
- Set `font-family: var(--font-main)` explicitly on all `<button>` and `<input>` elements
- Use `--font-heading` (Crimson Pro serif) on `h1`–`h4` — it applies automatically via the global rule

**Don't:**
- Don't use dark mode — there is none
- Don't use any external CSS framework (no Tailwind, Bootstrap, etc.)
- Don't use `box-shadow` with heavy opacity — all shadows are very subtle (≤0.1 alpha)
- Don't use `--primary` for active tab buttons (that's `--secondary`)
- Don't add `border-radius` values not in the three standard variables
- Don't hardcode `border-radius: 9999px` — use `var(--radius-full)` which is `8px`
- Don't use emojis in UI text unless the feature already has them
- Don't add `!important` — specificity is handled by class naming (exception: mobile attendance row state overrides)
- Don't use inline `style=""` for layout or color — use classes; reserve inline styles only for dynamic JS-driven values
