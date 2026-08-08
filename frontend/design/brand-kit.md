# DevDocs AI — Brand Kit & Design System

> **Status:** v1.0 · Frontend reference document
> **Scope:** Visual identity, color, typography, layout, component language, code visualization, motion
> **Audience:** Product designers, frontend engineers
> **Products in scope:** DevDocs AI web application (React + TypeScript + Vite)

---

## 1. Product Identity

### 1.1 Product name

**DevDocs AI**

### 1.2 Positioning statement

> DevDocs AI is developer infrastructure for understanding code. Connect a GitHub
> repository and turn it into searchable, queryable documentation — grounded in the
> actual source, not a summary of it.

DevDocs AI is a **codebase intelligence platform**. It is not a generic chat assistant
with a code logo on it. The product sits in the same category as developer tooling that
professionals rely on daily — version-control platforms, code search, CI systems, and
IDE tooling — not in the category of consumer AI apps.

### 1.3 What the product is

| Attribute | Definition |
|---|---|
| **Domain** | Developer productivity and code intelligence |
| **Category** | Infrastructure / tooling (not chatbot / consumer app) |
| **Input** | A GitHub repository |
| **Output** | Indexed documentation, code search results, grounded Q&A answers with source citations |
| **Trust model** | Every AI answer links back to the exact file and line it came from |
| **Vibe when working** | Like an IDE, a good code search engine, and a sharp technical colleague |

### 1.4 Brand essence

```
Professional, precise, and calm — never decorative.
```

DevDocs AI should feel like the **tool itself is a senior engineer**: it reads code,
knows where things live, answers with confidence, and always shows its work.

### 1.5 What we are not

- Not a toy or a novelty demo
- Not a generic "ask me anything" bot
- Not a marketing site that hides the product behind mockups
- Not a "wrapper" that feels temporary

### 1.6 Tagline options

- Primary (product): **"Codebase intelligence for developers"**
- Hero (working): **"Understand any codebase — with sources."**
- Descriptive: **"Search, document, and query any GitHub repository."**

---

## 2. Target Users

The primary users are people who spend their working hours inside code. The interface
must respect their attention, their speed, and their tolerance for noise.

| User | Primary task | What they need from the UI |
|---|---|---|
| **Software developer** | Find where a feature lives, understand how it works, modify it safely | Fast search, precise results, readable snippets, low friction |
| **Engineering team** | Onboard members, share knowledge, keep docs current | Reusable flows, shared URLs/state, consistent output |
| **Technical lead** | Evaluate architecture, review boundaries, answer design questions | Broad overview, repo statistics, high-signal Q&A |
| **Startup engineer** | Move fast across many small codebases | Instant setup, minimal clicks, copyable answers |
| **Open-source developer** | Contribute to unfamiliar projects | Clear entry points, respect for existing code structure |
| **Student** | Learn real, large codebases | Approachable explanations, visible evidence, gentle scaffolding |
| **New-join dev** | Orient in a large unfamiliar repository | Orientation aids: repo tree, file paths, breadcrumbs, citations |

### 2.1 Design consequences of the audience

- **Respect density.** Developers read fast. Do not stretch content to fill screens or
  space features out for visual comfort.
- **Show evidence.** Every claim the product makes (search hit, answer, stat) should be
  inspectable and traceable.
- **No hand-holding noise.** Avoid celebratory copy, confetti, mascots, or animated
  success states. A calm, correct result is the reward.
- **Keyboard and clipboard first.** Copy affordances, focus management, and predictable
  tab order matter more than decorative delight.

---

## 3. Product Promise

> **DevDocs AI helps developers understand large codebases faster** by connecting GitHub
> repositories with AI-powered search, documentation, and codebase Q&A — with every
> result grounded in the real source.

The promise rests on three pillars:

1. **Speed to understanding.** From "I have a repo" to "I know what this code does"
   should be minutes, not days.
2. **Grounded in source.** Answers and search results come from the repository, and the
   product always shows where they came from.
3. **Trust through traceability.** File paths, line numbers, and citations are first-class
   UI elements, never an afterthought.

### 3.1 What we never promise

- We do not claim to understand code better than the team that wrote it.
- We do not present AI output as authoritative — we present it as *sourced*.
- We do not pretend the product replaces reading code. It makes reading code faster.

