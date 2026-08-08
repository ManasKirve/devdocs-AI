# DevDocs AI — Visual Direction Reference

> **Status:** v1.0 · Companion to `brand-kit.md`
> **Scope:** Concrete visual references for the React frontend — landing hero, product surfaces, code language, cards, navigation, backgrounds, and all system states
> **Audience:** Product designers, frontend engineers
> **Rule of thumb:** Every decision must pass the test in §11 — *"Would this look normal inside a serious $10k developer SaaS product?"*

All color, type, spacing, radius, and motion tokens referenced below are defined in
`brand-kit.md` §6–§8 and §11. This document shows how those tokens are composed into
real screens and states.

---

## 1. Landing Hero

### 1.1 Composition

The hero is a **working product preview**, not a claim. It shows the four verbs of the
product in a single quiet composition: **connect → analyze → search → ask**.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  navbar (60px, sticky, hairline bottom)                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│    ● AI-powered codebase intelligence                  ← eyebrow, overline│
│                                                                          │
│    Understand any codebase — with sources.             ← display, 700     │
│                                                                          │
│    Connect a GitHub repository and turn it into                         │
│    searchable, queryable documentation. Answers                        │
│    grounded in your actual code.                        ← body, 18px      │
│                                                                          │
│    [ github.com/owner/repository          ] [ Analyze ] ← repo input     │
│                                                                          │
│    ┌────────────────────────────────────────────────────────────────┐    │
│    │  repository workspace (mock — a real product surface)          │    │
│    │  ┌────────────┬──────────────────────────┬──────────────────┐  │    │
│    │  │ tree       │  code preview            │  analysis        │  │    │
│    │  │ ▼ src/     │  1  import { index }     │  Summary         │  │    │
│    │  │  services/ │  2  const client = ...   │  · 1,284 files   │  │    │
│    │  │  rag.ts    │  3  ...                  │  · 42% TS        │  │    │
│    │  │  search.ts │  4  ...                  │  Ask a question… │  │    │
│    │  └────────────┴──────────────────────────┴────────[Ask]─────┘  │    │
│    └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│  footer                                                                  │
└──────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Element-by-element spec

| Element | Treatment |
|---|---|
| **Eyebrow** | Overline (11.5px, mono, uppercase, `+0.10em`), `--text-muted`; preceded by a 6px accent dot, **no glow**. Reads "AI-powered codebase intelligence". |
| **Headline** | Display (40–56px, weight 700, `-0.03em`), `--text-primary`. One line carries a **mono highlight** instead of a gradient — e.g. "Understand any codebase — *with sources.*" where "sources" sits in `JetBrains Mono` at accent-tinted `--accent-text`. The mono substitution is the premium move; it says "this is about code" without decoration. |
| **Subcopy** | Body 18px, `--text-secondary`, max-width 620px, centered. States the product promise verbatim (brand kit §3). No tagline padding. |
| **Repository input** | A single-line input (36px+ tall) with a link/GitHub prefix icon, placeholder `github.com/owner/repository`, plus one primary button "Analyze". The input is the hero's primary action — it must read as a *command line*, not a newsletter form. |
| **Workspace mock** | A real three-pane preview (tree / code / analysis) rendered with **actual UI surfaces** — not a screenshot texture. Uses `--bg-elevated` panel, `--border-strong` frame, `--radius-xl` (12px). It is framed by the hero border but never contains gradients, glows, or floating labels. |
| **Frame** | The mock sits inside a bordered window with a hairline top strip (optional: a "workspace" label + backend status dot on the right). One restrained lift shadow (`--shadow-lg`) only. |

### 1.3 What the hero must NOT do

- ❌ No generic chat bubble with a robot avatar
- ❌ No purple radial glow, no grid wash, no floating particles
- ❌ No gradient headline text
- ❌ No "type any question here…" placeholder that implies a chatbot
- ❌ No CTA that goes nowhere — the mock always implies a real next screen

### 1.4 Motion (first paint only)

Hero elements fade/rise once (opacity + 12px, `--duration-entrance`, stagger ≤120ms:
eyebrow → headline → subcopy → input → workspace). Never repeats, never scroll-triggered.

---

## 2. Product UI

The product is a **workspace**, not a page of cards. The canonical layout is a
three-pane developer surface, with a light marketing layout for feature sections.

### 2.1 Workspace shell

```
┌───────────────┬─────────────────────────────────────────────┬─────────────────┐
│  navbar       │                                             │                 │
├───────────────┤                                             │                 │
│  repository   │  main column                               │  inspector      │
│  pane         │  · search results / code view / repo view  │  · Q&A panel    │
│               │                                             │  · answer       │
│  tree         │                                             │  · sources      │
│  files        │                                             │                 │
├───────────────┼─────────────────────────────────────────────┼─────────────────┤
│  status bar   │  context breadcrumb + actions              │  status         │
└───────────────┴─────────────────────────────────────────────┴─────────────────┘
```

| Pane | Surface | Role |
|---|---|---|
| Repository / tree | `--bg` (base), 240–280px | Orientation: repo identity, file tree, stats |
| Main column | `--bg` base | Search results, code preview, repository overview |
| Inspector / Q&A | `--bg-elevated` panel, 380–420px, left hairline border | Q&A input, streaming answer, source citations |
| Status bar | `--bg-elevated`, 32px, top hairline | Repo path, indexing state, error toasts |

Borders between panes are **single 1px hairlines** (`--border-faint`/`--border`), never
shadowed gutters.

### 2.2 Repository analyzer

- Identity block: `owner/repo` in mono, `--text-primary`, weight 600; below it a
  meta row of stats rendered as mono `tabular-nums` with `--text-muted` labels —
  **a data table, not an infographic** (files · lines · languages · indexed size).
- Status: dot + label (8px dot, green = ready, yellow pulse only while indexing, red =
  failed). Never a progress ring with a percentage in it.
- Indexing progress: vertical step list (analyze → fetch → chunk → embed → index).
  Complete = green check; active = accent ring with subtle pulse; pending = faint dot.
  Each step shows a **mono detail line** with real counts ("1,284 files",
  "embedding chunk 512/1,284").

### 2.3 Codebase explorer (tree)

- Indented tree rows, 1px `--border-faint` guide lines, folder/file icons 14px at
  `--text-muted`. Directories `--text-secondary`, files `--text-primary`.
- Active row: `--bg-hover` fill + accent file icon. Selected row stays quiet — no full
  accent backgrounds.
- Collapse/expand chevrons rotate 90° over `--duration-fast`. Entire pane shares one
  vertical scrollbar.

### 2.4 Search interface

- Search bar: `--bg-inset`, `--border-strong`, `--radius-md`, prefix search icon,
  keyboard shortcut hint (`/`) as a small mono kbd chip on the right.
- Active repo context shown as a mono chip beside the bar (`owner/repo`).
- Results list: rows separated by 8px gaps, each row = mono file-path header + snippet.
- Match highlight: `--accent-soft` background + 2px `--accent-underline` under the
  matched span — **one marker style, used everywhere**.
- Score: small mono badge, success-green, `tabular-nums` (e.g. `0.87`).

### 2.5 AI Q&A interface

- Panel header: "Ask DevDocs" + repo context + model/format badge, right-aligned meta.
- Input: textarea (min 92px, `resize: vertical`), placeholder is a **concrete example**
  ("Ask a question about this repo, e.g. how is auth handled?") — never a chat greeting.
- Streaming state (§8.3): a quiet status row, not a typing animation.
- Answer: rendered markdown (headings ≤ H3, lists, inline code, blockquotes) at
  `--text-secondary`, emphasis at `--text-primary`, inline code as accent-tinted mono.
- Citations (§2.6) always follow the answer, separated by a hairline divider.

### 2.6 Source citations