---

## 4. Brand Personality

### 4.1 Personality traits

| Trait | In practice |
|---|---|
| **Technical** | Speaks in file paths, line numbers, and precise terms |
| **Premium** | Restraint, finish, and consistency over flash |
| **Intelligent** | Answers are structured, dense, and useful on first read |
| **Precise** | Exacts the point; no filler, no vagueness |
| **Confident** | Assertive defaults; never apologetic or hesitant |
| **Minimal** | Nothing on screen that doesn't earn its place |
| **Developer-focused** | Keyboard-friendly, mono typography for code, dense data |
| **Modern** | Current, clean, technically current — not trend-chasing |
| **Trustworthy** | Shows sources, fails honestly, never fabricates confidence |

### 4.2 Voice and microcopy

- Write like a senior engineer writing release notes: **short, specific, calm**.
- Prefer concrete verbs: *analyze, search, cite, index, connect, query*.
- Avoid: marketing exclamation marks, emoji, "unlock the power of", "seamlessly",
  "supercharge", "revolutionize".
- States say what is happening, not a personality: "Indexing 1,284 files…" not
  "Your repo is getting smarter!".

### 4.3 Never

Playful · childish · novelty · hype · apologetic · cutesy · generic.

---

## 5. Visual Direction

### 5.1 The bar

The interface should look like it was designed by an experienced product designer and
implemented by a senior frontend engineer. Reference quality: **Linear, Vercel,
Sourcegraph, Raycast, GitHub, Retool, Sentry, PostHog**.

### 5.2 Guiding principles

1. **Engineering over decoration.** Elevation is communicated with 1px borders and
   small, tight shadows — not gradients and glows.
2. **Restraint is the premium move.** If an effect draws attention to itself, remove it.
3. **Density done well.** Information-dense is good; cramped is not. Generous internal
   padding with tight vertical rhythm.
4. **The accent is a tool, not a theme.** One accent color, applied only where it means
   something: primary actions, active states, links, key highlights.
5. **Real tooling, not templates.** Every pattern must behave like developer software
   (copy, focus, scroll, keyboard) — not just look like a screenshot.

### 5.3 Deprecated "AI-generated look"

These patterns are explicitly **not** allowed:

- ❌ Excessive multi-stop gradients (buttons, headers, text)
- ❌ Giant glowing background blobs / radial color washes
- ❌ Heavy glassmorphism (blurred translucent panels everywhere)
- ❌ The generic "AI purple" treatment
- ❌ Overly rounded cards (radii > 14px on surfaces)
- ❌ Floating decorative elements that don't do anything
- ❌ Emoji as UI, icons, or status
- ❌ Generic dashboard templates (three identical "insight" cards with a gradient chart)
- ❌ Deep drop shadows and diffuse glow shadows
- ❌ Constant motion, parallax, auto-scrolling marquees

The current implementation contains several of these patterns (purple radial hero glow,
purple grid wash, gradient primary button, gradient title text, glow box-shadows).
The system below replaces them with a quieter, engineering-grade treatment.

### 5.4 What carries over from the current app

The existing frontend already gets several things right. Keep them:

- ✅ Dark-first, high-contrast developer aesthetic
- ✅ Inter + JetBrains Mono typography
- ✅ Sticky navigation with backend status
- ✅ Snippet-style search results with file paths and scores
- ✅ Sourced Q&A answers with code blocks and citation cards
- ✅ Skeleton loading, step progress, and clean empty states

---

## 6. Color System

### 6.1 Overview

Dark-first, neutral-charcoal base with a single **signal blue** accent. The palette is
desaturated so color *means* something when it appears. Text hierarchy is handled with
luminance, not hue.

### 6.2 Accent rationale

The previous purple (`#8b5cf6`) reads as "generic AI." The new accent is an engineered
blue (`#4c8eff`) — the same family professional developers trust in GitHub, IDE themes,
and CI tooling. It is applied sparingly.

### 6.3 Surfaces (backgrounds)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0A0B0E` | App background (deepest) |
| `--bg-elevated` | `#0F1116` | Sticky nav, panels, results list |
| `--bg-surface` | `#14161C` | Cards, forms |
| `--bg-inset` | `#0C0E12` | Inputs, code blocks, wells |
| `--bg-hover` | `#191C23` | Hover fills |
| `--bg-active` | `#1E222B` | Pressed / selected fills |