- Block label: "Sources · N" (overline, `--text-muted`).
- Each citation: row card — 32px bordered file-icon square, `file.ts` mono primary,
  meta line in mono `--text-muted` (`src/services · TypeScript · :42–58 · 0.87`),
  and an external "Open in GitHub" link (accent-tinted, the only accent in the row).
- Hover: border → `--border-hover`, background → `--bg-hover`. No lift.
- Degraded range (no line numbers available): show `—` instead of hiding the source.

### 2.7 Results & snippets

Snippet body: mono 12.5px, `--text-secondary`, `pre-wrap`, max-height ~220px, styled
vertical scrollbar. Show surrounding context lines around the match (context over
length). Long paths ellipsize with a `title` tooltip.

### 2.8 Loading states

Defined fully in §8. Product rule: **keep the previous content on screen**; overlay
skeletons only where new content will land, never block the page with a modal.

---

## 3. Code Visual Language

The single most important visual layer. It must read as **real developer tooling**.

### 3.1 Code block chrome

| Property | Value |
|---|---|
| Background | `--bg-inset` |
| Border | 1px `--border-strong`, `--radius-md` (8px) |
| Header bar | `--bg-surface`, hairline bottom border; language label (mono 11.5px, uppercase, `--text-muted`) + copy button right |
| Copy button | ghost, 12px; swaps to "Copied" (success green + check) for ~1.6s |
| Font | JetBrains Mono 13px, line-height 1.6, `font-feature-settings` for ligatures off (code) |
| Scroll | horizontal `overflow-x: auto`; thin 8px scrollbar, `--border-strong` thumb |

### 3.2 Syntax highlighting

Token palette (GitHub-dark lineage, **no purple** — see brand kit §10.2):

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

Rules: colors aid scanning, never shout; keyword vs. function stay distinguishable;
the mapping is global (answers, search snippets, mock, file viewer).

### 3.3 Line numbers

- Right-aligned gutter, width 4ch, `--text-faint`, `tabular-nums`, mono 12.5px.
- Gutter separated from code by a 1px hairline (`--border-faint`) or 12px clear gap —
  pick one and stay consistent.
- The active/current line number highlights to `--text-secondary` + accent gutter line
  (a 2px accent bar at the left edge) only in full-file views.

### 3.4 File paths

- Mono 12.5–13px; directory segments `--text-muted`, basename `--text-primary`.
- Separators `/` (dimmed) — no colored icons inline unless part of a tree.
- Paths are selectable and copyable; truncate with ellipsis + `title`, never wrap
  mid-segment.
- In breadcrumbs, ` › ` separators in `--text-faint`.

### 3.5 Selection & highlighted lines

| State | Treatment |
|---|---|
| Text selection in code | `--accent-soft` background over the text (selection color mirrors the app accent, not the OS default) |
| Search match | `--accent-soft` background + 2px `--accent-underline` under the match |
| Active/highlighted line (file view) | `--bg-hover` row fill + 2px accent left bar + line number brightened — never a full accent background |
| Diff additions / deletions (if introduced) | `--green-soft` / `--red-soft` row fills with 2px left bars, matching semantic tokens |

### 3.6 Never

- ❌ No gradient backgrounds inside code blocks
- ❌ No rounded pill code chips
- ❌ No glow around highlighted lines
- ❌ No purple tokens
- ❌ No animated typing effect inside code

---

## 4. Cards

Cards are **used intentionally**, and only where a bounded, self-contained unit exists:
a feature, a source citation, a suggested question. They are **not** the default
container for every piece of information.

### 4.1 Card spec

| Property | Value |
|---|---|
| Radius | `--radius-lg` (10px) |
| Border | 1px `--border` |
| Background | `--bg-surface` |
| Shadow | none by default; `--shadow-sm` only inside floating layers |
| Padding | 24px (20px in dense/compact views) |
| Hover (interactive only) | border → `--border-hover`, bg → `--bg-hover`; **no lift, no translate, no glow** |
| Header | Title (17px/600) left; `--text-muted` meta right |