Elevation rule: **surface → border is enough.** Use the next surface token to layer;
reach for a shadow only for floating elements (dropdowns, modals).

### 6.4 Borders

| Token | Value | Use |
|---|---|---|
| `--border` | `rgba(255,255,255,0.07)` | Default borders |
| `--border-strong` | `rgba(255,255,255,0.12)` | Inputs, code blocks, emphasis |
| `--border-faint` | `rgba(255,255,255,0.04)` | Hairlines, dividers |
| `--border-hover` | `rgba(255,255,255,0.16)` | Hover borders |

### 6.5 Text

| Token | Value | Contrast (on `--bg`) | Use |
|---|---|---|---|
| `--text-primary` | `#E7EAF0` | ~15:1 | Headings, key values, answers |
| `--text-secondary` | `#A4AAB7` | ~9:1 | Body copy, descriptions |
| `--text-muted` | `#6E7480` | ~4.7:1 | Labels, metadata, hints |
| `--text-faint` | `#4A4F59` | ~3:1 | Disabled, placeholders, ghosts |
| `--text-on-accent` | `#FFFFFF` | — | Text on accent fills |

Rules:
- Body text is never `--text-muted` or below.
- Metadata can drop to `--text-muted`; only decorations go to `--text-faint`.

### 6.6 Accent (signal blue) — used sparingly

| Token | Value | Use |
|---|---|---|
| `--accent` | `#4C8EFF` | Primary actions, active states, links, focus |
| `--accent-hover` | `#6AA5FF` | Accent hover |
| `--accent-active` | `#3A76E0` | Accent pressed |
| `--accent-text` | `#9DC1FF` | Accent-tinted text on dark (links, highlights) |
| `--accent-soft` | `rgba(76,142,255,0.10)` | Accent tint fills (selected rows, chips) |
| `--accent-border` | `rgba(76,142,255,0.30)` | Accent borders (active inputs, chips) |
| `--accent-underline` | `rgba(76,142,255,0.45)` | Link underlines, highlight markers |

**Usage rules for the accent:**
- Primary CTA buttons (one per view maximum).
- Focus rings and active navigation.
- Links and inline references.
- The active step in a progress sequence.
- Highlighted search match within a snippet.
- Small status indicators (dots, badges) — and only where the status is *active/selected*.

**Where the accent must NOT appear:**
- As a page background wash.
- On large typography (headlines stay near-white).
- As a default for every icon.
- On every card border.

### 6.7 Semantic colors

| Token | Value | Soft bg | Border | Use |
|---|---|---|---|---|
| Success (`--green`) | `#37B079` | `rgba(55,176,121,0.10)` | `rgba(55,176,121,0.30)` | Connected, indexed, complete, scores |
| Danger (`--red`) | `#F2645A` | `rgba(242,100,90,0.10)` | `rgba(242,100,90,0.30)` | Errors, failures, offline |
| Warning (`--yellow`) | `#D9A23C` | `rgba(217,162,60,0.10)` | `rgba(217,162,60,0.30)` | Warnings, degraded states |

Semantic colors are used as **fills with a matching soft background and border**, never
as glowing blobs. Success green is used for numeric scores and online status only.

### 6.8 Color implementation (CSS)