### 4.2 When to use a card

- A self-contained feature or concept (Features grid)
- A source citation in the sources list
- A suggested-question chip group
- A panel that groups related form controls (analyzer form, search panel)

### 4.3 When NOT to use a card

- Search result rows → bordered **list rows**, not cards (they scroll densely)
- Repository stats → a **data table/stat block**, not three identical cards
- Navigation → never cards
- Metadata, timestamps, badges → inline, not carded
- A single answer → a panel, not a card
- Never turn a whole screen into a "card of cards" dashboard

### 4.4 Dense list rows (search results, sources)

- Full-width rows, 12px padding, 8px gap, `--bg-elevated` when hovered, hairline
  dividers or 1px borders — the distinction from cards is: **rows flow and scroll**,
  cards sit still in a grid.

---

## 5. Navigation

### 5.1 Bar

- Sticky, 60px (56px mobile), `--bg-elevated`, single hairline bottom border
  (`--border-faint`). Translucent backdrop-blur only over scrolling content — no
  decorative glass.
- Left → center → right layout: **brand · links · spacer · status + actions**.

### 5.2 Logo

- 30px rounded-square mark (`--radius-md`), `--bg-surface` fill, `--border-strong`,
  containing the mono `</>` glyph in accent. Wordmark "DevDocs **AI**" at 16.5px/700,
  `--text-primary` with `AI` in `--accent-text`.
- Mark is flat — no gradient tile, no glow. The accent glyph is the only color.

### 5.3 Navigation links

- Row padding 8×12px, `--radius-sm`, `--text-secondary`, weight 500, 14.5px.
- Hover: `--bg-hover` + `--text-primary`. Active/current: `--accent-text`.
- 4px gap between links; no underline indicators, no animated pills.

### 5.4 GitHub action

- Ghost button (32px small variant), GitHub mark icon 15px + "GitHub", `--bg-surface`
  fill, `--border-strong`. Hover: `--bg-hover` + `--border-hover`. Opens externally —
  always `target="_blank"` with `rel="noreferrer"`.

### 5.5 Primary CTA (in nav)

- One flat accent button, 32–36px, `--text-on-accent`. Only appears when a primary
  action makes sense at global scope (e.g. "Analyze repo"); otherwise the nav has no
  CTA and the hero owns the primary action.

### 5.6 Mobile navigation (≤768px)

- Hamburger (40×40, bordered square) toggles a **flat elevated panel** that slides in
  under the bar: full-width stacked links (12×14px rows), then the GitHub action, then
  the CTA. Panel = `--bg-elevated` + hairline bottom border + `--shadow-lg`.
- No hamburger-to-X morph animation, no drawer slide, no overlay dim.

---

## 6. Background

Backgrounds support hierarchy; they never compete with content. **No large
distracting gradient blobs.**

### 6.1 App background

- Base `--bg` everywhere. Panels change surface tone (`--bg-elevated`,
  `--bg-surface`), not hue.
- **Hairline grid** (optional, hero only): 1px `--border-faint` grid masked to fade
  within ~70% of the hero height — it reads as *paper for code*, not a "tech grid".
  Zero opacity in the center is not required, but the mask must keep it quiet.

### 6.2 Allowed background treatments (pick at most one per view)

| Treatment | Rule |
|---|---|
| Hairline grid | Hero only, masked to fade, `--border-faint` |
| Top lighting | One radial overlay from `rgba(255,255,255,0.03)` at the very top, fading by 40vh — never colored |
| Subtle noise | 2–3% luminance noise over the page, static (no animation) |
| Flat `--bg` | Always the fallback; most product screens use this alone |

### 6.3 Forbidden

- ❌ Radial color washes (purple/blue blobs)
- ❌ Grids that run full-page behind content
- ❌ Animated backgrounds, parallax, scrolling gradient
- ❌ Grain that shimmers or moves
- ❌ Colored vignettes or "aurora" treatments

---

## 7. Empty States

Every empty state is an **invitation to act**, structurally identical:

```
        ┌──────────┐        ← 48px bordered square icon (file/terminal/search)
        │   icon   │
        └──────────┘
        Title (15.5px, 650, primary)
        One line, `--text-muted`, max ~40ch.
        [ Suggested action ]   ← ghost or primary, exactly one
```

Empty states live in `--bg-elevated` wells with dashed `--border-strong` borders —
**dashed signals "empty container", solid signals "content"**.

### 7.1 No repository connected

- Icon: link/terminal. Title: "No repository connected". Line: "Connect a GitHub
  repository to search and ask questions about its code."
- Action: "Connect a repository" (primary) + optional example-repo chips (`owner/repo`
  in mono) as quick starts.

### 7.2 No search results

- Icon: search. Title: "No results for “query”". Line: "Nothing matched in
  `owner/repo`. Try a different term, a symbol name, or a broader phrase."
- Action: "Clear filters" (ghost). Never a confetti/fun message.

### 7.3 No AI response yet

- Icon: terminal/prompt. Title: "Ask about this codebase". Line: "Questions are
  answered from `owner/repo` with sources you can open."
- Action: suggested question chips (mono, `--bg-surface`, hover accent border).

### 7.4 No indexed files

- Icon: file/clock. Title: "No files indexed yet". Line: "This repository hasn't been
  indexed. Start an analysis to make its code searchable."