```css
:root {
  color-scheme: dark;

  --bg: #0A0B0E;
  --bg-elevated: #0F1116;
  --bg-surface: #14161C;
  --bg-inset: #0C0E12;
  --bg-hover: #191C23;
  --bg-active: #1E222B;

  --border: rgba(255, 255, 255, 0.07);
  --border-strong: rgba(255, 255, 255, 0.12);
  --border-faint: rgba(255, 255, 255, 0.04);
  --border-hover: rgba(255, 255, 255, 0.16);

  --text-primary: #E7EAF0;
  --text-secondary: #A4AAB7;
  --text-muted: #6E7480;
  --text-faint: #4A4F59;
  --text-on-accent: #FFFFFF;

  --accent: #4C8EFF;
  --accent-hover: #6AA5FF;
  --accent-active: #3A76E0;
  --accent-text: #9DC1FF;
  --accent-soft: rgba(76, 142, 255, 0.10);
  --accent-border: rgba(76, 142, 255, 0.30);
  --accent-underline: rgba(76, 142, 255, 0.45);

  --green: #37B079;
  --green-soft: rgba(55, 176, 121, 0.10);
  --green-border: rgba(55, 176, 121, 0.30);

  --red: #F2645A;
  --red-soft: rgba(242, 100, 90, 0.10);
  --red-border: rgba(242, 100, 90, 0.30);

  --yellow: #D9A23C;
  --yellow-soft: rgba(217, 162, 60, 0.10);
  --yellow-border: rgba(217, 162, 60, 0.30);

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.30);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.28);
  --shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.35);
  --shadow-pop: 0 20px 60px rgba(0, 0, 0, 0.45);
  --focus-ring: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent);

  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 12px;
  --radius-full: 999px;
}
```

---

## 7. Typography

### 7.1 Fonts

Keep the current pairing — it is already correct for developer software.

| Role | Family | Notes |
|---|---|---|
| **UI & text** | **Inter** (400/500/600/700) | Neutral, highly legible, standard in dev tooling |
| **Code & data** | **JetBrains Mono** (400/500/600) | Excellent for code, file paths, and numeric data |

Recommended fallbacks:
```
--font-sans: 'Inter', -apple-system, 'Segoe UI', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'SFMono-Regular', 'Cascadia Code', Consolas, monospace;
```

Optional upgrades if licensing allows: **Geist Sans / Geist Mono** (Vercel) as a closer
match to modern infrastructure products. Do not mix more than two families.

### 7.2 Type scale

| Token | Size | Weight | Line-height | Tracking | Use |
|---|---|---|---|---|---|
| Display | 40–56px | 700 | 1.05 | -0.03em | Landing hero, key moments only |
| H1 | 32px | 700 | 1.10 | -0.025em | Page titles |
| H2 | 24px | 650 | 1.20 | -0.02em | Section headings |
| H3 | 18px | 600 | 1.30 | -0.015em | Card titles, sub-blocks |
| Body | 15–16px | 400 | 1.60 | 0 | Paragraphs, answers |
| Body small | 13.5px | 400 | 1.55 | 0 | Descriptions, footnotes |
| Caption | 12.5px | 450 | 1.45 | 0 | Metadata, timestamps |
| UI label | 13px | 550 | 1.20 | +0.005em | Buttons, form labels, nav |
| Overline | 11.5px | 600 | 1.30 | +0.10em · uppercase | Section eyebrows, panel titles |
| Code | 12.5–14px | 400 | 1.60 | 0 | Code blocks, snippets |
| Code label | 11.5px | 600 | 1.30 | +0.06em · uppercase | Code block language, chip labels |
| Data | 13–15px mono | 600 | 1.30 | 0 · `tabular-nums` | Counts, scores, stats |

### 7.3 Hierarchy rules

- Hierarchy comes from **weight and size**, never color tricks or giant type.
- Max two sizes apart on a single view. The landing hero is the only place "Display" is used.
- Headings are near-white (`--text-primary`), never accent-colored.
- Never render body copy in mono. Mono is for code, paths, identifiers, and numeric data.
- Enable `font-feature-settings: 'cv02','cv03','cv04','cv11'` for Inter (alternate
  digits/glyphs) and `font-variant-numeric: tabular-nums` for all numeric columns.
- Keep lines ≤ ~70ch for prose to preserve readability in the wider layout.

---

## 8. Layout

### 8.1 Frame

| Setting | Value |
|---|---|
| Max content width | **1200px** (marketing + standard workspaces) |
| Wide workspace width | **1400px** (code/file browsers, Q&A workspaces) |
| Container gutters | 32px desktop · 24px tablet · 16px mobile |
| Nav height | 60px desktop · 56px mobile |
| Page side margins | equal to container gutters; content never touches edges |

### 8.2 Grid

- 12-column grid within the container.
- Column gap: **20px** desktop · **16px** tablet · **12px** mobile.
- Two-column and three-column cards use the same grid math — no ad-hoc gutters.
- Marketing sections may be centered on an 8-column measure (max ~720px) for prose.

### 8.3 Spacing scale (4px base)

```
--space-1: 4px   --space-2: 8px   --space-3: 12px  --space-4: 16px
--space-5: 20px  --space-6: 24px  --space-8: 32px  --space-10: 40px
--space-12: 48px --space-16: 64px --space-20: 80px --space-24: 96px
```

### 8.4 Spacing conventions

| Context | Rule |
|---|---|
| Card internal padding | 24px (20px dense / compact views) |
| Card-to-card gap | 16–20px |
| Section spacing (vertical) | 96px desktop · 64px tablet · 48px mobile |
| Section heading to content | 40px |
| List rows (results, sources) | 8px gap between rows, 12px row padding |
| Nav link gap | 4px (row padding 8×12px) |
| Form field stack | 16px between fields, 8px label→input |
| Between component groups | 24–32px |
| Answer body → citations | 24px, separated by a hairline divider |

### 8.5 Breakpoints

| Breakpoint | Behavior |
|---|---|
| `≤1280px` | Max-width applies; grid stays 12-col |
| `≤1024px` | 3-col grids → 2-col; workspace splits stack |
| `≤768px` | Nav collapses to menu; 2-col → 1-col; section spacing 64px |
| `≤560px` | Single column; gutters 16px; buttons full-width in forms; section spacing 48px |

---

## 9. UI Principles

### 9.1 Shared rules

- **States, not surprises.** Every interactive element has idle, hover, focus-visible,
  active, disabled, and (where relevant) loading states — defined before work begins.
- **Focus is visible.** `:focus-visible` shows a 2px accent ring offset 2px. Never remove
  focus styles. This is both accessibility and craft.
- **Hit targets ≥ 32px** (44px for icon-only buttons).
- **Copy is everywhere.** Any code, path, or answer can be copied with one action.

### 9.2 Buttons

| Element | Spec |
|---|---|
| Structure | `--radius-md` (8px); height 36px default, 44px large, 32px small; horizontal padding 16/20/12px |
| Primary | `--accent` fill, `--text-on-accent` label, 1px transparent border; hover `--accent-hover`; active `--accent-active`; **flat fill, no gradient, no glow** |
| Secondary / ghost | `--bg-surface` fill, `--border-strong` border, `--text-primary`; hover `--bg-hover` + `--border-hover` |
| Tertiary / text | Transparent, accent or primary text, underline on hover only |
| Disabled | `opacity: 0.5`, `cursor: not-allowed`, no shadows |
| Label | UI label 13px / 550; never uppercase body text |

Only **one** primary button per view. Secondary actions are ghosts. Icons inside buttons
are 15–16px, always aligned, always labeled where space allows.

### 9.3 Inputs

- Background `--bg-inset`, border `--border-strong`, `--radius-md`.
- Focus: border → `--accent`, plus `--focus-ring` (never a soft blur glow).
- Labels: UI label, `--text-muted`; placeholders `--text-faint` — placeholders are never
  used as labels.
- Prefix icons (search, link, code) at left, `--text-muted`, `pointer-events: none`.
- Error: 1px `--red` border + inline `--red-soft` message row with icon.
- Text areas (Q&A) keep `resize: vertical`, comfortable min-height (92px), and a
  `mono`-style meta row for context (repo, model) underneath.

### 9.4 Navigation

- Sticky top bar, `--bg-elevated` with a single hairline bottom border
  (`--border-faint`). Translucency/backdrop-blur is acceptable **only** over scrolling
  content — no decorative glass.
- Links: secondary text, 8×12px row padding, `--radius-sm`; hover = `--bg-hover` +
  primary text; **active/current = accent text**.
- Brand mark sits left, primary actions right (status, GitHub link, CTA).
- Mobile: hamburger at `≤768px`, menu is a flat elevated panel — no slide animations.

### 9.5 Cards

- Fill `--bg-surface`, border `--border`, `--radius-lg` (10px).
- Elevation: **border only**. Shadows are reserved for floating surfaces.
- Card headers: title (H3/17px) + optional `--text-muted` meta on the right.
- Hover (only when interactive): border → `--border-hover`, background → `--bg-hover`,
  no lift, no translate, no glow line.

### 9.6 Code blocks