- Action: "Start analysis" (primary). Include the last state ("Indexing stopped at
  512/1,284 files") in mono when a partial run exists.

---

## 8. Loading States

Loading should feel like **real infrastructure processing** — with counts, file paths,
and honest progress — not a generic spinner.

### 8.1 Repository indexing

- Vertical step list, each step with icon, label, and a **mono detail line of real
  values**:
  - `Fetching` · "clone `github.com/owner/repository`"
  - `Analyzing` · "1,284 files · 42% TypeScript"
  - `Chunking` · "chunk 512/1,284"
  - `Embedding` · "embedding chunk 512/1,284"
  - `Indexing` · "writing to vector index"
- Step visuals: done = green check; active = accent ring + subtle pulse; pending =
  faint dot. Rail = 1px `--border-strong` between steps.
- Skeleton for the results area behind the steps: exact-shape shimmer blocks.

### 8.2 Search loading

- Keep the query and repo context visible. The results area shows 3–5 skeleton rows
  matching the real row shape (header line 40% + body lines 90/70%) with the 1.5s
  shimmer. The search button swaps its icon for a 15px accent spinner — the label
  stays "Search" (label persistence is the craft detail).
- No full-screen spinner, no "loading…" text.

### 8.3 AI response loading

- A quiet status row replaces the button: mono text like `Analyzing src/services/rag.ts …`
  with a three-dot pulse at `--accent`. Show the real artifact being analyzed when
  available.
- The question stays visible above. No shimmering chat avatar, no typing bubbles.
- **The answer panel reserves layout** so the answer appearing doesn't shift the page.

### 8.4 Motion & reduced motion

- Shimmer 1.5s, step pulse 1.8s, dot pulse 1.2s — all killed under
  `prefers-reduced-motion`, replaced by opacity-only indicators.

---

## 9. Error States

Errors follow one structure and always answer three questions — **what happened, what
the user can do, whether retrying is possible**.

### 9.1 Anatomy

```
   ┌──┐
   │⚠ │  icon (red, no glow)
   └──┘
   Title — what happened, specific and honest
   "Failed to index owner/repo (GitHub rate limit)."
   Body  — what the user can do
   "Re-authenticate or wait a few minutes, then retry."
   [ Retry ] [ Open docs ]     ← actions; Retry ghost-primary, docs tertiary
```

- Fill: `--red-soft`; border: `--red-border`; `--radius-md`; icon 15px `--red`.
- Title 13.5px/600 `--text-primary`; body 13.5px `--text-secondary`.
- **Retry is a first-class action**, not a footnote. Retrying is always possible unless
  it isn't — then say so ("Retry will be available once the backend is back online").
- Inline field errors (§9.3 of brand kit) use the same anatomy without the panel.

### 9.2 Error copy rules

- Specific, not theatrical: "Failed to index `owner/repo` (rate limit)" not
  "Oops! Something went wrong."
- Never blame the user: no "you typed this wrong" tone.
- When the error is transient, say so; when it's permanent, say what to change.

### 9.3 Placement

- Analyzer/search errors: inline, stacked directly under the failing control.
- Q&A errors: inline in the Q&A panel, between input and answer area.
- Global failures (backend offline): a slim, dismissible banner under the nav
  (status dot + message + "Retry") — not a blocking modal.

---

## 10. Responsive Design

### 10.1 Desktop (≥1024px)

- Full three-pane workspace; nav shows all links + GitHub action.
- Hero workspace mock at 3-column, max-width 1200px.
- Marketing grids: 3-col features.

### 10.2 Tablet (768–1024px)

- Workspace collapses to **two panes**: tree column hides behind a "Files" toggle;
  main + inspector remain side by side. Inspector narrows to ~340px.
- Features grid 2-col. Hero mock drops the analysis pane (tree + code only) or stacks
  panes; hero type scales via `clamp`.
- Nav: keep links if space allows; otherwise swap to hamburger.

### 10.3 Mobile (≤768px)

- Single column. Panes stack: tree as a full-width expandable section, main content,
  inspector below.
- Nav: hamburger → flat panel (§5.6).
- Hero: workspace mock becomes one pane (code preview) with a compact status strip —
  never a cramped 3-column miniature. Hero input goes full-width with a stacked,
  full-width Analyze button.
- Forms/QA actions: full-width buttons; QA meta moves above the button row.
- Grids collapse to 1-col; spacing drops to 48px sections / 16px gutters.
- Touch: hit targets ≥44px for icon-only controls; table-like stat rows reflow into
  stacked label/value pairs.

### 10.4 Shared rules

- Content never touches screen edges (gutters ≥16px).
- Long mono strings ellipsize rather than scroll horizontally on mobile.
- No "hover-dependent" controls (all actions also reachable by tap).
- Test breakpoints with real data (long paths, many results) — layout must degrade
  gracefully, not break.

---

## 11. Visual Quality Rule

> **Every design decision must answer: "Would this look normal inside a serious $10k
> developer SaaS product?" If it wouldn't, it doesn't ship.**

### 11.1 The test, applied

| Decision | Pass? |
|---|---|
| Flat accent primary button | ✅ Linear, Vercel, GitHub all look like this |
| Radial purple glow behind the hero | ❌ No serious tool ships a glow |
| Gradient headline text | ❌ Marketing-slides pattern, not tooling |
| Rows instead of cards for search results | ✅ GitHub code search, Sourcegraph |
| GitHub-dark syntax palette, no purple | ✅ Every real editor |
| Three-dot pulse while analyzing | ✅ Feels like CI running, not a chatbot |
| "Failed to index (rate limit)" with Retry | ✅ Error copy a senior engineer would write |
| Confetti on indexing complete | ❌ Rejected before the discussion starts |

### 11.2 Final gate before any change is reviewed

- [ ] Uses tokens from `brand-kit.md` — nothing hard-coded
- [ ] One accent color per view, applied for meaning (§6.6 of brand kit)
- [ ] No gradients, glows, blobs, glass, or hover-lift
- [ ] Every state defined: empty, loading, error, disabled, focus
- [ ] Real data renders correctly (long paths, dense results, mobile widths)
- [ ] Contrast ≥ 4.5:1 for text; visible `:focus-visible`
- [ ] `prefers-reduced-motion` honored
- [ ] Would look boring-next-to-Linear — which is the point

---

*DevDocs AI · Visual Direction v1.0 · Design reference only. No application code,
backend, API, RAG, ingestion, embeddings, search, or authentication behavior is changed
by this document.*