Full spec in §10. Never a plain `<pre>` without: a header (language + copy), inset
background, and correct mono sizing.

### 9.7 Repository information

- Repository identity is always shown as `owner/repo` in mono, primary text.
- Stats (files, lines, languages, size) render in mono `tabular-nums` with
  `--text-muted` labels — a data table, not an infographic.
- Repository status (connected / indexing / indexed) uses the semantic dot pattern:
  8px dot + label, `--green` for ready, `--yellow` pulsing only while indexing, `--red`
  on failure.

### 9.8 Search results

- Result = row with **file path header** (mono) + **snippet body** (mono 12.5px).
- Matches inside the snippet are highlighted with `--accent-soft` background behind the
  matched span and `--accent-underline` — one visible marker, not a neon block.
- Score (relevance) renders as a small mono badge in success green with
  `tabular-nums`; do not over-decorate.
- Rows separate with 8px gaps; hover brightens border only.

### 9.9 AI responses

- Answers live in a panel with a header row: responder label ("DevDocs"), format badge,
  and answer metadata on the right.
- Body: rendered markdown (headings ≤ H3, lists, inline code, blockquotes) with
  `--text-secondary` body and `--text-primary` emphasis. Never style the whole answer in
  accent.
- Streaming/thinking state: a quiet row ("Analyzing `src/services/rag.ts`…") with a
  three-dot pulse. No shimmering or rotating chat avatars.

### 9.10 Citations

- A distinct, labeled block below the answer: "Sources · N".
- Each source = a row card: file path (mono), line range, language chip, relevance
  score, and a **"Open in GitHub"** external link.
- Clicking a citation should also scroll/highlight the corresponding source context when
  in a combined view.
- Citations are the product's trust contract — never render an answer without them.

### 9.11 Loading states

- **Skeletons** for search/results: shimmer at `--bg-hover` base, 1.5s loop, respecting
  `prefers-reduced-motion`. Shape matches the final content layout exactly.
- **Progress** (repo indexing): vertical step list — complete = green check, active =
  accent ring (subtle pulse), pending = faint dot. Show real counts/details per step in
  mono.
- Buttons that trigger async work: keep label, swap icon for a 15px spinner (accent).
- Never block the page; keep the previous content visible.

### 9.12 Error states

- Inline alert: `--red-soft` fill, `--red-border`, icon + `13.5px` message, stacked
  under the failing control.
- Panel error: same alert on an elevated card with a retry action (ghost button).
- Language: specific and honest. "Failed to index `owner/repo` (rate limit)." not
  "Oops! Something went wrong."

### 9.13 Empty states

- Centered on the container, icon in a bordered square (48px), title (15.5px, primary),
  one-line explanation (`--text-muted`, max 40ch), one suggested action.
- Empty states are **invitations to act**, never decoration: offer a suggested
  question chip, an example repo, or a primary action.
- "No results" and "Not connected yet" are distinct states with different guidance.

### 9.14 Tooltips

- Small, dark (`--bg-elevated`), 1px `--border-strong`, `--radius-sm`, 12px text,
  max ~28ch, appear after ~250ms hover, dismiss instantly, positioned with 8px offset.
- Use for icon-only actions and truncated paths. Never use tooltips to convey critical
  information that must be discoverable.

---

## 10. Code Visualization

This is the core of the product. These elements must feel like real developer tooling —
an IDE or a code-search engine — not decorated `<pre>` tags.

### 10.1 Code blocks

| Property | Value |
|---|---|
| Background | `--bg-inset` |
| Border | `--border-strong` |
| Radius | `--radius-md` (8px) |
| Font | `JetBrains Mono`, 13px, line-height 1.6 |
| Header | `--bg-surface` bar with language label (mono, uppercase, 11.5px, `--text-muted` or accent for active) + copy button right |
| Body | horizontal scroll on overflow; custom thin scrollbar (8px, `--border-strong` thumb) |
| Copy | header button toggles to "Copied" (success green + check icon) for ~1.6s |

### 10.2 Syntax highlighting

Desaturated token palette (GitHub-dark lineage, **no purple**). Consistent across every
code surface:

| Token | Color | Example |
|---|---|---|
| Comment | `#616A76` italic | `// fetch config` |
| String | `#A5D6FF` | `"owner/repo"` |
| Keyword | `#FF7B72` | `const`, `async`, `return`, `fn` |
| Number | `#79C0FF` | `1_024`, `0.5` |
| Function | `#79C0FF` | `indexFiles(...)` |
| Type | `#F0A35C` | `Repository`, `Vector` |
| Constant / property | `#E3B341` | `MAX_RETRIES`, `type: 'dir'` |
| Punctuation / default | `#A4AAB7` | `{}[]();,` |

Rules:
- Highlights aid scanning; they never shout. Keep contrast moderate against `--bg-inset`.
- Keyword and function must remain distinguishable (weight + hue), even in low contrast.
- If a proper highlighter library is added later, keep this exact token mapping.

### 10.3 File paths & line numbers

- **File paths**: mono, 12.5–13px, `--text-primary`, `word-break` only when required.
  Directory segments dimmed to `--text-muted`; basename full `--text-primary`.
  Separators as `/` or ` › ` chevrons in `--text-faint`.
- **Line numbers**: right-aligned gutter (4ch), `--text-faint`, `tabular-nums`, 1px
  hairline divider from code body. Used in full-file and diff views, and in source
  citations (as `file.ts:42–58`).
- **Line ranges** appear in citations and results as `:12–34` in mono, `--text-muted`.

### 10.4 Repository tree

- Rows: mono file path, indent guides (1px `--border-faint` vertical rules).
- Folder icons (chevron/folder outline) and file icons 14px, `--text-muted`.
- Active/highlighted row: `--bg-hover` fill + accent-colored file icon; never a full
  accent background.
- Directory names `--text-secondary`, files `--text-primary`.
- Optional language dot per row: 6px `--text-muted` dot — color only if the language has
  an established brand color and contrast allows.

### 10.5 Search results (code mode)

- Header: file icon (accent) + path + language chip + score badge.
- Body: snippet in mono, `--text-secondary`, `pre-wrap`, max-height ~220px with scroll.
- **Match highlight**: matched text wrapped in a span with `--accent-soft` background
  and 2px bottom `--accent-underline`. Exactly one style of match marker.
- Show surrounding context lines before/after the match (context beats length).

### 10.6 Source citations

- Row card: 32px bordered icon square (file), `file.ts` mono primary, meta line
  `src/services · TypeScript · :42–58 · 0.87` all `--text-muted`, and an external
  "Open in GitHub" link.
- Hover: `--border-hover` + `--bg-hover`. The GitHub link is the only accent-tinted
  element in the row.
- A citation without a line range is treated as a degraded state — keep, but mark the
  range as `—` rather than hiding it.

### 10.7 "Real tooling" checklist

- [ ] All paths selectable and copyable
- [ ] All code blocks have copy affordance
- [ ] Horizontal scrolling is smooth and styled, not default overflow
- [ ] Long paths truncate predictably with `text-overflow: ellipsis` + title
- [ ] Line ranges and scores are `tabular-nums`
- [ ] No code is ever rendered in a rounded pill with a gradient

---

## 11. Motion

Restraint is a brand value. Motion communicates state; it never performs.

### 11.1 Tokens

```
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);   /* entrances, reveals */
--ease-default: cubic-bezier(0.2, 0, 0, 1);  /* state changes */
--duration-fast: 120ms;   /* hovers, borders, colors */
--duration-base: 200ms;   /* standard state transitions */
--duration-entrance: 300ms; /* page/section entrances — rare */
```

### 11.2 What may animate

| Context | Allowed |
|---|---|
| Hover | Color/border changes only (`--duration-fast`) — **no scale, no lift** |
| Press | 1px translateY on buttons |
| Focus | Instant ring appearance (no animation) |
| Dropdowns/menus | Opacity + 8px translateY, 160ms |
| Entrance | Sections fade/rise once (opacity + 12px), `--duration-entrance`, staggered ≤120ms, first paint only |
| Loading | Skeleton shimmer 1.5s; step pulse 1.8s; status dot pulse 1.2s |
| Copy feedback | "Copied" swap instant, revert after 1.6s |
| Page transitions | Cross-fade 200ms, optional 8px vertical drift — one per route change, not per scroll |

### 11.3 What must never animate

- Continuous rotation (except the 15px button spinner)
- Parallax and scroll-triggered reveals on the marketing page
- Auto-scrolling or marquee
- Floating/bobbing elements
- Blinking text
- Hover transforms on cards (scale/translate)
- Background color shifts, hue cycling, or gradient animation

### 11.4 Reduced motion

Honor `prefers-reduced-motion: reduce` at the root: kill all entrance animations,
staggering, and pulse loops; keep only opacity-based loading indicators. This is
non-negotiable accessibility and it also keeps the product feeling professional on
developer machines (many run reduced-motion or low-power).

---

## 12. Design Principle

> **The final product must look like it was designed by an experienced product designer
> and implemented by a senior frontend engineer — never generated.**

### 12.1 The standard

- Every pixel is intentional. If a value can't be justified (why 14px? why purple?),
  it gets re-examined.
- Consistency is enforced with tokens — nothing is hard-coded.
- The interface is as good in its empty, loading, and error states as it is in its
  happy path.
- Accessibility is part of the design: contrast ≥ 4.5:1 for text, visible focus,
  keyboard flow, reduced motion.

### 12.2 Implementation checklist (frontend)

- [ ] Migrate all colors/radii/spacing to CSS custom properties from §6–§8
- [ ] Remove radial-gradient hero blobs; replace with a flat `--bg` + hairline grid or
      a quiet flat visual
- [ ] Replace the gradient primary button and gradient headline text with flat accent
- [ ] Remove glow box-shadows; keep 1px borders and the `--shadow-*` set only for
      floating surfaces
- [ ] Reduce radii to the §6 scale (cards 10px, buttons/inputs 8px, code 8px)
- [ ] Tokenize syntax colors (§10.2) across every code surface
- [ ] Apply the match-highlight spec (§10.5) in search results
- [ ] Ensure every answer renders citations (§9.10) — no exceptions
- [ ] Wire `prefers-reduced-motion` (§11.4)
- [ ] Sweep for emoji, decorative glows, hover-lift transforms, and marquees — remove

### 12.3 Anti-patterns (final gate)

If any of these appear in a review, it fails:

- A purple gradient glow behind anything
- A primary button that looks "glossy"
- More than one accent color in a view
- Card radius above 14px
- An animated element that doesn't communicate state
- Text on a background below 4.5:1 contrast
- An AI answer with no visible sources

---

## Appendix A — Current implementation → new system mapping

High-signal mapping so the existing app can transition without being rebuilt blindly.

| Current (styles.css) | New token | Change |
|---|---|---|
| `--bg: #09090d` | `--bg: #0A0B0E` | Neutralized (less purple cast) |
| `--accent: #8b5cf6` (purple) | `--accent: #4C8EFF` (signal blue) | Replaces "AI purple" |
| `--radius: 14px` / `--radius-lg: 20px` | `--radius-lg: 10px` / `--radius-xl: 12px` | Tighter, more engineered |
| Gradient `.btn-primary` | Flat accent fill | Remove gradient + glow shadow |
| `.hero-bg` radial purple wash + grid | Flat background + optional hairline grid | Remove blobs |
| `.hero-title-accent` gradient text | Near-white headline, accent only on underline/links | Restraint |
| Glow shadows (`--shadow-pop` accent glow) | `--shadow-pop` neutral | Remove colored glows |
| `tok-*` purple tokens | §10.2 GitHub-dark palette | Blue/coral/orange, no purple |
| Inter + JetBrains Mono | Keep (§7) | Unchanged |
| Section padding 112px / 96px hero | 96px / 80px (§8.4) | Slightly tighter |

### Design token quick reference

```css
:root {
  --font-sans: 'Inter', -apple-system, 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'SFMono-Regular', 'Cascadia Code', Consolas, monospace;

  --max-width: 1200px;
  --max-width-wide: 1400px;
  --nav-height: 60px;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-default: cubic-bezier(0.2, 0, 0, 1);
  --duration-fast: 120ms;
  --duration-base: 200ms;
  --duration-entrance: 300ms;
}
```

---

*DevDocs AI · Brand Kit v1.0 · This document defines the target design system. Apply it
without modifying backend behavior, API routes, RAG, ingestion, embeddings, search, or
authentication.*
